import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Shield, Mail, Camera, LoaderCircle, HeartHandshake } from "lucide-react";
import toast from "react-hot-toast";
import ProfileSettings from "../../components/AccountSettings/ProfileSettings";
import PasswordSettings from "../../components/AccountSettings/PasswordSettings";
import HelperSettings from "../../components/AccountSettings/HelperSettings";
import { useProfileImage } from "../../hooks/useProfileImage";
import { userInitials } from "../../utils/userInitials";

type Tab = "profile" | "security" | "helper";

export default function Account() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const queryClient = useQueryClient();
  const { data: user } = useQuery<any>({ queryKey: ["authUser"] });

  // Avatar upload (single source of truth for the profile photo)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { isSubmitting, setIsSubmitting, handleImageUpload } = useProfileImage();

  const saveAvatar = async (profileData: any) => {
    const res = await fetch("/api/v1/users/updateMe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");
    return data;
  };

  const { mutate: saveAvatarMut, isLoading: savingAvatar } = useMutation({
    mutationFn: saveAvatar,
    onSuccess: () => {
      toast.success("Profile photo updated");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setPreview(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Failed to update photo"),
  });

  const onFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => typeof reader.result === "string" && setPreview(reader.result);
    reader.readAsDataURL(file);

    const result = await handleImageUpload(file);
    setIsSubmitting(false);
    if (!result) return toast.error("Failed to upload image");
    saveAvatarMut({ profileImg: { url: result.url, publicId: result.publicId } });
  };

  const uploading = isSubmitting || savingAvatar;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-[60px]">
      {/* Account Header */}
      <div className="relative overflow-hidden bg-helpMe-950 pb-10 pt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-helpMe-950 via-purple-900/20 to-helpMe-950" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Avatar with upload */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-xl sm:h-28 sm:w-28">
                {preview || user?.profileImg?.url ? (
                  <img
                    className="h-full w-full object-cover"
                    src={preview || user?.profileImg?.url}
                    alt="Profile"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {userInitials(user?.name) || "?"}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <LoaderCircle className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-helpMe-950 shadow-lg ring-2 ring-helpMe-950 transition hover:scale-110 disabled:opacity-50"
                title="Change photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input type="file" ref={fileRef} accept="image/*" onChange={onFileChange} hidden />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {user?.name || "Account"}
              </h1>
              <p className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-400 sm:justify-start">
                <Mail className="h-4 w-4" />
                {user?.email || ""}
              </p>
              <span className="mt-2 inline-block rounded-full bg-pink-500/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-pink-300 ring-1 ring-pink-500/30">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="relative z-10 mx-auto -mt-5 max-w-4xl px-4 sm:px-6">
        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-gray-200/60">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-helpMe-950 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "security"
                ? "bg-helpMe-950 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Shield className="h-4 w-4" />
            Security
          </button>
          {user?.role === "helper" && (
            <button
              onClick={() => setActiveTab("helper")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === "helper"
                  ? "bg-helpMe-950 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              Helper
            </button>
          )}
        </div>

        <div className="pb-16">
          {activeTab === "profile" && <ProfileSettings user={user} />}
          {activeTab === "security" && <PasswordSettings />}
          {activeTab === "helper" && user?.role === "helper" && <HelperSettings />}
        </div>
      </div>
    </div>
  );
}
