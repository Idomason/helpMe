import toast from "react-hot-toast";

export const useRequestImage = () => {
  // Cloudinary URL & Upload preset
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const uploadPreset = import.meta.env.VITE_REQUEST_UPLOAD_PRESET;

  const handleImageUpload = async function (fileInput: any): Promise<any> {
    // Handle both File objects and blob URLs
    let fileToUpload: File;

    if (fileInput instanceof File) {
      fileToUpload = fileInput;
    } else if (fileInput?.url && fileInput.url.startsWith("blob:")) {
      try {
        const response = await fetch(fileInput.url);
        const blob = await response.blob();
        fileToUpload = new File([blob], "image.jpg", { type: blob.type });
      } catch (error) {
        console.error("Error converting blob to file:", error);
        toast.error("Error processing image");
        return null;
      }
    } else {
      console.error("Invalid file input:", fileInput);
      toast.error("Please select a valid image");
      return null;
    }

    // Validate file
    if (!fileToUpload || !fileToUpload.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return null;
    }

    // Debug logging
    console.log("Upload preset:", uploadPreset);
    console.log("Cloud name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log("File to upload:", fileToUpload);

    // Prepare cloudinary data for upload
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("upload_preset", uploadPreset);

    try {
      // Log the URL we're posting to
      console.log("Posting to:", cloudinaryUrl);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary Error Details:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          file: fileToUpload.name,
          fileType: fileToUpload.type,
          fileSize: fileToUpload.size,
        });
        toast.error(
          `Upload failed: ${errorData.error?.message || "Invalid image format"}`,
        );
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
