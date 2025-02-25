import { Link } from "react-router-dom";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function NavProfile({ user, status, profileToggler }) {
  const queryClient = useQueryClient();

  const logout = async () => {
    const response = await fetch("/api/v1/users/logout", { method: "POST" });
    if (!response.ok) throw new Error("Failed to log user out, try again");
    const data = await response.json();
    return data;
  };

  const { mutate: authUserLogout }: UseMutationResult<void> = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logout successful");
    },
    onError: () => toast.error("Failed to log out! Please try again"),
  });

  return (
    <div className="absolute bottom-0 top-[80px] min-h-screen w-screen bg-black/90 backdrop-blur">
      <div className="absolute top-0 flex min-h-fit w-full items-center justify-end px-4">
        <ul className="flex h-full w-72 flex-col rounded-md bg-helpMe-300 py-4 shadow-lg">
          <li className="w-full cursor-pointer border-t px-4 py-1.5 font-semibold hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            {capitalizeFirstLetter(user.name)}
          </li>
          <li className="w-full cursor-pointer border-t px-4 py-1.5 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            {user.email}
          </li>
          <Link to={`/dashboard-${user.role}-request`}>
            <li className="w-full cursor-pointer border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
              Dashboard
            </li>
          </Link>
          <li className="w-full cursor-pointer border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            Settings
          </li>
          <Link className="w-full" to="/account">
            <li
              className="w-full cursor-pointer border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white"
              onClick={() => profileToggler((prev) => !prev)}
            >
              Account
            </li>
          </Link>
          <li className="mb-4 w-full cursor-pointer border-b border-t px-4 py-2 hover:border-b-helpMe-950 hover:border-t-helpMe-950 hover:bg-black/75 hover:text-white">
            Role{" "}
            <span className={`${status} ml-2 rounded py-1 ring-1`}>
              {capitalizeFirstLetter(user.role)}
            </span>
          </li>
          <li className="px-4" onClick={() => authUserLogout()}>
            <button className="w-full cursor-pointer rounded-md bg-red-500 py-2 text-center text-white shadow hover:bg-black/75 hover:text-white">
              Log Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
