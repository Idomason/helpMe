import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { v2 as cloudinary } from 'cloudinary';

export const deleteFromCloudinary = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // Step 1: Validate User & Image
  if (!user || !user?.profileImg) {
    return next(new AppError('No user or no profile image found', 404));
  }

  //   Retrieve image publicId from user object
  const publicId = user?.profileImg?.publicId;

  if (!publicId) return next(); // No image to delete, continue to next middleware

  // Step 2: Delete Image from Cloudinary
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`cloudinary deletion successful: ${result}`);
  } catch (error) {
    console.error(`Error deleting image from cloudinary: ${error}`);
  }

  next(); // Proceed to next middleware/controller
});
