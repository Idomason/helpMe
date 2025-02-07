import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';

// export const protect = catchAsync(async (req, res, next) => {
//   const token = req.cookies.jwt;

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: 'Unauthorized: No token provided' });
//   }

//   const decode = jwt.verify(token, process.env.JWT_SECRET);

//   if (!decode) {
//     return res
//       .status(401)
//       .json({ success: false, message: 'Unauthorized: Invalid token' });
//   }

//   const user = await User.findById(decode._id);

//   if (!user) {
//     return res.status(404).json({ success: false, message: 'User not found' });
//   }

//   // Add user to request
//   req.user = user;

//   next();
// });

export const protect = catchAsync(async (req, res, next) => {
  // 1.) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, please login to get access', 401),
    );
  }

  // 2.) Verify token
  const decoded = await promisify(jwt.verify)(token, process.JWT_SECRET);

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
