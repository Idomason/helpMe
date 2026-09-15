import { useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadResult {
  url: string;
  publicId: string;
}

export const useProfileImage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async function (
    file: File | null,
  ): Promise<ImageUploadResult | undefined> {
    if (!file) return undefined;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "profile");

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to upload image");
      }

      const data = await response.json();
      return { url: data.data.url, publicId: data.data.publicId };
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
