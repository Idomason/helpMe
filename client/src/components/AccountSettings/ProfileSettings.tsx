import toast from "react-hot-toast";
import { useState } from "react";
import { LoaderCircle, Save, User as UserIcon, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IUser } from "../../utils/types";
import PayoutSettings from "./PayoutSettings";

type UserDataProp = { user?: IUser };

export default function ProfileSettings({ user }: UserDataProp) {
  const queryClient = useQueryClient();
  const [flag, setFlag] = useState("");
  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const changeProfileInfo = async function (profileData: any) {
    const response = await fetch("/api/v1/users/updateMe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Update failed");
    return data;
  };

  const { mutate: changeProfileInfoMut, isLoading } = useMutation({
    mutationFn: changeProfileInfo,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setFlag("");
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Profile update failed"),
  });

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setFlag(name);
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    changeProfileInfoMut(userData);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
      <h3 className="mb-1 text-lg font-bold text-gray-900">Personal Information</h3>
      <p className="mb-6 text-sm text-gray-500">Update your name and email address.</p>

      {/* Name + Email side by side, 50/50 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <UserIcon className="h-4 w-4 text-gray-400" />
            Full Name
          </label>
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
            type="text"
            name="name"
            id="name"
            value={userData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail className="h-4 w-4 text-gray-400" />
            Email Address
          </label>
          <input
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
            type="email"
            name="email"
            id="email"
            value={userData.email}
            onChange={handleChange}
            placeholder="johndoe@email.com"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!flag || isLoading}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Changes
      </button>
    </div>

      <PayoutSettings />
    </div>
  );
}
