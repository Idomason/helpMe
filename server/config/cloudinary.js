import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.process.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async function (filePath, folder) {
  try {
    const response = await cloudinary.uploader.upload(filePath, folder);
    return { url: response.secure_url, publicId: response.public_id };
  } catch (error) {
    console.log(`Error uploading to cloudinary: ${error}`);
    throw new Error('Error uploading to cloudinary');
  }
};
