import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import sendEmail from '../utils/email.js';

const REVIEW_MS = 48 * 60 * 60 * 1000;

const notifyContributors = async (escrows, requestId, reviewEndsAt) => {
  const ids = [...new Set(escrows.map((item) => item.funder_id))];
  if (!ids.length) return;
  await supabase.from('member_notifications').insert(ids.map((userId) => ({
    user_id: userId,
    type: 'request_claim_review',
    title: 'A request you supported has claimed funds',
    body: `Review the claim before ${new Date(reviewEndsAt).toLocaleString('en-NG')}.`,
    link: `/requests/${requestId}`,
  })));
  if (!process.env.RESEND_API_KEY) return;
  const { data: users } = await supabase.from('users').select('email').in('id', ids);
  await Promise.allSettled((users || []).map((user) => sendEmail({
    email: user.email,
    subject: 'Review a HelpMe request payout claim',
    message: `The owner of a request you supported has claimed the funds. You have 48 hours to review it in your HelpMe dashboard.`,
  })));
};

export const createRequestClaim = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { data: request } = await supabase.from('help_requests').select('*').eq('id', requestId).single();
  if (!request) return next(new AppError('Request not found', 404));
  if (request.user_id !== req.user._id && req.user.role !== 'admin')
    return next(new AppError('Only the request owner can claim its funding', 403));
  const { data: escrows } = await supabase.from('escrow_transactions').select('*')
    .eq('request_id', requestId).eq('provider', 'wallet').eq('status', 'held').is('request_claim_id', null);
  const eligible = escrows || [];
  const amountKobo = eligible.reduce((sum, item) => sum + Number(item.amount_kobo || Math.round(Number(item.amount) * 100)), 0);
  if (!amountKobo) return next(new AppError('There are no unclaimed wallet contributions', 400));
  const { data: allContributions } = await supabase.from('escrow_transactions').select('amount_kobo,amount')
    .eq('request_id', requestId).in('status', ['held', 'released', 'releasing', 'disputed']);
  const totalFundedKobo = (allContributions || []).reduce((sum, item) => sum + Number(item.amount_kobo || Math.round(Number(item.amount) * 100)), 0);
  const goalReached = totalFundedKobo >= Math.round(Number(request.amount || 0) * 100);
  const deadlinePassed = request.deadline && new Date(request.deadline).getTime() <= Date.now();
  if (!goalReached && !deadlinePassed)
    return next(new AppError('Funds can be claimed when the goal is reached or the deadline passes', 400));
  const reviewEndsAt = new Date(Date.now() + REVIEW_MS).toISOString();
  const { data: claim, error } = await supabase.from('request_claims').insert({
    request_id: requestId,
    claimant_id: request.user_id,
    amount_kobo: amountKobo,
    review_ends_at: reviewEndsAt,
  }).select('*').single();
  if (error) return next(new AppError(error.message, 400));
  await supabase.from('escrow_transactions').update({ request_claim_id: claim.id }).in('id', eligible.map((item) => item.id));
  await notifyContributors(eligible, requestId, reviewEndsAt);
  return res.status(201).json({ status: 'success', message: 'Claim submitted for 48-hour review', data: claim });
});

export const getRequestClaim = catchAsync(async (req, res) => {
  const { data: claim } = await supabase.from('request_claims').select('*')
    .eq('request_id', req.params.requestId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  let contribution = null;
  if (req.user?._id) {
    const { data } = await supabase.from('escrow_transactions').select('id,status,amount,request_claim_id')
      .eq('request_id', req.params.requestId).eq('funder_id', req.user._id).order('created_at', { ascending: false });
    contribution = data || [];
  }
  return res.json({ status: 'success', data: { claim: claim || null, contributions: contribution } });
});

export const processDueRequestClaims = async () => {
  const { data: claims } = await supabase.from('request_claims').select('*')
    .in('status', ['reviewing','partially_released']).lte('review_ends_at', new Date().toISOString()).limit(50);
  for (const claim of claims || []) {
    const { data: escrows } = await supabase.from('escrow_transactions').select('*')
      .eq('request_claim_id', claim.id).eq('provider', 'wallet').eq('status', 'held');
    for (const escrow of escrows || []) {
      const amountKobo = Number(escrow.amount_kobo || Math.round(Number(escrow.amount) * 100));
      const { error } = await supabase.rpc('wallet_settle_escrow', {
        p_funder_id: escrow.funder_id,
        p_beneficiary_id: claim.claimant_id,
        p_amount_kobo: amountKobo,
        p_entry_type: 'request_reward',
        p_idempotency_key: `request-claim:${claim.id}:escrow:${escrow.id}`,
        p_reference: escrow.reference,
        p_entity_type: 'request',
        p_entity_id: claim.request_id,
      });
      if (!error) {
        await supabase.from('escrow_transactions').update({ status: 'released', released_at: new Date().toISOString() }).eq('id', escrow.id).eq('status', 'held');
        await supabase.from('escrow_ledger').insert({ escrow_id: escrow.id, event: 'released_to_wallet', amount: escrow.amount, meta: { claimId: claim.id } });
      }
    }
    const { count: disputed } = await supabase.from('escrow_transactions').select('id', { count: 'exact', head: true })
      .eq('request_claim_id', claim.id).eq('status', 'disputed');
    await supabase.from('request_claims').update({
      status: disputed ? 'partially_released' : 'released',
      released_at: disputed ? null : new Date().toISOString(),
    }).eq('id', claim.id);
  }
};
