import User from '../models/userModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const checkNameMiddleware = async (res, next, val) => {
  console.log(val);

  const { name } = req.params;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Invalid name' });
  }

  next();
};

// Get a user profile
export const getUserProfile = catchAsync(async (req, res, next) => {
  const { name } = req.params;

  const user = await User.findOne({ name });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  return res.status(200).json(user);
});

// Get all users
export const getAllUsers = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  if (!users) {
    return next(new AppError('No user found', 404));
  }

  return res.status(200).json({ status: 'success', data: { helpers } });
});

// Create user
export const createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
});

// Get a user
export const getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  return res.status(200).json(user);
});

// Update user
export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
});

// Delete user
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
});

export const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $match: { helpRequests: { $gte: 10 } },
    },
    {
      $group: {
        _id: { $toUpper: '$role' },
        // _id: '$role',
        // _id: null,
        numUsers: { $sum: 1 }, // calculates total num of users that passes through this aggregation pipeline
        numRequest: { $sum: '$helpRequest' }, //  calculates the total number of helpRequests
        avgRequest: { $avg: '$helpRequests' }, // calculates the average number of helpRequest
        avgHelpsRender: { $avg: '$helpsRendered' }, // calculates the average number of helpRendered
        minHelp: { $min: '$helpRequests' }, // just for learning, not a valid code
        maxHelp: { $max: '$helpRequests' }, // just for learning, not a valid code
      },
    },
    { $sort: { numUsers: 1 } },
  ]);

  if (!stats) {
    return next(new AppError('Error: No stats', 400));
  }

  return res.status(200).json({ status: 'success', data: { stats } });
});

// Get monthly plan
export const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await User.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date.now(`${year}-01-01`),
          $lte: new Date.now(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  if (!plan) {
    return next(new AppError('No plan', 404));
  }

  return res.status(200).json({ status: 'success', data: { plan } });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;

  // 1.) Error if user POSTs password or passwordConfirm
  // if (password || passwordConfirm) {
  //   return next(
  //     new AppError('Please use updateMyPassword to update password', 400),
  //   );
  // }

  // 2.) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'profileImg');

  // 3.) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  if (!user) {
    return next(new AppError('User no longer exist', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
