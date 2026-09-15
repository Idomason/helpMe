import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  getMonnifyTransfer,
  getMonnifyMode,
  initializeMonnifyTransaction,
  initiateMonnifyTransfer,
  listMonnifyBanks,
  monnifyConfigured,
  validateMonnifyAccount,
  verifyMonnifySignature,
  verifyMonnifyTransaction,
} from '../config/monnify.js';
import { assessWithdrawal, isFailedTransfer, isSuccessfulTransfer, quoteCollectionFee, toKobo, toNaira } from '../utils/walletPolicy.js';

const reference = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
const asWallet = (row = {}) => ({
  id: row.id,
  availableKobo: Number(row.available_kobo || 0),
  withdrawableKobo: Number(row.withdrawable_kobo || 0),
  committedKobo: Number(row.committed_kobo || 0),
  available: toNaira(row.available_kobo || 0),
  withdrawable: toNaira(row.withdrawable_kobo || 0),
  committed: toNaira(row.committed_kobo || 0),
  status: row.status || 'active',
});

const collectionFee = (amountKobo) => quoteCollectionFee(amountKobo, process.env.MONNIFY_COLLECTION_FEE_PERCENT, process.env.MONNIFY_COLLECTION_FEE_FLAT);
const withdrawalFee = () => Math.max(0, toKobo(process.env.MONNIFY_WITHDRAWAL_FEE || 0));

const ensureWallet = async (userId) => {
  await supabase.from('wallets').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });
  const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  if (error) throw error;
  return data;
};

const creditTopup = async (intent, transaction) => {
  if (intent.status === 'paid') return intent;
  const providerStatus = String(transaction.paymentStatus || transaction.status || '').toUpperCase();
  const paidKobo = toKobo(transaction.amountPaid ?? transaction.amount ?? 0);
  if (providerStatus !== 'PAID' || paidKobo !== Number(intent.total_kobo) || String(transaction.currencyCode || transaction.currency || 'NGN') !== 'NGN') {
    return intent;
  }
  const { error: creditError } = await supabase.rpc('wallet_credit', {
    p_user_id: intent.user_id,
    p_amount_kobo: intent.amount_kobo,
    p_withdrawable_kobo: 0,
    p_entry_type: 'wallet_topup',
    p_idempotency_key: `topup:${intent.reference}`,
    p_reference: intent.reference,
    p_entity_type: 'payment_intent',
    p_entity_id: intent.id,
    p_provider: 'monnify',
    p_metadata: { feeKobo: intent.fee_kobo, providerReference: transaction.transactionReference || null },
  });
  if (creditError) throw creditError;
  if (Number(intent.fee_kobo) > 0) {
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', intent.user_id).single();
    await supabase.from('wallet_entries').upsert({
      wallet_id: wallet.id,
      user_id: intent.user_id,
      entry_type: 'collection_fee',
      available_delta_kobo: 0,
      withdrawable_delta_kobo: 0,
      committed_delta_kobo: 0,
      available_after_kobo: wallet.available_kobo,
      withdrawable_after_kobo: wallet.withdrawable_kobo,
      committed_after_kobo: wallet.committed_kobo,
      reference: intent.reference,
      entity_type: 'payment_intent',
      entity_id: intent.id,
      provider: 'monnify',
      idempotency_key: `topup:${intent.reference}:fee`,
      metadata: { feeKobo: intent.fee_kobo },
    }, { onConflict: 'idempotency_key', ignoreDuplicates: true });
  }
  const { data } = await supabase.from('payment_intents').update({
    status: 'paid',
    provider_reference: transaction.transactionReference || intent.provider_reference,
    paid_at: transaction.paidOn || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', intent.id).select('*').single();
  return data;
};

export const getWallet = catchAsync(async (req, res) => {
  const wallet = await ensureWallet(req.user._id);
  const [entriesResult, withdrawalsResult] = await Promise.all([
    supabase.from('wallet_entries').select('*').eq('user_id', req.user._id).order('created_at', { ascending: false }).limit(8),
    supabase.from('withdrawals').select('id,amount_kobo,fee_kobo,status,reference,created_at').eq('user_id', req.user._id).order('created_at', { ascending: false }).limit(5),
  ]);
  return res.json({
    status: 'success',
    data: {
      wallet: asWallet(wallet),
      recentEntries: entriesResult.data || [],
      recentWithdrawals: withdrawalsResult.data || [],
      fees: {
        collectionPercent: Number(process.env.MONNIFY_COLLECTION_FEE_PERCENT || 0),
        collectionFlat: Number(process.env.MONNIFY_COLLECTION_FEE_FLAT || 0),
        withdrawal: Number(process.env.MONNIFY_WITHDRAWAL_FEE || 0),
      },
      providerReady: monnifyConfigured(),
      disbursementsReady: monnifyConfigured() && Boolean(process.env.MONNIFY_WALLET_ACCOUNT_NUMBER),
      providerMode: getMonnifyMode(),
    },
  });
});

export const listEntries = catchAsync(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  let query = supabase.from('wallet_entries').select('*').eq('user_id', req.user._id)
    .order('created_at', { ascending: false }).limit(limit);
  if (req.query.type) query = query.eq('entry_type', req.query.type);
  const { data, error } = await query;
  if (error) throw error;
  return res.json({ status: 'success', data: data || [] });
});

export const createTopup = catchAsync(async (req, res, next) => {
  if (!monnifyConfigured()) return next(new AppError('Monnify payments are not configured yet', 503));
  const amountKobo = toKobo(req.body.amount);
  if (!Number.isSafeInteger(amountKobo) || amountKobo < 10000)
    return next(new AppError('Minimum top-up is ₦100', 400));
  const feeKobo = collectionFee(amountKobo);
  const totalKobo = amountKobo + feeKobo;
  const paymentReference = reference('topup');
  const { data: intent, error } = await supabase.from('payment_intents').insert({
    user_id: req.user._id,
    purpose: 'wallet_topup',
    amount_kobo: amountKobo,
    fee_kobo: feeKobo,
    total_kobo: totalKobo,
    reference: paymentReference,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }).select('*').single();
  if (error) return next(new AppError(error.message, 400));
  try {
    const appUrl = process.env.PUBLIC_APP_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const checkout = await initializeMonnifyTransaction({
      amount: toNaira(totalKobo),
      email: req.userRow.email,
      name: req.userRow.name,
      reference: paymentReference,
      description: 'HelpMe wallet top-up',
      // Monnify appends its own `paymentReference` query parameter after payment.
      // Keep this URL query-free so the provider cannot produce a malformed
      // `...?tab=finance&paymentReference=x?paymentReference=x` callback.
      redirectUrl: `${appUrl}/dashboard`,
    });
    const checkoutUrl = checkout.checkoutUrl || checkout.checkoutURL;
    await supabase.from('payment_intents').update({
      checkout_url: checkoutUrl,
      provider_reference: checkout.transactionReference || null,
      updated_at: new Date().toISOString(),
    }).eq('id', intent.id);
    return res.status(201).json({
      status: 'success',
      data: {
        reference: paymentReference,
        amount: toNaira(amountKobo),
        fee: toNaira(feeKobo),
        total: toNaira(totalKobo),
        checkoutUrl,
      },
    });
  } catch (error_) {
    await supabase.from('payment_intents').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', intent.id);
    return next(new AppError(`Could not start Monnify checkout: ${error_.message}`, 502));
  }
});

export const verifyTopup = catchAsync(async (req, res, next) => {
  const { data: intent } = await supabase.from('payment_intents').select('*')
    .eq('reference', req.params.reference).eq('user_id', req.user._id).single();
  if (!intent) return next(new AppError('Top-up not found', 404));
  if (intent.status !== 'paid') {
    const transaction = await verifyMonnifyTransaction(intent.reference);
    await creditTopup(intent, transaction);
  }
  const { data: refreshed } = await supabase.from('payment_intents').select('*').eq('id', intent.id).single();
  return res.json({ status: 'success', data: refreshed });
});

export const listBanks = catchAsync(async (_req, res) => {
  const banks = await listMonnifyBanks();
  return res.json({ status: 'success', data: Array.isArray(banks) ? banks : banks.banks || [] });
});

export const nameEnquiry = catchAsync(async (req, res, next) => {
  const { accountNumber, bankCode } = req.body;
  if (!/^\d{10}$/.test(String(accountNumber || '')) || !bankCode)
    return next(new AppError('Enter a valid 10-digit account number and bank', 400));
  const account = await validateMonnifyAccount({ accountNumber, bankCode });
  return res.json({
    status: 'success',
    data: { accountName: account.accountName, accountNumber: account.accountNumber || accountNumber, bankCode },
  });
});

export const saveBankAccount = catchAsync(async (req, res, next) => {
  const { accountNumber, bankCode, bankName } = req.body;
  if (!/^\d{10}$/.test(String(accountNumber || '')) || !bankCode)
    return next(new AppError('Enter a valid 10-digit account number and bank', 400));
  const verified = await validateMonnifyAccount({ accountNumber, bankCode });
  if (!verified?.accountName) return next(new AppError('Monnify could not verify this account', 400));
  await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', req.user._id);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('bank_accounts').upsert({
    user_id: req.user._id,
    account_name: verified.accountName,
    account_number: accountNumber,
    bank_code: bankCode,
    bank_name: bankName || null,
    is_default: true,
    provider: 'monnify',
    account_name_verified: true,
    verified_at: now,
    changed_at: now,
    recipient_code: null,
  }, { onConflict: 'user_id,account_number,bank_code' }).select('*').single();
  if (error) return next(new AppError(error.message, 400));
  return res.json({ status: 'success', data });
});

export const getBankAccount = catchAsync(async (req, res) => {
  const { data } = await supabase.from('bank_accounts').select('*')
    .eq('user_id', req.user._id).eq('is_default', true).maybeSingle();
  return res.json({ status: 'success', data: data || null });
});

const markWithdrawalSuccessful = async (withdrawal, providerStatus) => {
  const total = Number(withdrawal.amount_kobo) + Number(withdrawal.fee_kobo);
  const { error } = await supabase.rpc('wallet_finalize_commitment', {
    p_user_id: withdrawal.user_id,
    p_amount_kobo: total,
    p_entry_type: 'withdrawal_completed',
    p_idempotency_key: `withdrawal:${withdrawal.reference}:complete`,
    p_reference: withdrawal.reference,
    p_entity_type: 'withdrawal',
    p_entity_id: withdrawal.id,
  });
  if (error) throw error;
  await supabase.from('withdrawals').update({ status: 'successful', provider_status: providerStatus, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', withdrawal.id);
};

export const processWithdrawal = async (withdrawal) => {
  const { data: bank } = await supabase.from('bank_accounts').select('*').eq('id', withdrawal.bank_account_id).single();
  await supabase.from('withdrawals').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', withdrawal.id);
  const transfer = await initiateMonnifyTransfer({
    amount: toNaira(withdrawal.amount_kobo),
    reference: withdrawal.reference,
    narration: 'HelpMe wallet withdrawal',
    accountNumber: bank.account_number,
    bankCode: bank.bank_code,
    accountName: bank.account_name,
  });
  const providerStatus = String(transfer.status || transfer.paymentStatus || 'PENDING').toUpperCase();
  await supabase.from('withdrawals').update({ provider_reference: transfer.transactionReference || null, provider_status: providerStatus, updated_at: new Date().toISOString() }).eq('id', withdrawal.id);
  if (isSuccessfulTransfer(providerStatus)) await markWithdrawalSuccessful(withdrawal, providerStatus);
};

export const createWithdrawal = catchAsync(async (req, res, next) => {
  if (!monnifyConfigured() || !process.env.MONNIFY_WALLET_ACCOUNT_NUMBER)
    return next(new AppError('Monnify disbursements are not configured yet', 503));
  const amountKobo = toKobo(req.body.amount);
  if (!Number.isSafeInteger(amountKobo) || amountKobo < 100000)
    return next(new AppError('Minimum withdrawal is ₦1,000', 400));
  const [{ data: profile }, { data: bank }, wallet] = await Promise.all([
    supabase.from('helper_profiles').select('verification_status').eq('user_id', req.user._id).maybeSingle(),
    supabase.from('bank_accounts').select('*').eq('user_id', req.user._id).eq('is_default', true).maybeSingle(),
    ensureWallet(req.user._id),
  ]);
  if (profile?.verification_status !== 'verified') return next(new AppError('Identity verification is required to withdraw', 403));
  if (!bank?.account_name_verified) return next(new AppError('Add and verify a payout account first', 400));
  const feeKobo = withdrawalFee();
  const totalKobo = amountKobo + feeKobo;
  if (Number(wallet.withdrawable_kobo) < totalKobo) return next(new AppError('Insufficient withdrawable balance', 400));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase.from('withdrawals').select('amount_kobo')
    .eq('user_id', req.user._id).gte('created_at', since).in('status', ['queued','processing','successful']);
  const dailyKobo = (recent || []).reduce((sum, item) => sum + Number(item.amount_kobo), 0);
  const { needsReview, reason: riskReason } = assessWithdrawal({ amountKobo, rollingDailyKobo: dailyKobo, bankChangedAt: bank.changed_at });
  const withdrawalReference = reference('wd');
  const { data: withdrawal, error } = await supabase.from('withdrawals').insert({
    user_id: req.user._id,
    wallet_id: wallet.id,
    bank_account_id: bank.id,
    amount_kobo: amountKobo,
    fee_kobo: feeKobo,
    reference: withdrawalReference,
    status: needsReview ? 'pending_review' : 'queued',
    risk_reason: riskReason,
  }).select('*').single();
  if (error) return next(new AppError(error.message, 400));
  const { error: debitError } = await supabase.rpc('wallet_hold_withdrawal', {
    p_user_id: req.user._id,
    p_amount_kobo: totalKobo,
    p_entry_type: 'withdrawal_hold',
    p_idempotency_key: `withdrawal:${withdrawalReference}:hold`,
    p_reference: withdrawalReference,
    p_entity_id: withdrawal.id,
    p_metadata: { feeKobo },
  });
  if (debitError) {
    await supabase.from('withdrawals').delete().eq('id', withdrawal.id);
    return next(new AppError(debitError.message, 400));
  }
  if (feeKobo > 0) {
    const { data: heldWallet } = await supabase.from('wallets').select('*').eq('user_id', req.user._id).single();
    await supabase.from('wallet_entries').upsert({
      wallet_id: heldWallet.id, user_id: req.user._id, entry_type: 'withdrawal_fee',
      available_delta_kobo: 0, withdrawable_delta_kobo: 0, committed_delta_kobo: 0,
      available_after_kobo: heldWallet.available_kobo, withdrawable_after_kobo: heldWallet.withdrawable_kobo,
      committed_after_kobo: heldWallet.committed_kobo, reference: withdrawalReference,
      entity_type: 'withdrawal', entity_id: withdrawal.id, provider: 'monnify',
      idempotency_key: `withdrawal:${withdrawalReference}:fee`, metadata: { feeKobo },
    }, { onConflict: 'idempotency_key', ignoreDuplicates: true });
  }
  if (!needsReview) {
    try { await processWithdrawal(withdrawal); } catch (error_) {
      await supabase.from('withdrawals').update({ status: 'processing', failure_reason: error_.message, updated_at: new Date().toISOString() }).eq('id', withdrawal.id);
    }
  }
  const { data: refreshed } = await supabase.from('withdrawals').select('*').eq('id', withdrawal.id).single();
  return res.status(201).json({ status: 'success', data: refreshed });
});

export const listWithdrawals = catchAsync(async (req, res) => {
  const { data } = await supabase.from('withdrawals').select('*').eq('user_id', req.user._id).order('created_at', { ascending: false }).limit(100);
  return res.json({ status: 'success', data: data || [] });
});

export const handleMonnifyWebhook = catchAsync(async (req, res) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);
  const signature = req.headers['monnify-signature'];
  const signatureValid = verifyMonnifySignature(rawBody, signature);
  if (process.env.NODE_ENV === 'production' && !signatureValid) return res.status(401).send('Invalid signature');
  const payload = req.body || {};
  const eventData = payload.eventData || payload.data || {};
  const paymentReference = eventData.paymentReference;
  const transferReference = eventData.reference;
  const eventType = payload.eventType || payload.event || 'unknown';
  const eventKey = crypto.createHash('sha256').update(rawBody).digest('hex');
  const { data: inserted } = await supabase.from('webhook_events').insert({
    provider: 'monnify', event_key: eventKey, event_type: eventType,
    reference: paymentReference || transferReference || null, signature_valid: signatureValid, payload,
  }).select('id').maybeSingle();
  if (!inserted) return res.status(200).send('ok');
  try {
    if (paymentReference) {
      const { data: intent } = await supabase.from('payment_intents').select('*').eq('reference', paymentReference).maybeSingle();
      if (intent) await creditTopup(intent, await verifyMonnifyTransaction(paymentReference));
    }
    if (transferReference) {
      const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('reference', transferReference).maybeSingle();
      if (withdrawal) {
        const transfer = await getMonnifyTransfer(transferReference);
        const providerStatus = String(transfer.status || 'PENDING').toUpperCase();
        if (isSuccessfulTransfer(providerStatus)) await markWithdrawalSuccessful(withdrawal, providerStatus);
        else if (isFailedTransfer(providerStatus) && !['failed','reversed'].includes(withdrawal.status)) {
          const total = Number(withdrawal.amount_kobo) + Number(withdrawal.fee_kobo);
          await supabase.rpc('wallet_refund_commitment', {
            p_user_id: withdrawal.user_id, p_amount_kobo: total, p_withdrawable_kobo: total,
            p_entry_type: 'withdrawal_reversal', p_idempotency_key: `withdrawal:${withdrawal.reference}:reversal`,
            p_reference: withdrawal.reference, p_entity_type: 'withdrawal', p_entity_id: withdrawal.id,
          });
          await supabase.from('withdrawals').update({ status: providerStatus === 'REVERSED' ? 'reversed' : 'failed', provider_status: providerStatus, updated_at: new Date().toISOString() }).eq('id', withdrawal.id);
        }
      }
    }
    await supabase.from('webhook_events').update({ status: 'processed', processed_at: new Date().toISOString() }).eq('id', inserted.id);
  } catch (error_) {
    await supabase.from('webhook_events').update({ status: 'failed', error: error_.message }).eq('id', inserted.id);
  }
  return res.status(200).send('ok');
});

export const adminListWithdrawals = catchAsync(async (req, res) => {
  let query = supabase.from('withdrawals').select('*, users(id,name,email), bank_accounts(account_name,account_number,bank_name)')
    .order('created_at', { ascending: false }).limit(200);
  if (req.query.status) query = query.eq('status', req.query.status);
  const { data } = await query;
  return res.json({ status: 'success', data: data || [] });
});

export const adminPaymentOverview = catchAsync(async (_req, res) => {
  const [wallets, intents, withdrawals, events] = await Promise.all([
    supabase.from('wallets').select('*, users(id,name,email)').order('updated_at', { ascending: false }).limit(100),
    supabase.from('payment_intents').select('id,user_id,amount_kobo,fee_kobo,total_kobo,reference,status,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('withdrawals').select('id,user_id,amount_kobo,fee_kobo,reference,status,provider_status,risk_reason,created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('webhook_events').select('id,event_type,reference,signature_valid,status,error,created_at').order('created_at', { ascending: false }).limit(50),
  ]);
  return res.json({ status: 'success', data: { wallets: wallets.data || [], intents: intents.data || [], withdrawals: withdrawals.data || [], webhookEvents: events.data || [] } });
});

export const adminSetWalletStatus = catchAsync(async (req, res, next) => {
  if (!['active', 'frozen'].includes(req.body.status)) return next(new AppError('Wallet status must be active or frozen', 400));
  const { data, error } = await supabase.from('wallets').update({ status: req.body.status, updated_at: new Date().toISOString() })
    .eq('user_id', req.params.userId).select('*').single();
  if (error || !data) return next(new AppError('Wallet not found', 404));
  return res.json({ status: 'success', message: `Wallet ${req.body.status}`, data: asWallet(data) });
});

export const listNotifications = catchAsync(async (req, res) => {
  const { data, error } = await supabase.from('member_notifications').select('*').eq('user_id', req.user._id)
    .order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return res.json({ status: 'success', data: data || [] });
});

export const readNotification = catchAsync(async (req, res, next) => {
  const { data, error } = await supabase.from('member_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', req.params.id).eq('user_id', req.user._id)
    .select('id,read_at').maybeSingle();
  if (error) throw error;
  if (!data) return next(new AppError('Notification not found', 404));
  return res.json({ status: 'success', data });
});

export const readAllNotifications = catchAsync(async (req, res) => {
  const readAt = new Date().toISOString();
  const { data, error } = await supabase.from('member_notifications')
    .update({ read_at: readAt })
    .eq('user_id', req.user._id).is('read_at', null)
    .select('id');
  if (error) throw error;
  return res.json({ status: 'success', data: { updated: data?.length || 0, read_at: readAt } });
});

export const adminApproveWithdrawal = catchAsync(async (req, res, next) => {
  const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', req.params.id).single();
  if (!withdrawal) return next(new AppError('Withdrawal not found', 404));
  if (withdrawal.status !== 'pending_review') return next(new AppError('Withdrawal is not awaiting review', 400));
  await supabase.from('withdrawals').update({ status: 'queued', reviewed_by: req.user._id, reviewed_at: new Date().toISOString() }).eq('id', withdrawal.id);
  try { await processWithdrawal({ ...withdrawal, status: 'queued' }); } catch (error_) {
    await supabase.from('withdrawals').update({ status: 'processing', failure_reason: error_.message }).eq('id', withdrawal.id);
  }
  return res.json({ status: 'success', message: 'Withdrawal approved for processing' });
});

export const adminRejectWithdrawal = catchAsync(async (req, res, next) => {
  const { data: withdrawal } = await supabase.from('withdrawals').select('*').eq('id', req.params.id).single();
  if (!withdrawal) return next(new AppError('Withdrawal not found', 404));
  if (withdrawal.status !== 'pending_review') return next(new AppError('Withdrawal is not awaiting review', 400));
  const total = Number(withdrawal.amount_kobo) + Number(withdrawal.fee_kobo);
  await supabase.rpc('wallet_refund_commitment', {
    p_user_id: withdrawal.user_id, p_amount_kobo: total, p_withdrawable_kobo: total,
    p_entry_type: 'withdrawal_rejected', p_idempotency_key: `withdrawal:${withdrawal.reference}:rejected`,
    p_reference: withdrawal.reference, p_entity_type: 'withdrawal', p_entity_id: withdrawal.id,
  });
  await supabase.from('withdrawals').update({ status: 'rejected', reviewed_by: req.user._id, reviewed_at: new Date().toISOString(), failure_reason: req.body.reason || null }).eq('id', withdrawal.id);
  return res.json({ status: 'success', message: 'Withdrawal rejected and funds returned' });
});

export const reconcilePendingWithdrawals = async () => {
  if (!monnifyConfigured()) return;
  const { data: withdrawals } = await supabase.from('withdrawals').select('*')
    .eq('provider', 'monnify').eq('status', 'processing').limit(50);
  for (const withdrawal of withdrawals || []) {
    try {
      const transfer = await getMonnifyTransfer(withdrawal.reference);
      const providerStatus = String(transfer.status || 'PENDING').toUpperCase();
      if (isSuccessfulTransfer(providerStatus)) {
        await markWithdrawalSuccessful(withdrawal, providerStatus);
      } else if (isFailedTransfer(providerStatus)) {
        const total = Number(withdrawal.amount_kobo) + Number(withdrawal.fee_kobo);
        await supabase.rpc('wallet_refund_commitment', {
          p_user_id: withdrawal.user_id, p_amount_kobo: total, p_withdrawable_kobo: total,
          p_entry_type: 'withdrawal_reversal', p_idempotency_key: `withdrawal:${withdrawal.reference}:reversal`,
          p_reference: withdrawal.reference, p_entity_type: 'withdrawal', p_entity_id: withdrawal.id,
        });
        await supabase.from('withdrawals').update({
          status: providerStatus === 'REVERSED' ? 'reversed' : 'failed', provider_status: providerStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', withdrawal.id);
      }
    } catch { /* keep ambiguous transfers pending for the next reconciliation pass */ }
  }
};
