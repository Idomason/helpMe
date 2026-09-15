import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformRequest, transformComment } from '../utils/transformers.js';

// Statuses that count toward "amount raised" — money actually paid in and not refunded.
const FUNDED_STATUSES = ['held', 'releasing', 'released'];

export const getAllRequests = catchAsync(async (req, res, next) => {
  const { data: allRequests } = await supabase
    .from('help_requests')
    .select('*')
    .neq('help_type', 'free_help')
    .order('created_at', { ascending: false });

  if (!allRequests || allRequests.length === 0)
    return res.status(200).json({ status: 'success', data: { requests: [] } });

  // Batch-fetch escrow contributions for all requests in one query instead of N+1.
  const requestIds = allRequests.map((r) => r.id);
  const { data: escrowRows } = await supabase
    .from('escrow_transactions')
    .select('request_id, amount')
    .in('request_id', requestIds)
    .in('status', FUNDED_STATUSES);

  const raisedByRequest = {};
  for (const e of escrowRows || []) {
    raisedByRequest[e.request_id] = (raisedByRequest[e.request_id] || 0) + Number(e.amount || 0);
  }

  const enriched = await Promise.all(
    allRequests.map(async (r) => {
      const { count: voteCount } = await supabase
        .from('request_votes')
        .select('id', { count: 'exact', head: true })
        .eq('request_id', r.id);

      const { data: userRow } = await supabase
        .from('users')
        .select('id,name,email')
        .eq('id', r.user_id)
        .single();

      return transformRequest({
        ...r,
        _user: userRow,
        _voteCount: voteCount || 0,
        _raised: raisedByRequest[r.id] || 0,
      });
    }),
  );

  return res.status(200).json({ status: 'success', data: { requests: enriched } });
});

export const createRequest = catchAsync(async (req, res, next) => {
  const { name, category, requestDescription, city, state, country, specificDetails, image } = req.body;

  if (!name || !category || !requestDescription)
    return next(new AppError('Missing required fields', 400));

  const { data: request, error } = await supabase
    .from('help_requests')
    .insert({
      user_id: req.user._id,
      name, category,
      request_description: requestDescription,
      city, state, country,
      amount: specificDetails?.amount ?? 0,
      deadline: specificDetails?.deadline ?? '',
      image_url: image?.url ?? null,
      image_path: image?.publicId ?? null,
    })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  return res.status(201).json({ status: 'success', data: { request: transformRequest(request) } });
});

export const getRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { data: request } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (!request) return next(new AppError('Request not found', 404));

  const { data: userRow } = await supabase
    .from('users')
    .select('id,name,email')
    .eq('id', request.user_id)
    .single();

  const { data: voteRows } = await supabase
    .from('request_votes')
    .select('user_id, users!request_votes_user_id_fkey(id,name)')
    .eq('request_id', id);

  const { data: commentRows } = await supabase
    .from('request_comments')
    .select('id,text,created_at,user_id,users!request_comments_user_id_fkey(id,name,email)')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  const { data: escrowRows } = await supabase
    .from('escrow_transactions')
    .select('amount')
    .eq('request_id', id)
    .in('status', FUNDED_STATUSES);

  const votes = (voteRows || []).map((v) => v.users || { _id: v.user_id });
  const comments = (commentRows || []).map(transformComment);
  const raised = (escrowRows || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return res.status(200).json({
    status: 'success',
    data: {
      request: transformRequest({
        ...request,
        _user: userRow,
        _votes: votes,
        _voteCount: votes.length,
        _comments: comments,
        _raised: raised,
      }),
    },
  });
});

export const updateOwnRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const { data: request } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (!request || request.user_id !== userId)
    return next(new AppError('You are not authorized', 403));

  const { name, category, requestDescription, city, state, country, specificDetails, image } = req.body;

  const { data: updated, error } = await supabase
    .from('help_requests')
    .update({
      name, category,
      request_description: requestDescription,
      city, state, country,
      amount: specificDetails?.amount,
      deadline: specificDetails?.deadline,
      image_url: image?.url,
      image_path: image?.publicId,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return next(new AppError('Request update failed', 400));

  return res.status(200).json({ status: 'success', message: 'Request update successful', data: { updatedRequest: transformRequest(updated) } });
});

export const deleteOwnRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const { data: request } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (!request || request.user_id !== userId)
    return next(new AppError('You are not authorized', 401));

  const { error } = await supabase.from('help_requests').delete().eq('id', id);
  if (error) return next(new AppError('Failed to delete request', 400));

  return res.status(200).json({ message: 'Request deleted successfully' });
});

export const voteRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const { data: request } = await supabase
    .from('help_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  if (!request) return next(new AppError('Request not found', 404));

  if (request.user_id === userId)
    return next(new AppError("You can't vote your own request", 400));

  const { data: existingVote } = await supabase
    .from('request_votes')
    .select('*')
    .eq('request_id', requestId)
    .eq('user_id', userId)
    .single();

  if (existingVote) {
    await supabase.from('request_votes').delete().eq('request_id', requestId).eq('user_id', userId);
    return res.status(200).json({ message: 'Vote removed successfully' });
  }

  const { error } = await supabase.from('request_votes').insert({ request_id: requestId, user_id: userId });
  if (error) return next(new AppError(error.message, 400));

  return res.status(200).json({ message: 'Vote added successfully' });
});

export const commentRequest = catchAsync(async (req, res, next) => {
  const { requestId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) return next(new AppError('Comment text is required', 400));

  const { data: commentRow, error } = await supabase
    .from('request_comments')
    .insert({ request_id: requestId, user_id: userId, text })
    .select('id,text,created_at,user_id,users!request_comments_user_id_fkey(id,name,email)')
    .single();

  if (error) return next(new AppError(error.message, 400));

  return res.status(201).json({ status: 'success', message: 'Commented successfully', data: transformComment(commentRow) });
});

export const editOwnComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  if (!text) return next(new AppError('Comment text is required', 400));

  const { data: comment } = await supabase
    .from('request_comments')
    .select('*')
    .eq('id', commentId)
    .single();
  if (!comment || comment.user_id !== userId)
    return next(new AppError('Comment not found or unauthorized', 404));

  const { data: updated, error } = await supabase
    .from('request_comments')
    .update({ text })
    .eq('id', commentId)
    .select('id,text,created_at,user_id,users!request_comments_user_id_fkey(id,name,email)')
    .single();
  if (error) return next(new AppError('Edit failed', 400));

  return res.status(200).json({ status: 'success', message: 'comment edited successfully', data: transformComment(updated) });
});

export const deleteOwnComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const { data: comment } = await supabase
    .from('request_comments')
    .select('*')
    .eq('id', commentId)
    .single();
  if (!comment || comment.user_id !== userId)
    return next(new AppError('Comment not found or unauthorized', 404));

  const { error } = await supabase.from('request_comments').delete().eq('id', commentId);
  if (error) return next(new AppError('Delete failed', 400));

  return res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
});

export const adminDeleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  if (req.user.role !== 'admin')
    return next(new AppError('Access denied', 403));

  const { error } = await supabase.from('request_comments').delete().eq('id', commentId);
  if (error) return next(new AppError('Delete failed', 400));

  return res.status(200).json({ status: 'success', message: 'Comment deleted by admin' });
});

// ─── Weekly top-upvoted leaderboard ───
export const weeklyLeaderboard = catchAsync(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all active requests
  const { data: requests } = await supabase
    .from('help_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (!requests || requests.length === 0)
    return res.status(200).json({ status: 'success', data: { requests: [] } });

  // Count votes in the last 7 days per request
  const enriched = await Promise.all(
    requests.map(async (r) => {
      const { count } = await supabase
        .from('request_votes')
        .select('request_id', { count: 'exact', head: true })
        .eq('request_id', r.id)
        .gte('created_at', since);
      const { data: userRow } = await supabase
        .from('users')
        .select('id,name,email')
        .eq('id', r.user_id)
        .single();
      return transformRequest({ ...r, _user: userRow, _voteCount: count || 0 });
    }),
  );

  const top = enriched
    .filter((r) => r.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 10);

  return res.status(200).json({ status: 'success', data: { requests: top } });
});

// ─── Free-help posts (offers) by helpers ───
export const listFreeHelp = catchAsync(async (req, res) => {
  const { data } = await supabase
    .from('help_requests')
    .select('*')
    .eq('help_type', 'free_help')
    .order('created_at', { ascending: false });

  const enriched = await Promise.all(
    (data || []).map(async (r) => {
      const { data: userRow } = await supabase
        .from('users')
        .select('id,name,email')
        .eq('id', r.user_id)
        .single();
      return transformRequest({ ...r, _user: userRow });
    }),
  );
  return res.status(200).json({ status: 'success', data: { requests: enriched } });
});

export const createFreeHelp = catchAsync(async (req, res, next) => {
  // Free help (no money involved) is open to any member.
  const { name, category, requestDescription, city, state, country, image } = req.body;
  if (!name || !category || !requestDescription)
    return next(new AppError('Missing required fields', 400));

  const { data: request, error } = await supabase
    .from('help_requests')
    .insert({
      user_id: req.user._id,
      name,
      category,
      request_description: requestDescription,
      city, state, country,
      amount: 0,
      deadline: 'ongoing',
      image_url: image?.url ?? null,
      image_path: image?.publicId ?? null,
      help_type: 'free_help',
    })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));
  return res.status(201).json({ status: 'success', data: { request: transformRequest(request) } });
});

// ─── Physical-meeting safety consent ───
export const recordMeetingConsent = catchAsync(async (req, res, next) => {
  const { requestId, counterpartyId } = req.body;
  const { error } = await supabase.from('meeting_consents').insert({
    user_id: req.user._id,
    request_id: requestId || null,
    counterparty_id: counterpartyId || null,
    acknowledged: true,
  });
  if (error) return next(new AppError(error.message, 400));
  return res.status(201).json({ status: 'success', message: 'Safety acknowledgement recorded' });
});
