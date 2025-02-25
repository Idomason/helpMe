import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import { useQuery } from "@tanstack/react-query";

export default function ProfileInfo() {
  const { data: user } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="pt-24">
      {/* Profile */}
      <ProfileSettings user={user} />
      {/* Password */}
      <PasswordSettings />
    </div>
  );
}
