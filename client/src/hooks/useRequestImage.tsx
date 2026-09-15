import toast from "react-hot-toast";

export const useRequestImage = () => {
  const handleImageUpload = async function (fileInput: any): Promise<any> {
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

    if (!fileToUpload || !fileToUpload.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("image", fileToUpload);
      formData.append("type", "request");

      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData?.message || "Upload failed");
        return null;
      }

      const data = await response.json();
      return { url: data.data.url, public_id: data.data.publicId };
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An error occurred, please try again");
      return null;
    }
  };

  return { handleImageUpload };
};
