import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformUser } from '../utils/transformers.js';
import { refundTransaction, toKobo } from '../config/paystack.js';

const count = async (table, filters = {}) => {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  Object.entries(filters).forEach(([k, v]) => (q = q.eq(k, v)));
  const { count: c } = await q;
  return c || 0;
};

const sumAmount = async (status) => {
  const { data } = await supabase
    .from('escrow_transactions')
    .select('amount')
    .eq('status', status);
  return (data || []).reduce((t, r) => t + Number(r.amount), 0);
};

// ─── Platform overview stats ───
export const getAdminStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalMembers,
    verifiedMembers,
    totalRequests,
    activeRequests,
    totalGiveaways,
    pendingVerifications,
    openDisputes,
    openReports,
    heldEscrows,
  ] = await Promise.all([
    count('users', { active: true }),
    count('users', { role: 'member' }),
    count('helper_profiles', { verification_status: 'verified' }),
    count('help_requests'),
    count('help_requests', { status: 'active' }),
    count('giveaways', { is_deleted: false }),
    count('verification_requests', { status: 'pending' }),
    count('disputes', { status: 'open' }),
    count('reports', { status: 'open' }),
    count('escrow_transactions', { status: 'held' }),
  ]);

  const [heldVolume, releasedVolume] = await Promise.all([
    sumAmount('held'),
    sumAmount('released'),
  ]);

  return res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalMembers,
      verifiedMembers,
      // kept for frontend backward-compat during rollout
      verifiedHelpers: verifiedMembers,
      totalRequests,
      activeRequests,
      totalGiveaways,
      pendingVerifications,
      openDisputes,
      openReports,
      heldEscrows,
      heldVolume,
      releasedVolume,
    },
  });
});

// ─── Users management ───
export const listUsers = catchAsync(async (req, res) => {
  const { q, role } = req.query;
  let query = supabase
    .from('users')
    .select('id,name,email,role,active,created_at,profile_img_url')
    .order('created_at', { ascending: false })
    .limit(200);
  if (role) query = query.eq('role', role);
  if (q) query = query.ilike('name', `%${q}%`);
  const { data } = await query;
  return res.status(200).json({ status: 'success', data: (data || []).map(transformUser) });
});

export const setUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['member', 'admin'].includes(role))
    return next(new AppError('Invalid role', 400));
  const { error } = await supabase.from('users').update({ role }).eq('id', id);
  if (error) return next(new AppError(error.message, 400));
  return res.status(200).json({ status: 'success', message: `Role updated to ${role}` });
});

export const setUserActive = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { active } = req.body;
  if (id === req.user._id) return next(new AppError('You cannot deactivate yourself', 400));
  const { error } = await supabase.from('users').update({ active: !!active }).eq('id', id);
  if (error) return next(new AppError(error.message, 400));
  return res.status(200).json({ status: 'success', message: active ? 'User activated' : 'User banned' });
});

// ─── Reports moderation ───
export const listReports = catchAsync(async (req, res) => {
  const status = req.query.status || 'open';
  const { data } = await supabase
    .from('reports')
    .select('*, users!reports_reporter_id_fkey(id,name,email)')
    .eq('status', status)
    .order('created_at', { ascending: false });
  return res.status(200).json({ status: 'success', data: data || [] });
});

export const resolveReport = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // resolved | dismissed
  if (!['resolved', 'dismissed', 'reviewing'].includes(status))
    return next(new AppError('Invalid status', 400));
  await supabase
    .from('reports')
    .update({ status, resolved_by: req.user._id, resolved_at: new Date().toISOString() })
    .eq('id', id);
  return res.status(200).json({ status: 'success', message: `Report ${status}` });
});

// ─── Dispute resolution (release or refund the escrow) ───
export const resolveDispute = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { decision, note } = req.body; // 'release' | 'refund' | 'dismiss'

  const { data: dispute } = await supabase.from('disputes').select('*').eq('id', id).single();
  if (!dispute) return next(new AppError('Dispute not found', 404));

  const { data: escrow } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', dispute.escrow_id)
    .single();
  if (!escrow) return next(new AppError('Escrow not found', 404));

  if (decision === 'refund') {
    if (escrow.provider === 'wallet') {
      const amountKobo = Number(escrow.amount_kobo || Math.round(Number(escrow.amount) * 100));
      const { error } = await supabase.rpc('wallet_refund_commitment', {
        p_user_id: escrow.funder_id,
        p_amount_kobo: amountKobo,
        p_withdrawable_kobo: Number(escrow.funded_withdrawable_kobo || 0),
        p_entry_type: 'dispute_refund',
        p_idempotency_key: `dispute:${dispute.id}:refund`,
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
    await supabase.from('escrow_ledger').insert({ escrow_id: escrow.id, event: 'refunded', amount: escrow.amount, actor_id: req.user._id, meta: { via: 'dispute' } });
    await supabase
      .from('disputes')
      .update({ status: 'resolved_refund', resolved_by: req.user._id, resolution_note: note || null, resolved_at: new Date().toISOString() })
      .eq('id', id);
    return res.status(200).json({ status: 'success', message: 'Dispute resolved — funds refunded to funder' });
  }

  if (decision === 'release') {
    // Return escrow to held so the standard release flow (with Paystack transfer) can run
    await supabase.from('escrow_transactions').update({ status: 'held' }).eq('id', escrow.id);
    await supabase
      .from('disputes')
      .update({ status: 'resolved_release', resolved_by: req.user._id, resolution_note: note || null, resolved_at: new Date().toISOString() })
      .eq('id', id);
    return res.status(200).json({ status: 'success', message: 'Dispute resolved — escrow set back to held for release' });
  }

  // dismiss
  await supabase.from('escrow_transactions').update({ status: 'held' }).eq('id', escrow.id);
  await supabase
    .from('disputes')
    .update({ status: 'dismissed', resolved_by: req.user._id, resolution_note: note || null, resolved_at: new Date().toISOString() })
    .eq('id', id);
  return res.status(200).json({ status: 'success', message: 'Dispute dismissed' });
});
