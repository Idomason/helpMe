import Image from '../models/imageModel';
import { catchAsync } from '../utils/catchAsync';
import { uploadToCloudinary } from '../config/cloudinary';

export const imageUpload = catchAsync(async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(500)
        .json({ success: false, message: 'Please upload a valid image file' });

    const { url, publicId } = await uploadToCloudinary(
      req.file.path,
      requestImage,
    );

    const uploadedImage = await Image({
      url,
      publicId,
      uploadedBy: req.user._id,
    }).save();

    return res.status(200).json({
      success: true,
      data: uploadedImage,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    console.log(`Error in imageUpload controller: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
});
