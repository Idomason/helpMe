import { useQuery } from "@tanstack/react-query";
import { IUser } from "../utils/types";

export const fetchAuthUser = async (): Promise<IUser | null> => {
  const response = await fetch("/api/v1/users/me");
  if (!response.ok) return null;
  return response.json() as Promise<IUser>;
};

export const useAuthUser = () => useQuery<IUser | null>({
  queryKey: ["authUser"],
  queryFn: fetchAuthUser,
  retry: false,
});
