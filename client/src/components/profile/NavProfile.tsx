import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IUser } from "../../utils/types";

type NavProfileProp = {
  user?: IUser;
  status: string;
  profileToggler: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NavProfile({
  user,
  status,
  profileToggler,
}: NavProfileProp) {
  const queryClient = useQueryClient();

  const logout = async (): Promise<void> => {
    const response = await fetch("/api/v1/users/logout", { method: "POST" });
    if (!response.ok) throw new Error("Failed to log user out, try again");
    const data = await response.json();
    return data;
  };

  const { mutate: authUserLogout } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logout successful");
    },
    onError: () => toast.error("Failed to log out! Please try again"),
  });

  return (
    <div
      className="fixed inset-0 top-[60px] z-[9999] bg-black/10"
      onClick={() => profileToggler(false)}
    >
      <div
        className="absolute top-0 flex min-h-fit w-full items-center justify-end px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <ul className="flex h-full w-72 flex-col rounded-md bg-white py-4 shadow-2xl ring-1 ring-gray-200">
          <li className="w-full cursor-pointer border-t px-4 py-1.5 font-semibold hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            {capitalizeFirstLetter(user?.name || "")}
          </li>
          <li className="w-full cursor-pointer border-t px-4 py-1.5 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            {user?.email}
          </li>
          <Link to={user?.role === "admin" ? "/admin" : "/dashboard"}>
            <li
              className="w-full cursor-pointer border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white"
              onClick={() => profileToggler(false)}
            >
              Dashboard
            </li>
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin">
              <li
                className="w-full cursor-pointer border-t px-4 py-2 font-semibold text-pink-700 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white"
                onClick={() => profileToggler(false)}
              >
                Admin Control
              </li>
            </Link>
          )}
          <Link
            className="w-full"
            to={user?.role === "admin" ? "/admin?tab=account" : "/dashboard?tab=account"}
          >
            <li
              className="w-full cursor-pointer border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white"
              onClick={() => profileToggler(false)}
            >
              Account
            </li>
          </Link>
          <li className="mb-4 w-full cursor-pointer border-b border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            Role{" "}
            <span className={`${status} ml-2 rounded py-1 ring-1`}>
              {capitalizeFirstLetter(user?.role || "")}
            </span>
          </li>
          <li
            className="px-4"
            onClick={() => {
              authUserLogout();
              profileToggler(false);
            }}
          >
            <button className="w-full cursor-pointer rounded-md bg-red-500 py-2 text-center text-white shadow hover:bg-black/75 hover:text-white">
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
