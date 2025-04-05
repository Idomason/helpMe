import { LoaderCircle } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
import { useState, FormEvent, ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface PasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

interface ApiResponse {
  status: string;
  message?: string;
  error?: {
    errors: {
      confirmPassword?: {
        message: string;
      };
    };
  };
}

export default function PasswordSettings() {
  const queryClient = useQueryClient();
  const [updateMyPassword, setUpdateMyPassword] = useState<PasswordData>({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });

  const changePassword = async function (
    passwordData: PasswordData,
  ): Promise<ApiResponse> {
    try {
      const response = await fetch("/api/v1/users/updateMyPassword", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = (await response.json()) as ApiResponse;

      if (data.status === "fail" || data.status === "error") {
        throw new Error(
          data.message ||
            data.error?.errors?.confirmPassword?.message ||
            "Failed to update password, please try again",
        );
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          error.message || "Something went wrong, please try again",
        );
      }
      throw new Error("Something went wrong, please try again");
    }
  };

  const { mutate: userAcctUpdate, isLoading } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong, please try again");
      } else {
        toast.error("Something went wrong, please try again");
      }
    },
  });

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUpdateMyPassword({ ...updateMyPassword, [name]: value });
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      userAcctUpdate(updateMyPassword);
      setUpdateMyPassword({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong, please try again");
      }
    }
  };

  return (
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
            {/* Current Password */}
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
                  className="md:text-md inline-block rounded bg-helpMe-950 px-8 py-2 font-medium tracking-wide text-helpMe-50 transition-all duration-300 ease-in hover:bg-helpMe-800 sm:px-16"
                >
                  {isLoading ? (
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
