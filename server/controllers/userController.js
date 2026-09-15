import { supabase } from '../config/supabase.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformUser } from '../utils/transformers.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getUserProfile = catchAsync(async (req, res, next) => {
  const { name } = req.params;
  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('name', name)
    .single();

  if (!userRow) return next(new AppError('User not found', 404));
  return res.status(200).json(transformUser(userRow));
});

export const getAllUsers = catchAsync(async (req, res) => {
  const { data: userRows } = await supabase
    .from('users')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  const users = (userRows || []).map(transformUser);
  return res.status(200).json({ status: 'success', data: { users } });
});

export const getUser = catchAsync(async (req, res, next) => {
  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (!userRow) return next(new AppError('User not found', 404));
  return res.status(200).json(transformUser(userRow));
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { data: updatedRow, error } = await supabase
    .from('users')
    .update(req.body)
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return next(new AppError('Update failed', 400));
  return res.status(200).json(transformUser(updatedRow));
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await supabase.from('users').update({ active: false }).eq('id', req.params.id);
  return res.status(204).json({ status: 'success' });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.body.profileImg?.url) {
    filteredBody.profile_img_url = req.body.profileImg.url;
    filteredBody.profile_img_path = req.body.profileImg.publicId;
  }

  const { data: updatedRow, error } = await supabase
    .from('users')
    .update(filteredBody)
    .eq('id', req.user._id)
    .select('*')
    .single();

  if (error) return next(new AppError('Update failed', 400));
  res.status(200).json({ status: 'success', data: { user: transformUser(updatedRow) } });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const { error } = await supabase.from('users').update({ active: false }).eq('id', req.user._id);
  if (error) return next(new AppError('User no longer exists', 404));
  res.status(204).json({ status: 'success', data: null });
});
