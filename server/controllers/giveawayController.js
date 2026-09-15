import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformGiveaway } from '../utils/transformers.js';
import crypto from 'crypto';

const genRef = () => `giveaway_${Date.now()}_${crypto.randomBytes(5).toString('hex')}`;

export const getAllGiveaways = catchAsync(async (req, res, next) => {
  const { data: giveaways, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('is_deleted', false)
    .gt('prize_amount', 0)
    .order('created_at', { ascending: false });

  if (error) return next(new AppError('Failed to get giveaways', 500));

  const transformed = (giveaways || []).map(transformGiveaway);
  return res.status(200).json({ status: 'success', data: transformed });
});

export const createGiveaway = catchAsync(async (req, res, next) => {
  const { image, ...giveawayData } = req.body;
  if (!image) return next(new AppError('Image is required', 400));

  const prizeAmount = Number(giveawayData.prizePerWinner ?? giveawayData.prizeAmount) || 0;
  if (prizeAmount <= 0) return next(new AppError('Prize per winner must be greater than zero', 400));
  const isMonetary = true;
  const requirements = Array.isArray(giveawayData.requirements)
    ? giveawayData.requirements.map((item) => String(item).trim()).filter(Boolean)
    : String(giveawayData.requirements || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
  const maxWinners = Math.max(1, Math.min(100, Number(giveawayData.maxWinners) || 1));
  const winnerMode = maxWinners > 1 ? 'multiple' : 'single';
  const prizePerWinnerKobo = Math.round(prizeAmount * 100);
  const totalPrizeKobo = prizePerWinnerKobo * maxWinners;

  // Policy: monetary giveaways (real money via escrow) require a verified identity.
  // This is the anti-scam trust gate — anyone can create a free giveaway.
  if (isMonetary) {
    const { data: profile } = await supabase
      .from('helper_profiles')
      .select('verification_status')
      .eq('user_id', req.user._id)
      .single();

    if (profile?.verification_status !== 'verified') {
      return next(
        new AppError(
          'You must be a verified member to create a monetary giveaway. Complete verification in your profile first.',
          403,
        ),
      );
    }
  }

  // Create privately, commit the full purse, then publish.
  const { data: giveaway, error } = await supabase
    .from('giveaways')
    .insert({
      title: giveawayData.title,
      description: giveawayData.description,
      image_url: image?.url || null,
      image_path: image?.publicId || null,
      prizes: `₦${prizeAmount.toLocaleString()} per winner`,
      rules: null,
      requirements,
      category: giveawayData.category,
      tags: giveawayData.tags || [],
      location: giveawayData.location,
      start_date: giveawayData.startDate,
      end_date: giveawayData.endDate,
      prize_amount: prizeAmount,
      prize_per_winner_kobo: prizePerWinnerKobo,
      total_prize_kobo: totalPrizeKobo,
      financial_only: true,
      is_funded: false,
      is_active: false,
      giveaway_type: 'challenge',
      winner_mode: winnerMode,
      max_winners: maxWinners,
      created_by: req.user._id,
    })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  const fundingReference = genRef();
  const { data: committed, error: commitError } = await supabase.rpc('wallet_commit', {
    p_user_id: req.user._id,
    p_amount_kobo: totalPrizeKobo,
    p_entry_type: 'giveaway_funding',
    p_idempotency_key: `giveaway-funding:${giveaway.id}`,
    p_reference: fundingReference,
    p_entity_type: 'giveaway',
    p_entity_id: giveaway.id,
    p_metadata: { prizePerWinnerKobo, maxWinners },
  });
  if (commitError) {
    await supabase.from('giveaways').delete().eq('id', giveaway.id);
    if (/insufficient/i.test(commitError.message)) {
      const { data: wallet } = await supabase.from('wallets').select('available_kobo').eq('user_id', req.user._id).maybeSingle();
      return res.status(402).json({ status: 'fail', message: 'Top up your wallet to fund this giveaway', data: { shortfall: Math.max(0, totalPrizeKobo - Number(wallet?.available_kobo || 0)) / 100 } });
    }
    return next(new AppError(commitError.message, 400));
  }
  const { data: escrow, error: escrowError } = await supabase.from('escrow_transactions').insert({
    reference: fundingReference,
    funder_id: req.user._id,
    giveaway_id: giveaway.id,
    purpose: 'giveaway',
    amount: totalPrizeKobo / 100,
    amount_kobo: totalPrizeKobo,
    funded_nonwithdrawable_kobo: Number(committed?.nonwithdrawableKobo || 0),
    funded_withdrawable_kobo: Number(committed?.withdrawableKobo || 0),
    provider: 'wallet',
    status: 'held',
    held_at: new Date().toISOString(),
  }).select('id').single();
  if (escrowError) {
    await supabase.rpc('wallet_refund_commitment', {
      p_user_id: req.user._id, p_amount_kobo: totalPrizeKobo,
      p_withdrawable_kobo: Number(committed?.withdrawableKobo || 0),
      p_entry_type: 'giveaway_funding_rollback', p_idempotency_key: `giveaway-funding:${giveaway.id}:rollback`,
      p_reference: fundingReference, p_entity_type: 'giveaway', p_entity_id: giveaway.id,
    });
    await supabase.from('giveaways').delete().eq('id', giveaway.id);
    return next(new AppError('Could not secure the giveaway purse', 500));
  }
  const { data: published } = await supabase.from('giveaways').update({ is_funded: true, is_active: true, escrow_id: escrow.id })
    .eq('id', giveaway.id).select('*').single();

  return res.status(201).json({
    status: 'success',
    data: transformGiveaway(published),
    requiresFunding: false,
  });
});

export const getGiveaway = catchAsync(async (req, res, next) => {
  const { data: giveaway } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!giveaway) return next(new AppError('Giveaway not found', 404));

  return res.status(200).json({ status: 'success', data: transformGiveaway(giveaway) });
});

export const updateGiveaway = catchAsync(async (req, res, next) => {
  const { data: giveaway, error } = await supabase
    .from('giveaways')
    .update(req.body)
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error || !giveaway) return next(new AppError('Giveaway not found', 404));

  return res.status(200).json({ status: 'success', data: transformGiveaway(giveaway) });
});

export const deleteGiveaway = catchAsync(async (req, res, next) => {
  const { error } = await supabase
    .from('giveaways')
    .update({ is_deleted: true })
    .eq('id', req.params.id);

  if (error) return next(new AppError('Giveaway not found', 404));

  return res.status(204).json({ status: 'success' });
});
