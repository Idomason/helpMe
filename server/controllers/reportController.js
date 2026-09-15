import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Any authenticated user can flag content
export const createReport = catchAsync(async (req, res, next) => {
  const { targetType, targetId, reason, details } = req.body;
  if (!['request', 'giveaway', 'comment', 'user'].includes(targetType))
    return next(new AppError('Invalid target type', 400));
  if (!targetId || !reason)
    return next(new AppError('targetId and reason are required', 400));

  const { error } = await supabase.from('reports').insert({
    reporter_id: req.user._id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details || null,
  });
  if (error) return next(new AppError(error.message, 400));

  return res.status(201).json({ status: 'success', message: 'Report submitted for review' });
});
