import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformEscrow, transformDispute } from '../utils/transformers.js';
import {
  initializeTransaction,
  verifyTransaction,
  createTransferRecipient,
  initiateTransfer,
  listBanks,
  verifyWebhookSignature,
  toKobo,
  refundTransaction,
} from '../config/paystack.js';
import { evaluateAwards } from './portfolioController.js';

const genRef = (prefix) =>
  `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

const ledger = async (escrowId, event, { amount, actorId, meta } = {}) => {
  await supabase.from('escrow_ledger').insert({
    escrow_id: escrowId,
    event,
    amount: amount ?? null,
    actor_id: actorId ?? null,
    meta: meta ?? null,
  });
};

// ─── Fund a request from the member wallet ───
export const fundEscrow = catchAsync(async (req, res, next) => {
  const { amount, purpose = 'request', requestId, giveawayId, beneficiaryId, message, isAnonymous } = req.body;
  const funder = req.userRow;

  if (!amount || Number(amount) <= 0)
    return next(new AppError('A valid amount is required', 400));
  if (purpose === 'request' && !requestId)
    return next(new AppError('requestId is required for request escrow', 400));
  if (purpose !== 'request')
    return next(new AppError('Giveaways are funded when they are created', 400));

  // Resolve beneficiary for request escrow (the request owner)
  let resolvedBeneficiary = beneficiaryId || null;
  if (purpose === 'request') {
    const { data: reqRow } = await supabase
      .from('help_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();
    if (!reqRow) return next(new AppError('Request not found', 404));
    resolvedBeneficiary = reqRow.user_id;
    if (resolvedBeneficiary === funder.id)
      return next(new AppError('You cannot fund your own request', 400));
  }

  const amountKobo = toKobo(amount);
  const reference = genRef('wallet_esc');

  const { data: escrow, error } = await supabase
    .from('escrow_transactions')
    .insert({
      reference,
      funder_id: funder.id,
      beneficiary_id: resolvedBeneficiary,
      request_id: purpose === 'request' ? requestId : null,
      giveaway_id: purpose === 'giveaway' ? giveawayId : null,
      purpose,
      amount: Number(amount),
      amount_kobo: amountKobo,
      provider: 'wallet',
      status: 'held',
      held_at: new Date().toISOString(),
      message: message ? String(message).slice(0, 500) : null,
      is_anonymous: !!isAnonymous,
    })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  const { data: committed, error: commitError } = await supabase.rpc('wallet_commit', {
    p_user_id: funder.id,
    p_amount_kobo: amountKobo,
    p_entry_type: 'request_funding',
    p_idempotency_key: `request-funding:${escrow.id}`,
    p_reference: reference,
    p_entity_type: 'request',
    p_entity_id: requestId,
    p_metadata: { escrowId: escrow.id, anonymous: !!isAnonymous },
  });
  if (commitError) {
    await supabase.from('escrow_transactions').delete().eq('id', escrow.id);
    if (/insufficient/i.test(commitError.message)) {
      const { data: wallet } = await supabase.from('wallets').select('available_kobo').eq('user_id', funder.id).maybeSingle();
      const shortfall = Math.max(0, amountKobo - Number(wallet?.available_kobo || 0)) / 100;
      return res.status(402).json({ status: 'fail', message: 'Insufficient wallet balance', data: { shortfall, resume: { purpose: 'request', requestId, amount: Number(amount), message, isAnonymous: !!isAnonymous } } });
    }
    return next(new AppError(commitError.message, 400));
  }
  const source = committed || {};
  await supabase.from('escrow_transactions').update({
    funded_nonwithdrawable_kobo: Number(source.nonwithdrawableKobo || 0),
    funded_withdrawable_kobo: Number(source.withdrawableKobo || 0),
  }).eq('id', escrow.id);
  await ledger(escrow.id, 'held', { amount: Number(amount), actorId: funder.id, meta: { provider: 'wallet' } });

  return res.status(201).json({
    status: 'success',
    data: {
      escrow: transformEscrow({ ...escrow, provider: 'wallet', status: 'held' }),
      authorizationUrl: null,
    },
  });
});

// ─── Manual verify (fallback to webhook) ───
export const verifyEscrowPayment = catchAsync(async (req, res, next) => {
  const { reference } = req.params;
  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('reference', reference)
    .single();
  if (!escrow) return next(new AppError('Escrow not found', 404));

  if (escrow.status === 'held' || escrow.status === 'released')
    return res.status(200).json({ status: 'success', data: transformEscrow(escrow) });

  const tx = await verifyTransaction(reference);
  if (tx.status === 'success') {
    const { data: updated } = await supabase
      .from('escrow_transactions')
      .update({ status: 'held', held_at: new Date().toISOString() })
      .eq('id', escrow.id)
      .select('*')
      .single();
    await ledger(escrow.id, 'held', { amount: escrow.amount });
    return res.status(200).json({ status: 'success', data: transformEscrow(updated) });
  }

  return res.status(200).json({ status: 'success', data: transformEscrow(escrow) });
});

// ─── Paystack webhook ───
export const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;
  const type = event.event;
  const data = event.data || {};
  const reference = data.reference;

  if (type === 'charge.success' && reference) {
    const { data: escrow } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('reference', reference)
      .single();
    if (escrow && escrow.status === 'pending') {
      await supabase
        .from('escrow_transactions')
        .update({ status: 'held', held_at: new Date().toISOString() })
        .eq('id', escrow.id);
      await ledger(escrow.id, 'held', { amount: escrow.amount, meta: { via: 'webhook' } });

      // Activate a monetary giveaway once its escrow is funded
      if (escrow.purpose === 'giveaway' && escrow.giveaway_id) {
        await supabase
          .from('giveaways')
          .update({ is_funded: true, is_active: true, escrow_id: escrow.id })
          .eq('id', escrow.giveaway_id);
      }
    }
  }

  if (type === 'transfer.success' && reference) {
    const { data: escrow } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('paystack_transfer_ref', reference)
      .single();
    if (escrow && escrow.status === 'releasing') {
      await supabase
        .from('escrow_transactions')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', escrow.id);
      await ledger(escrow.id, 'released', { amount: escrow.amount, meta: { via: 'webhook' } });
      evaluateAwards(escrow.funder_id).catch(() => {});
    }
  }

  if ((type === 'transfer.failed' || type === 'transfer.reversed') && reference) {
    const { data: escrow } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('paystack_transfer_ref', reference)
      .single();
    if (escrow && escrow.status === 'releasing') {
      await supabase
        .from('escrow_transactions')
        .update({ status: 'held' })
        .eq('id', escrow.id);
      await ledger(escrow.id, 'release_failed', { meta: { type } });
    }
  }

  return res.status(200).send('ok');
});

// ─── Release escrow to beneficiary (money out) ───
export const releaseEscrow = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { note } = req.body;

  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', id)
    .single();
  if (!escrow) return next(new AppError('Escrow not found', 404));
  if (escrow.provider === 'wallet')
    return next(new AppError('Wallet contributions are released through the request claim review flow', 400));

  // Only funder or admin can release
  const isAdmin = req.user.role === 'admin';
  if (escrow.funder_id !== req.user._id && !isAdmin)
    return next(new AppError('Only the funder or an admin can release this escrow', 403));

  if (escrow.status !== 'held')
    return next(new AppError(`Escrow must be held to release (current: ${escrow.status})`, 400));
  if (!escrow.beneficiary_id)
    return next(new AppError('No beneficiary set for this escrow', 400));

  // Get beneficiary's default bank account
  const { data: bank } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', escrow.beneficiary_id)
    .eq('is_default', true)
    .single();
  if (!bank)
    return next(new AppError('Beneficiary has not added a payout bank account', 400));

  // Ensure a recipient code exists
  let recipientCode = bank.recipient_code;
  if (!recipientCode) {
    try {
      const recipient = await createTransferRecipient({
        name: bank.account_name,
        accountNumber: bank.account_number,
        bankCode: bank.bank_code,
      });
      recipientCode = recipient.recipient_code;
      await supabase.from('bank_accounts').update({ recipient_code: recipientCode }).eq('id', bank.id);
    } catch (e) {
      return next(new AppError(`Could not create payout recipient: ${e.message}`, 502));
    }
  }

  const transferRef = genRef('trf');
  await supabase
    .from('escrow_transactions')
    .update({ status: 'releasing', release_note: note || null, released_by: req.user._id, paystack_transfer_ref: transferRef })
    .eq('id', escrow.id);

  try {
    const transfer = await initiateTransfer({
      amountKobo: toKobo(escrow.amount),
      recipientCode,
      reference: transferRef,
      reason: note || 'HelpMe escrow release',
    });

    await supabase
      .from('escrow_transactions')
      .update({ paystack_transfer_code: transfer.transfer_code })
      .eq('id', escrow.id);

    // If transfer is immediately successful (OTP disabled), mark released
    if (transfer.status === 'success') {
      await supabase
        .from('escrow_transactions')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', escrow.id);
      await ledger(escrow.id, 'released', { amount: escrow.amount, actorId: req.user._id });
      evaluateAwards(escrow.funder_id).catch(() => {});
    } else {
      await ledger(escrow.id, 'release_queued', { amount: escrow.amount, actorId: req.user._id, meta: { status: transfer.status } });
    }
  } catch (e) {
    await supabase.from('escrow_transactions').update({ status: 'held' }).eq('id', escrow.id);
    return next(new AppError(`Transfer failed: ${e.message}`, 502));
  }

  const { data: updated } = await supabase.from('escrow_transactions').select('*').eq('id', escrow.id).single();
  return res.status(200).json({ status: 'success', message: 'Escrow release initiated', data: transformEscrow(updated) });
});

// ─── Refund escrow to funder (admin/manual) ───
export const refundEscrow = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { data: escrow } = await supabase.from('escrow_transactions').select('*').eq('id', id).single();
  if (!escrow) return next(new AppError('Escrow not found', 404));

  if (req.user.role !== 'admin' && escrow.funder_id !== req.user._id)
    return next(new AppError('Not authorized to refund', 403));
  if (!['held', 'disputed'].includes(escrow.status))
    return next(new AppError(`Cannot refund escrow in status ${escrow.status}`, 400));

  if (escrow.provider === 'wallet') {
    const amountKobo = Number(escrow.amount_kobo || Math.round(Number(escrow.amount) * 100));
    const { error } = await supabase.rpc('wallet_refund_commitment', {
      p_user_id: escrow.funder_id,
      p_amount_kobo: amountKobo,
      p_withdrawable_kobo: Number(escrow.funded_withdrawable_kobo || 0),
      p_entry_type: 'request_refund',
      p_idempotency_key: `escrow-refund:${escrow.id}`,
      p_reference: escrow.reference,
      p_entity_type: escrow.purpose,
      p_entity_id: escrow.request_id || escrow.giveaway_id,
    });
    if (error) return next(new AppError(error.message, 400));
  } else {
    try {
      await refundTransaction({ reference: escrow.reference, amountKobo: toKobo(escrow.amount) });
    } catch (error) {
      return next(new AppError(`Paystack refund failed: ${error.message}`, 502));
    }
  }

  await supabase
    .from('escrow_transactions')
    .update({ status: 'refunded', refunded_at: new Date().toISOString() })
    .eq('id', escrow.id);
  await ledger(escrow.id, 'refunded', { amount: escrow.amount, actorId: req.user._id });

  return res.status(200).json({ status: 'success', message: 'Escrow refunded to funder' });
});

// ─── Disputes ───
export const raiseDispute = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason, details } = req.body;
  if (!reason) return next(new AppError('A dispute reason is required', 400));

  const { data: escrow } = await supabase.from('escrow_transactions').select('*').eq('id', id).single();
  if (!escrow) return next(new AppError('Escrow not found', 404));
  if (![escrow.funder_id, escrow.beneficiary_id].includes(req.user._id))
    return next(new AppError('Only parties to this escrow can raise a dispute', 403));
  if (!['held'].includes(escrow.status))
    return next(new AppError(`Can only dispute held escrow (current: ${escrow.status})`, 400));

  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({ escrow_id: escrow.id, raised_by: req.user._id, reason, details: details || null })
    .select('*')
    .single();
  if (error) return next(new AppError(error.message, 400));

  await supabase.from('escrow_transactions').update({ status: 'disputed' }).eq('id', escrow.id);
  await ledger(escrow.id, 'disputed', { actorId: req.user._id, meta: { reason } });

  return res.status(201).json({ status: 'success', message: 'Dispute raised', data: transformDispute(dispute) });
});

// ADMIN: list disputes
export const listDisputes = catchAsync(async (req, res) => {
  const status = req.query.status || 'open';
  const { data } = await supabase
    .from('disputes')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return res.status(200).json({ status: 'success', data: (data || []).map(transformDispute) });
});

// ─── Read endpoints ───
export const listMyEscrows = catchAsync(async (req, res) => {
  const uid = req.user._id;
  const { data } = await supabase
    .from('escrow_transactions')
    .select('*')
    .or(`funder_id.eq.${uid},beneficiary_id.eq.${uid}`)
    .order('created_at', { ascending: false });
  return res.status(200).json({ status: 'success', data: (data || []).map(transformEscrow) });
});

export const getEscrowForRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { data } = await supabase
    .from('escrow_transactions')
    .select('*, users!escrow_transactions_funder_id_fkey(id,name)')
    .eq('request_id', requestId)
    .in('status', ['held', 'releasing', 'released', 'disputed'])
    .order('created_at', { ascending: false });
  return res.status(200).json({ status: 'success', data: (data || []).map(transformEscrow) });
});

// Amount raised so far for a request = sum of all escrows counted toward the goal
// (held/releasing/released — i.e. money that has actually been paid in and not refunded).
// Also returns the most recent donors (respecting anonymity) for a "recent supporters" list.
export const getRequestFundingSummary = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { data } = await supabase
    .from('escrow_transactions')
    .select('*, users!escrow_transactions_funder_id_fkey(id,name)')
    .eq('request_id', requestId)
    .in('status', ['held', 'releasing', 'released'])
    .order('created_at', { ascending: false });

  const escrows = data || [];
  const raised = escrows.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const contributors = escrows.length;
  const donors = escrows.slice(0, 20).map(transformEscrow);

  return res.status(200).json({
    status: 'success',
    data: { raised, contributors, donors },
  });
});

// ─── Bank account (payout) management ───
export const saveBankAccount = catchAsync(async (req, res, next) => {
  const { accountName, accountNumber, bankCode, bankName } = req.body;
  if (!accountName || !accountNumber || !bankCode)
    return next(new AppError('accountName, accountNumber and bankCode are required', 400));

  // unset previous defaults
  await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', req.user._id);

  const { data, error } = await supabase
    .from('bank_accounts')
    .upsert(
      {
        user_id: req.user._id,
        account_name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        bank_name: bankName || null,
        is_default: true,
        recipient_code: null,
      },
      { onConflict: 'user_id,account_number,bank_code' },
    )
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));
  return res.status(200).json({ status: 'success', message: 'Payout account saved', data: { id: data.id } });
});

export const getMyBankAccount = catchAsync(async (req, res) => {
  const { data } = await supabase
    .from('bank_accounts')
    .select('id,account_name,account_number,bank_code,bank_name,is_default')
    .eq('user_id', req.user._id)
    .eq('is_default', true)
    .single();
  return res.status(200).json({ status: 'success', data: data || null });
});

export const getBanks = catchAsync(async (req, res) => {
  const banks = await listBanks();
  return res.status(200).json({
    status: 'success',
    data: (banks || []).map((b) => ({ name: b.name, code: b.code })),
  });
});
