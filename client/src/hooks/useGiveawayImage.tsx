import { useState } from "react";
import toast from "react-hot-toast";

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

interface ImageUploadResult {
  url: string;
  publicId: string;
}

interface CloudinaryError {
  error: {
    message: string;
  };
}

interface UseGiveawayImageReturn {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  handleImageUpload: (
    file: File | null,
  ) => Promise<ImageUploadResult | undefined>;
}

export const useGiveawayImage = (): UseGiveawayImageReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cloudinary URL & Upload preset
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const uploadPreset = import.meta.env.VITE_GIVEAWAY_UPLOAD_PRESET;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

  if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !uploadPreset || !apiKey) {
    console.error("Missing required Cloudinary environment variables");
    throw new Error("Missing required Cloudinary configuration");
  }

  const handleImageUpload = async function (
    file: File | null,
  ): Promise<ImageUploadResult | undefined> {
    if (!file) return undefined;

    try {
      setIsSubmitting(true);

      // Prepare cloudinary data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("api_key", apiKey);

      // Perform the POST request to Cloudinary's upload API
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as CloudinaryError;
        throw new Error(errorData.error.message || "Failed to upload image");
      }

      const cloudinaryData = data as CloudinaryResponse;
      return {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while uploading the image");
      }
      return undefined;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, setIsSubmitting, handleImageUpload };
};
