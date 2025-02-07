import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";

export default function Profile({ user, open, onClose, status, logout }) {
  // const navigate = useNavigate();

  // const logout = async () => {
  //   const response = await fetch("/api/v1/users/logout", { method: "POST" });

  //   if (!response.ok) throw new Error("Failed to log user out");
  //   const data = await response.json();

  //   if (data.success) {
  //     if (open) {
  //       onClose();
  //     }
  //     navigate("/login");
  //   }
  // };
  return (
    <div className="absolute bottom-0 left-0 top-[49px] min-h-screen w-full bg-black/90 backdrop-blur">
      <div className="flex min-h-fit w-full items-center justify-center px-4 py-10">
        <ul className="flex h-80 w-72 flex-col gap-2 divide-y-2 rounded-md bg-gray-300 p-4 shadow-lg">
          <li className="p w-full pt-2 font-semibold hover:bg-black/75 hover:text-white">
            {capitalizeFirstLetter(user.name)}
          </li>
          <li className="p w-full pt-2 hover:bg-black/75 hover:text-white">
            {user.email}
          </li>
          <li className="p w-full pt-2 hover:bg-black/75 hover:text-white">
            Novice
          </li>
          <li className="p w-full pt-2 hover:bg-black/75 hover:text-white">
            Novice
          </li>
          <li className="p w-full pt-2 hover:bg-black/75 hover:text-white">
            Novice
          </li>
          <li className="p w-full pt-2 hover:bg-black/75 hover:text-white">
            Role{" "}
            <span className={`${status} ml-2 rounded px-2 py-1 ring-1`}>
              {capitalizeFirstLetter(user.role)}
            </span>
          </li>
          <li
            className="p w-full cursor-pointer rounded-md bg-red-500 px-2 pb-2 pt-2 text-center text-white shadow hover:bg-black/75 hover:text-white"
            onClick={logout}
          >
            Log Out
          </li>
        </ul>
      </div>
    </div>
  );
}
