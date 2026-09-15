import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformVerification } from '../utils/transformers.js';

// Submit a verification (KYC) request
export const submitVerification = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { fullName, idDocumentType, idDocumentUrl, idDocumentPath, note } = req.body;

  if (!fullName || !idDocumentType)
    return next(new AppError('Full name and ID document type are required', 400));

  // Prevent duplicate pending requests
  const { data: existing } = await supabase
    .from('verification_requests')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .single();
  if (existing)
    return next(new AppError('You already have a pending verification request', 400));

  const { data: request, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: userId,
      full_name: fullName,
      id_document_type: idDocumentType,
      id_document_url: idDocumentUrl || null,
      id_document_path: idDocumentPath || null,
      note: note || null,
    })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));

  // Ensure a helper profile exists and mark it pending
  await supabase
    .from('helper_profiles')
    .upsert(
      { user_id: userId, verification_status: 'pending' },
      { onConflict: 'user_id' },
    );

  return res.status(201).json({
    status: 'success',
    message: 'Verification request submitted',
    data: transformVerification(request),
  });
});

// Get my latest verification status
export const getMyVerification = catchAsync(async (req, res) => {
  const { data } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', req.user._id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return res.status(200).json({ status: 'success', data: transformVerification(data) });
});

// ADMIN: list verification requests (default pending)
export const listVerifications = catchAsync(async (req, res) => {
  const status = req.query.status || 'pending';
  const { data } = await supabase
    .from('verification_requests')
    .select('*, users!verification_requests_user_id_fkey(id,name,email)')
    .eq('status', status)
    .order('created_at', { ascending: false });

  return res.status(200).json({
    status: 'success',
    data: (data || []).map(transformVerification),
  });
});

// ADMIN: approve or reject
export const reviewVerification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { decision, reviewNote } = req.body; // decision: 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(decision))
    return next(new AppError('Decision must be approved or rejected', 400));

  const { data: request } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (!request) return next(new AppError('Verification request not found', 404));

  await supabase
    .from('verification_requests')
    .update({
      status: decision,
      review_note: reviewNote || null,
      reviewed_by: req.user._id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  // Update helper profile verification status
  await supabase
    .from('helper_profiles')
    .upsert(
      {
        user_id: request.user_id,
        verification_status: decision === 'approved' ? 'verified' : 'rejected',
      },
      { onConflict: 'user_id' },
    );

  return res.status(200).json({
    status: 'success',
    message: `Verification ${decision}`,
  });
});
