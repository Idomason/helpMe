import { LoaderCircle, Save, Lock, KeyRound, ShieldCheck } from "lucide-react";
import { useState, FormEvent, ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface PasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export default function PasswordSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PasswordData>({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });

  const changePassword = async (passwordData: PasswordData) => {
    const response = await fetch("/api/v1/users/updateMyPassword", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to update password");
    return data;
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setFormData({ currentPassword: "", password: "", passwordConfirm: "" });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    },
  });

  const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Security overview card */}
      <div className="rounded-2xl bg-gradient-to-br from-helpMe-950 to-purple-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <ShieldCheck className="h-6 w-6 text-pink-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Password Security</h3>
            <p className="text-sm text-gray-300">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>
      </div>

      {/* Password form card */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <h3 className="mb-1 text-lg font-bold text-gray-900">Change Password</h3>
        <p className="mb-6 text-sm text-gray-500">
          Use at least 6 characters. Mix in numbers and symbols for extra security.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="currentPassword" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Lock className="h-4 w-4 text-gray-400" />
              Current Password
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <KeyRound className="h-4 w-4 text-gray-400" />
                New Password
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <KeyRound className="h-4 w-4 text-gray-400" />
                Confirm Password
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
                type="password"
                name="passwordConfirm"
                id="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-helpMe-950 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Update Password
        </button>
      </form>
    </div>
  );
}
