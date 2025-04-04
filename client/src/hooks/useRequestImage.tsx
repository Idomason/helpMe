import toast from "react-hot-toast";

export const useRequestImage = () => {
  // Cloudinary URL & Upload preset
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const uploadPreset = import.meta.env.VITE_REQUEST_UPLOAD_PRESET;

  const handleImageUpload = async function (filePath: any): Promise<any> {
    // Debug logging
    console.log('Upload preset:', uploadPreset);
    console.log('Cloud name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log('File to upload:', filePath);

    // Prepare cloudinary data for upload
    const formData = new FormData();
    formData.append("file", filePath);
    formData.append("upload_preset", uploadPreset);

    try {
      // Log the URL we're posting to
      console.log('Posting to:', cloudinaryUrl);
      
      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      // Add better error handling
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Error Details:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        toast.error("Failed to upload image");
        return null;
      }

      const data = await response.json();

      if (data) {
        return { url: data.secure_url, public_id: data.public_id }; // Note: changed publicId to public_id
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred, please try again");
      return null;
    }
  };

  return { handleImageUpload };
};
