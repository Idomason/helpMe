import Giveaway from '../models/giveawayModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAllGiveaways = catchAsync(async (req, res) => {
  try {
    const giveaways = await Giveaway.find();
    if (!giveaways) {
      return next(new AppError('No giveaways found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: giveaways,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Failed to get giveaways', 500));
  }
});

export const createGiveaway = catchAsync(async (req, res) => {
  const giveaway = await Giveaway.create(req.body);

  if (!giveaway) {
    return next(new AppError('Failed to create giveaway', 400));
  }

  res.status(201).json({
    status: 'success',
    data: giveaway,
  });
});

export const getGiveaway = catchAsync(async (req, res) => {
  const giveaway = await Giveaway.findById(req.params.id);

  if (!giveaway) {
    return next(new AppError('Giveaway not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: giveaway,
  });
});

export const updateGiveaway = catchAsync(async (req, res) => {
  const giveaway = await Giveaway.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!giveaway) {
    return next(new AppError('Giveaway not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: giveaway,
  });
});

export const deleteGiveaway = catchAsync(async (req, res) => {
  const giveaway = await Giveaway.findByIdAndDelete(req.params.id);

  if (!giveaway) {
    return next(new AppError('Giveaway not found', 404));
  }

  res.status(204).json({ status: 'success' });
});
