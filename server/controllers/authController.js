import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import sendEmail from '../utils/email.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { transformUser } from '../utils/transformers.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });

const createSendToken = async (userRow, statusCode, res) => {
  // Fetch verification status from helper_profiles
  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('verification_status')
    .eq('user_id', userRow.id)
    .single();
  const enrichedRow = { ...userRow, verification_status: profile?.verification_status || 'unverified' };

  const token = generateToken(userRow.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  const user = transformUser(enrichedRow);
  return res.status(statusCode).json({ status: 'success', token, data: { user } });
};

const hashPassword = async (pw) => bcrypt.hash(pw, 12);
const comparePasswords = async (candidate, stored) => bcrypt.compare(candidate, stored);

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(new AppError('You are not logged in, please login to get access', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('id', decoded.id)
    .single();

  if (!userRow)
    return next(new AppError('Unauthorized: The user belonging to this token no longer exists', 401));

  if (userRow.password_changed_at) {
    const changedTimestamp = Math.floor(new Date(userRow.password_changed_at).getTime() / 1000);
    if (decoded.iat < changedTimestamp)
      return next(new AppError('User recently changed password! Please log in again', 401));
  }

  req.user = transformUser(userRow);
  req.userRow = userRow;
  next();
});

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, termsConditions } = req.body;

  if (password !== passwordConfirm)
    return next(new AppError('Passwords do not match', 400));

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (existing)
    return next(new AppError('User email already exists', 400));

  const hashedPw = await hashPassword(password);

  const { data: userRow, error } = await supabase
    .from('users')
    .insert({ name, email, password: hashedPw, terms_conditions: termsConditions, role: 'member' })
    .select('*')
    .single();

  if (error) return next(new AppError(error.message, 400));
  await createSendToken(userRow, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!userRow || !(await comparePasswords(password, userRow.password)))
    return next(new AppError('Incorrect email or password', 401));

  await createSendToken(userRow, 200, res);
});

export const logout = catchAsync(async (req, res) => {
  res.cookie('jwt', '', { maxAge: 0 });
  return res.status(200).json({ success: true, data: null, message: 'Logout successful' });
});

export const getMe = catchAsync(async (req, res) => {
  if (!req.userRow)
    return res.status(404).json({ success: false, message: 'User not found' });

  const { data: profile } = await supabase
    .from('helper_profiles')
    .select('verification_status')
    .eq('user_id', req.userRow.id)
    .single();

  const user = transformUser({
    ...req.userRow,
    verification_status: profile?.verification_status || 'unverified',
  });
  return res.status(200).json(user);
});

export const restrictedTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new AppError('You do not have permission to perform this action', 403));
  next();
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('email', req.body.email)
    .single();

  if (!userRow)
    return next(new AppError('No user found with this email address.', 404));

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await supabase.from('users').update({
    password_reset_token: hashedToken,
    password_reset_expires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }).eq('id', userRow.id);

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit your new password and password confirm to: ${resetURL}.\nOtherwise please ignore this email.`;

  try {
    await sendEmail({ email: userRow.email, subject: 'Your password reset token (valid for 10 mins)', message });
    res.status(200).json({ status: 'success', message: 'Password reset token successfully sent' });
  } catch (error) {
    await supabase.from('users').update({ password_reset_token: null, password_reset_expires: null }).eq('id', userRow.id);
    return next(new AppError('There was an error sending the email, please try again later', 400));
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('password_reset_token', hashedToken)
    .gt('password_reset_expires', new Date().toISOString())
    .single();

  if (!userRow)
    return next(new AppError('Invalid token or expired token', 400));

  if (req.body.password !== req.body.passwordConfirm)
    return next(new AppError('Passwords do not match', 400));

  const hashedPw = await hashPassword(req.body.password);

  await supabase.from('users').update({
    password: hashedPw,
    password_changed_at: new Date().toISOString(),
    password_reset_token: null,
    password_reset_expires: null,
  }).eq('id', userRow.id);

  const token = generateToken(userRow.id);
  return res.status(200).json({ status: 'success', token, message: 'User password reset successful' });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { data: userRow } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user._id)
    .single();

  if (!userRow || !(await comparePasswords(req.body.currentPassword, userRow.password)))
    return next(new AppError('Current password is wrong', 401));

  if (req.body.password !== req.body.passwordConfirm)
    return next(new AppError('Passwords do not match', 400));

  const hashedPw = await hashPassword(req.body.password);

  const { data: updatedRow } = await supabase
    .from('users')
    .update({ password: hashedPw, password_changed_at: new Date().toISOString() })
    .eq('id', userRow.id)
    .select('*')
    .single();

  await createSendToken(updatedRow, 200, res);
});
