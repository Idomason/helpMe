import { uploadToCloudinary } from '../config/cloudinary.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Cloudinary request image upload controller
export const cloudinaryImageUpload = catchAsync(async (req, res, next) => {
  console.log('AM HERE NOW!');
  const file = req.file;
  console.log(file);

  try {
    if (!file) return next(new AppError('No image file found', 404));

    const { url, publicId } = uploadToCloudinary(file, 'helpMe');

    (req.url = url), (req.publicId = publicId);
  } catch (error) {
    console.log(error);
  }

  next();
});
