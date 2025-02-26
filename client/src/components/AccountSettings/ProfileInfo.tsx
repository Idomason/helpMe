import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import { useQuery } from "@tanstack/react-query";
import { IUser } from "../../utils/types";

export default function ProfileInfo() {
  const { data: user } = useQuery<IUser>({ queryKey: ["authUser"] });

  return (
    <div className="pt-24">
      {/* Profile */}
      <ProfileSettings user={user} />
      {/* Password */}
      <PasswordSettings />
    </div>
  );
}
