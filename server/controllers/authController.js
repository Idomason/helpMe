import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import sendEmail from '../utils/email.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateTokenAndSetCookie } from '../lib/generateToken.js';

// Protect MIDDLEWARE
export const protect = catchAsync(async (req, res, next) => {
  // 1.) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt; // Extract token from cookies
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, please login to get access', 401),
    );
  }

  // 2.) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.) Check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError(
        'Unauthorized: The user belonging to this token no longer exists',
        401,
      ),
    );
  }

  // 4.) Check if user changed password after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  next();
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// Register
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, termsConditions, role } =
    req.body;

  // Check if user exists already
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError('User email already exists', 400));
  }

  // Create user in DB
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    termsConditions,
    role,
  });

  if (user) {
    // generateTokenAndSetCookie(newUser._id, res);

    createSendToken(user, 201, res);
  }
});

// Login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for valid email input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // Generate token and set cookie
  // generateTokenAndSetCookie(user._id);

  createSendToken(user, 200, res);
});

// Logout
export const logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', '', { maxAge: 0 });
  return res.status(200).json({ success: true, message: 'Logout successful' });
});

// Get Authenticated user
export const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(`Error in getMe controller: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});

// Restricted
export const restrictedTo = (...roles) => {
  return (req, res, next) => {
    // Roles ['admin',]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

// Forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user based on the email supplied
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with this email address.', 404));
  }

  // 2.) Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3.) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit your new password and password confirm to: ${resetURL}.\nOtherwise please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for the next 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset token successfully sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email, pls try again later',
        400,
      ),
    );
  }
});

// Reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user base on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2.) If token has not expired and there is a user, set new password
  if (!user) {
    return next(new AppError('Invalid token or expired token', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3.) Update changePasswordAt property for the current user
  // 4.) Log the user in, send JWT to the client
  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '15d',
    });
  };

  const token = generateToken(user._id);

  return res.status(200).json({
    status: 'success',
    token,
    message: 'User password reset successful',
  });
});
export const updatePassword = catchAsync(async (req, res, next) => {
  // 1.) Get user from the collection
  const user = await User.findById(req.user._id).select('+password');

  // 2.) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Current password is wrong', 401));
  }

  // 3.) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  // 4.) Login with new password, send JWT
  createSendToken(user, 200, res);
});
