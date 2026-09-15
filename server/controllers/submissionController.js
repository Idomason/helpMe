import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformSubmission } from '../utils/transformers.js';

// Participant submits proof for a giveaway challenge
export const submitToGiveaway = catchAsync(async (req, res, next) => {
  const { giveawayId } = req.params;
  const { proofText, proofUrl, proofPath } = req.body;

  // Policy: participant must have an active account
  if (req.userRow.active === false)
    return next(new AppError('Your account must be active to participate', 403));

  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', giveawayId)
    .single();
  if (!giveaway) return next(new AppError('Giveaway not found', 404));
  if (giveaway.is_deleted) return next(new AppError('Giveaway not available', 400));

  // Monetary challenges must be funded to accept submissions
  if (giveaway.prize_amount > 0 && !giveaway.is_funded)
    return next(new AppError('This challenge is not funded yet', 400));

  if (giveaway.created_by === req.user._id)
    return next(new AppError('You cannot submit to your own giveaway', 400));

  const { data: submission, error } = await supabase
    .from('giveaway_submissions')
    .upsert(
      {
        giveaway_id: giveawayId,
        participant_id: req.user._id,
        proof_text: proofText || null,
        proof_url: proofUrl || null,
        proof_path: proofPath || null,
        status: 'submitted',
      },
      { onConflict: 'giveaway_id,participant_id' },
    )
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  return res.status(201).json({
    status: 'success',
    message: 'Submission received',
    data: transformSubmission(submission),
  });
});

// List submissions for a giveaway (owner or admin)
export const listSubmissions = catchAsync(async (req, res, next) => {
  const { giveawayId } = req.params;

  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('created_by')
    .eq('id', giveawayId)
    .single();
  if (!giveaway) return next(new AppError('Giveaway not found', 404));

  const isOwner = giveaway.created_by === req.user._id;
  if (!isOwner && req.user.role !== 'admin')
    return next(new AppError('Only the giveaway owner can view submissions', 403));

  const { data } = await supabase
    .from('giveaway_submissions')
    .select('*, users!giveaway_submissions_participant_id_fkey(id,name,email)')
    .eq('giveaway_id', giveawayId)
    .order('created_at', { ascending: false });

  return res.status(200).json({
    status: 'success',
    data: (data || []).map(transformSubmission),
  });
});

// Get my submission status for a giveaway
export const getMySubmission = catchAsync(async (req, res) => {
  const { giveawayId } = req.params;
  const { data } = await supabase
    .from('giveaway_submissions')
    .select('*')
    .eq('giveaway_id', giveawayId)
    .eq('participant_id', req.user._id)
    .single();
  return res.status(200).json({ status: 'success', data: transformSubmission(data) });
});

// Owner rejects a submission
export const rejectSubmission = catchAsync(async (req, res, next) => {
  const { submissionId } = req.params;
  const { reviewNote } = req.body;

  const { data: submission } = await supabase
    .from('giveaway_submissions')
    .select('*, giveaways!giveaway_submissions_giveaway_id_fkey(created_by)')
    .eq('id', submissionId)
    .single();
  if (!submission) return next(new AppError('Submission not found', 404));

  const ownerId = submission.giveaways?.created_by;
  if (ownerId !== req.user._id && req.user.role !== 'admin')
    return next(new AppError('Not authorized', 403));

  await supabase
    .from('giveaway_submissions')
    .update({
      status: 'rejected',
      review_note: reviewNote || null,
      reviewed_by: req.user._id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  return res.status(200).json({ status: 'success', message: 'Submission rejected' });
});

// Owner selects a winner. Each place gets an independent seven-day claim.
export const rewardSubmission = catchAsync(async (req, res, next) => {
  const { submissionId } = req.params;

  const { data: submission } = await supabase
    .from('giveaway_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();
  if (!submission) return next(new AppError('Submission not found', 404));

  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', submission.giveaway_id)
    .single();
  if (!giveaway) return next(new AppError('Giveaway not found', 404));

  if (giveaway.created_by !== req.user._id && req.user.role !== 'admin')
    return next(new AppError('Only the giveaway owner can reward', 403));

  if (!giveaway.financial_only || !giveaway.is_funded)
    return next(new AppError('Only funded financial giveaways can select winners', 400));
  const { count } = await supabase.from('giveaway_allocations').select('id', { count: 'exact', head: true })
    .eq('giveaway_id', giveaway.id).in('status', ['selected', 'claimed']);
  if (Number(count || 0) >= Number(giveaway.max_winners || 1))
    return next(new AppError('All winner places have already been allocated', 400));
  const { data: allocation, error } = await supabase.from('giveaway_allocations').insert({
    giveaway_id: giveaway.id,
    submission_id: submission.id,
    winner_id: submission.participant_id,
    amount_kobo: Number(giveaway.prize_per_winner_kobo || Math.round(Number(giveaway.prize_amount) * 100)),
    claim_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }).select('*').single();
  if (error) return next(new AppError(error.message, 400));

  await supabase
    .from('giveaway_submissions')
    .update({
      status: 'approved',
      reviewed_by: req.user._id,
      reviewed_at: new Date().toISOString(),
      escrow_id: giveaway.escrow_id,
    })
    .eq('id', submissionId);

  await supabase.from('member_notifications').insert({
    user_id: submission.participant_id,
    type: 'giveaway_winner',
    title: 'You won a financial giveaway',
    body: 'Claim your reward within seven days. It will be added to your withdrawable wallet.',
    link: `/giveaways/${giveaway.id}`,
  });
  return res.status(200).json({ status: 'success', message: 'Winner selected — awaiting reward claim', data: allocation });
});

export const claimGiveawayReward = catchAsync(async (req, res, next) => {
  const { data: allocation } = await supabase.from('giveaway_allocations')
    .select('*, giveaways(created_by,escrow_id,max_winners)').eq('id', req.params.allocationId).single();
  if (!allocation) return next(new AppError('Reward allocation not found', 404));
  if (allocation.winner_id !== req.user._id) return next(new AppError('This reward belongs to another member', 403));
  if (allocation.status !== 'selected') return next(new AppError(`Reward cannot be claimed in status ${allocation.status}`, 400));
  if (new Date(allocation.claim_expires_at).getTime() <= Date.now()) {
    await supabase.from('giveaway_allocations').update({ status: 'expired' }).eq('id', allocation.id).eq('status', 'selected');
    return next(new AppError('This claim has expired', 400));
  }
  const { error } = await supabase.rpc('wallet_settle_escrow', {
    p_funder_id: allocation.giveaways.created_by,
    p_beneficiary_id: req.user._id,
    p_amount_kobo: allocation.amount_kobo,
    p_entry_type: 'giveaway_reward',
    p_idempotency_key: `giveaway-allocation:${allocation.id}:claim`,
    p_reference: `allocation:${allocation.id}`,
    p_entity_type: 'giveaway',
    p_entity_id: allocation.giveaway_id,
  });
  if (error) return next(new AppError(error.message, 400));
  const now = new Date().toISOString();
  await supabase.from('giveaway_allocations').update({ status: 'claimed', claimed_at: now }).eq('id', allocation.id).eq('status', 'selected');
  await supabase.from('giveaway_submissions').update({ status: 'rewarded' }).eq('id', allocation.submission_id);
  const { count: claimed } = await supabase.from('giveaway_allocations').select('id', { count: 'exact', head: true })
    .eq('giveaway_id', allocation.giveaway_id).eq('status', 'claimed');
  if (Number(claimed || 0) >= Number(allocation.giveaways.max_winners || 1))
    await supabase.from('escrow_transactions').update({ status: 'released', released_at: now }).eq('id', allocation.giveaways.escrow_id);
  return res.json({ status: 'success', message: 'Reward added to your wallet' });
});

export const reassignExpiredReward = catchAsync(async (req, res, next) => {
  const { data: expired } = await supabase.from('giveaway_allocations').select('*, giveaways(created_by)')
    .eq('id', req.params.allocationId).single();
  if (!expired) return next(new AppError('Reward allocation not found', 404));
  if (expired.giveaways.created_by !== req.user._id && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  if (expired.status !== 'expired') return next(new AppError('Only expired rewards can be reassigned', 400));
  const { data: submission } = await supabase.from('giveaway_submissions').select('*')
    .eq('id', req.body.submissionId).eq('giveaway_id', expired.giveaway_id).single();
  if (!submission) return next(new AppError('Replacement submission not found', 404));
  const { data: replacement, error } = await supabase.from('giveaway_allocations').insert({
    giveaway_id: expired.giveaway_id, submission_id: submission.id, winner_id: submission.participant_id,
    amount_kobo: expired.amount_kobo,
    claim_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), replacement_for: expired.id,
  }).select('*').single();
  if (error) return next(new AppError(error.message, 400));
  await supabase.from('giveaway_allocations').update({ status: 'reassigned' }).eq('id', expired.id);
  await supabase.from('giveaway_submissions').update({ status: 'approved' }).eq('id', submission.id);
  return res.status(201).json({ status: 'success', message: 'Reward reassigned', data: replacement });
});

export const listMyRewardAllocations = catchAsync(async (req, res) => {
  const { data } = await supabase.from('giveaway_allocations').select('*, giveaways(title,image_url)')
    .eq('winner_id', req.user._id).order('created_at', { ascending: false });
  return res.json({ status: 'success', data: data || [] });
});

export const expireGiveawayClaims = async () => {
  await supabase.from('giveaway_allocations').update({ status: 'expired' })
    .eq('status', 'selected').lte('claim_expires_at', new Date().toISOString());
};
