import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Shield } from "lucide-react";
import ProfileSettings from "../AccountSettings/ProfileSettings";
import PasswordSettings from "../AccountSettings/PasswordSettings";

type SubTab = "profile" | "security";

export default function AdminAccount() {
  const [sub, setSub] = useState<SubTab>("profile");
  const { data: user } = useQuery<any>({ queryKey: ["authUser"] });

  return (
    <div className="mx-auto max-w-4xl">
      {/* Segmented control */}
      <div className="mb-4 grid w-full grid-cols-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-200/60 sm:mb-6 sm:inline-flex sm:w-auto">
        <button
          onClick={() => setSub("profile")}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${
            sub === "profile" ? "bg-helpMe-950 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        <button
          onClick={() => setSub("security")}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${
            sub === "security" ? "bg-helpMe-950 text-white shadow" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Shield className="h-4 w-4" />
          Security
        </button>
      </div>

      {sub === "profile" ? <ProfileSettings user={user} /> : <PasswordSettings />}
    </div>
  );
}
