import { ImageUp, LoaderCircle } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useProfileImage } from "../../hooks/useProfileImage";

type PasswordDataprop = {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
};

export default function ProfileInfo() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["authUser"] });
  const profileImgRef = useRef(null);
  const [edit, setEdit] = useState(true);
  const [flag, setFlag] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const { isSubmitting, setIsSubmitting, handleImageUpload } =
    useProfileImage();
  const [updateMyPassword, setUpdateMyPassword] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const [userData, setUserData] = useState({
    name: user?.name,
    email: user?.email,
    profileImg: user?.profileImg,
  });

  const changePassword = async function (passwordData: PasswordDataprop) {
    try {
      const response = await fetch("/api/v1/users/updateMyPassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.status === "fail" || data.status === "error") {
        throw new Error(
          data.message ||
            data.error.errors.confirmPassword.message ||
            "Failed to update password, please try again",
        );
      }
      return data;
    } catch (error) {
      throw new Error(
        error.message || "Something went wrong, please try again",
      );
    }
  };

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

  const whatAction = function (flag: string) {
    switch (flag) {
      case "profile":
        return changeProfileInfo;
      case "password":
        return changePassword;
      default:
        return;
    }
  };

  const {
    mutate: profileUpdate,
    isLoading,
    error,
  } = useMutation({
    mutationFn: changeProfileInfo,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => toast.error(error.message || "Profile update failed"),
  });
  const { mutate: updatePassword } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => toast.error(error.message || "Password update failed"),
  });

  const handleProfileSubmit = async function (event) {
    try {
      event.preventDefault();

      setFlag("profile");

      if (imageFile) {
        const { url, publicId } = await handleImageUpload(imageFile);
        const profileData = { ...userData, profileImg: url };
        profileUpdate(profileData);
        setIsSubmitting(false);
      } else {
        profileUpdate(userData);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = function (event) {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handlePassword = function (event) {
    const { name, value } = event.target;
    setUpdateMyPassword({ ...updateMyPassword, [name]: value });
  };

  const handleFileChange = function () {
    let file = profileImgRef.current.files[0];
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profileImg: reader.result });
      };
      reader.readAsDataURL(file);
      file = null;
    }
  };

  const handleEdit = function () {
    setEdit((prev) => !prev);
  };

  const handlePasswordSubmit = function (event) {
    try {
      event.preventDefault();

      setFlag("password");
      updatePassword(updateMyPassword);
      setUpdateMyPassword({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="pt-24">
      {/* Profile */}
      <form onSubmit={handleProfileSubmit}>
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
                        src={
                          userData.profileImg ||
                          "https://www.gravatar.com/avatar/?d=mp"
                        }
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
                    className="md:text-md inline-block rounded bg-helpMe-950 px-[50px] py-2 font-medium tracking-wide text-helpMe-50"
                  >
                    {isSubmitting || isLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Upload"
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
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="text"
                    name="name"
                    id="name"
                    value={userData.name}
                    onChange={handleChange}
                    placeholder="John  Doe"
                    disabled={edit}
                  />
                </div>
                <div className="py-4">
                  <button
                    type="submit"
                    className="md:text-md inline-block rounded bg-helpMe-950 px-16 py-2 font-medium tracking-wide text-helpMe-50"
                  >
                    {edit ? "Edit" : "Update"}
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
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="email"
                    name="email"
                    id="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="johndoe@email.com"
                    disabled={edit}
                  />
                </div>
                <div className="py-4">
                  <button
                    type="submit"
                    className="md:text-md inline-block rounded bg-helpMe-950 px-16 py-2 font-medium tracking-wide text-helpMe-50"
                  >
                    {edit ? "Edit" : "Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordSubmit}>
        <div className="mx-auto my-5 px-4 pt-10 md:w-11/12">
          <ShortHeader heading="Security and Logins" />
          {/* Change password Two-factor authentication (2FA) Login activity (see
        active sessions and logged-in devices) Manage trusted devices Logout
        from all devices */}
          <div>
            <h6 className="text-md py-4 font-semibold tracking-wide text-helpMe-950">
              Edit Auth Info
            </h6>
            <div className="bg-helpMe-50 p-6">
              {/* Currebt Password */}
              <div className="flex flex-col py-6 md:flex-row md:justify-between">
                <div>
                  <label
                    className="mb-1 block font-medium text-helpMe-950"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={updateMyPassword.currentPassword}
                    onChange={handlePassword}
                    placeholder="Current password"
                  />
                </div>
              </div>

              {/* New password */}
              <div className="flex flex-col py-6 md:flex-row md:justify-between">
                <div>
                  <label
                    className="mb-1 block font-medium text-helpMe-950"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="password"
                    name="password"
                    id="password"
                    value={updateMyPassword.password}
                    onChange={handlePassword}
                    placeholder="New Password"
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div className="py-6">
                <div>
                  <label
                    className="mb-1 block font-medium text-helpMe-950"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <input
                    className="rounded px-4 py-1.5 shadow outline-none ring-1 ring-helpMe-200 focus:border-b-2 focus:border-b-helpMe-950"
                    type="password"
                    name="passwordConfirm"
                    id="passwordConfirm"
                    value={updateMyPassword.passwordConfirm}
                    onChange={handlePassword}
                    placeholder="Confirm Password"
                  />
                </div>
                <div className="mt-4 py-4">
                  <button
                    type="submit"
                    className="md:text-md inline-block rounded bg-helpMe-950 px-16 py-2 font-medium tracking-wide text-helpMe-50"
                  >
                    {isLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
