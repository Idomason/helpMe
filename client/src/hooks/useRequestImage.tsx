import toast from "react-hot-toast";

export const useRequestImage = () => {
  // Cloudinary URL & Upload preset
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

  const handleImageUpload = async function (filePath: any): Promise<any> {
    // Prepare cloudinary data for upload
    const formData = new FormData();
    formData.append("file", filePath);
    formData.append("upload_preset", uploadPreset);
    formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);

    try {
      // Perform the POST request to Cloudinary's upload API
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) toast.error("Failed to upload image");

      const data = await response.json();

      if (data) {
        return { url: data.secure_url, publicId: data.public_id };
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred, please try again");
    }
  };

  return { handleImageUpload };
};
