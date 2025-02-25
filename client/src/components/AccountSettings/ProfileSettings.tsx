import toast from "react-hot-toast";
import { useRef, useState } from "react";
import ShortHeader from "../ShortHeader/ShortHeader";
import { useProfileImage } from "../../hooks/useProfileImage";
import { Eye, EyeOff, ImageUp, LoaderCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ProfileSettings({ user }) {
  const profileImgRef = useRef(null);
  const [editName, setEditName] = useState(true);
  const [editEmail, setEditEmail] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [flag, setFlag] = useState("");
  const queryClient = useQueryClient();
  const { isSubmitting, setIsSubmitting, handleImageUpload } =
    useProfileImage();
  const [userData, setUserData] = useState({
    name: user?.name,
    email: user?.email,
    profileImg: user?.profileImg,
  });

  const changeProfileInfo = async function (profileData) {
    try {
      const response = await fetch("/api/v1/users/updateMe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!data) {
        throw new Error(
          data.message || "Failed to upload image, please try again",
        );
      }

      return data;
    } catch (error) {
      throw new Error(
        error.message || "Something went wrong, please try again",
      );
    }
  };

  const { mutate: changeProfileImage, isLoading: isChangingImage } =
    useMutation({
      mutationFn: changeProfileInfo,
      onSuccess: () => {
        toast.success("Profile image updated successfully");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (error) => toast.error(error.message || "Profile update failed"),
    });

  const { mutate: changeProfileName, isLoading: isChangingName } = useMutation({
    mutationFn: changeProfileInfo,
    onSuccess: () => {
      toast.success("Name updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => toast.error(error.message || "Profile update failed"),
  });

  const { mutate: changeProfileEmail, isLoading: isChangingEmail } =
    useMutation({
      mutationFn: changeProfileInfo,
      onSuccess: () => {
        toast.success("Email updated successfully");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      },
      onError: (error) => toast.error(error.message || "Profile update failed"),
    });

  const handleProfileSubmit = async function (event) {
    try {
      event.preventDefault();

      if (imageFile && flag === "image") {
        const previousPublicId = user?.profileImg?.publicId;

        const { url, publicId } = await handleImageUpload(
          imageFile,
          previousPublicId,
        );
        const profileData = {
          ...userData,
          profileImg: { url, publicId },
        };

        changeProfileImage(profileData);
        setIsSubmitting(false);
        setFlag("");
      } else if (flag === "name") {
        changeProfileName(userData);
        setIsSubmitting(false);
        setFlag("");
      } else if (flag === "email") {
        changeProfileEmail(userData);
        setIsSubmitting(false);
        setFlag("");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong, please try again");
    }
  };

  const handleFileChange = function () {
    let file = profileImgRef.current.files[0];

    setImageFile(file);
    setFlag("image");

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({
          ...userData,
          profileImg: { ...userData?.profileImg, url: reader.result },
        });
      };
      reader.readAsDataURL(file);
    }
    file = null;
  };

  const handleChange = function (event) {
    const { name, value } = event.target;
    setFlag(name);
    setUserData({ ...userData, [name]: value });
  };

  const handleEdit = function (flag: string) {
    if (flag === "name") {
      setEditName((prev) => !prev);
    } else if (flag === "email") {
      setEditEmail((prev) => !prev);
    }
  };

  return (
    <form>
      <div className="mx-auto px-4 pt-10 md:w-11/12">
        <ShortHeader heading="Profile and Personal Information" />
        {/* Edit profile (name, bio, profile picture, cover photo) Change username
      Update email or phone number Manage connected accounts (e.g., linking
      other social media or Google account) */}
        <div>
          <h6 className="text-md py-4 font-semibold tracking-wide text-helpMe-950">
            Edit Profile
          </h6>
          <div className="bg-helpMe-50 p-6">
            {/* Profile Image */}
            <div className="flex items-center justify-between">
              <div className="relative inline-block rounded-full bg-helpMe-100 p-4">
                <div>
                  <div className="h-24 w-24 overflow-hidden rounded-full shadow">
                    <img
                      className="h-full w-full object-cover"
                      src={userData.profileImg?.url || "/images/profile.jpg"}
                      alt="Profile Image"
                    />
                  </div>
                  <ImageUp
                    className="absolute left-28 top-20 cursor-pointer text-helpMe-950"
                    size={"28px"}
                    onClick={() => profileImgRef.current?.click()}
                  />
                  <input
                    type="file"
                    ref={profileImgRef}
                    name="profileImg"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </div>
              </div>
              <div className="py-4">
                <button
                  type="submit"
                  className="md:text-md inline-block rounded bg-helpMe-950 px-8 py-2 font-medium tracking-wide text-helpMe-50 transition-all duration-300 ease-in hover:bg-helpMe-800 sm:px-16"
                  onClick={() => handleProfileSubmit(event)}
                >
                  {isSubmitting || isChangingImage ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col py-6 md:flex-row md:justify-between">
              <div>
                <label
                  className="mb-1 block font-medium text-helpMe-950"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="text"
                    name="name"
                    id="name"
                    value={userData.name}
                    onChange={handleChange}
                    placeholder="John  Doe"
                    disabled={editName}
                  />

                  <div>
                    {editName ? (
                      <EyeOff
                        className="cursor-pointer text-helpMe-500"
                        onClick={() => handleEdit("name")}
                      />
                    ) : (
                      <Eye
                        className="cursor-pointer text-helpMe-500"
                        onClick={() => handleEdit("name")}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="py-4">
                <button
                  type="button"
                  className="md:text-md inline-block rounded bg-helpMe-950 px-8 py-2 font-medium tracking-wide text-helpMe-50 transition-all duration-300 ease-in hover:bg-helpMe-800 sm:px-16"
                  onClick={() => handleProfileSubmit(event)}
                >
                  {isChangingName ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col py-6 md:flex-row md:justify-between">
              <div>
                <label
                  className="mb-1 block font-medium text-helpMe-950"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="email"
                    name="email"
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="johndoe@email.com"
                    disabled={editEmail}
                  />
                  <div>
                    {editEmail ? (
                      <EyeOff
                        className="cursor-pointer text-helpMe-500"
                        onClick={() => handleEdit("email")}
                      />
                    ) : (
                      <Eye
                        className="cursor-pointer text-helpMe-500"
                        onClick={() => handleEdit("email")}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="py-4">
                <button
                  type="button"
                  className="md:text-md inline-block rounded bg-helpMe-950 px-8 py-2 font-medium tracking-wide text-helpMe-50 transition-all duration-300 ease-in hover:bg-helpMe-800 sm:px-16"
                  onClick={() => handleProfileSubmit(event)}
                >
                  {isChangingEmail ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
