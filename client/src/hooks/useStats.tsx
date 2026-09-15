import { useQuery } from "@tanstack/react-query";

export interface PlatformStats {
  totalRequests: number;
  activeRequests: number;
  totalGiveaways: number;
  activeGiveaways: number;
  myRequests: number;
  myActiveRequests: number;
}

export const useStats = () => {
  return useQuery<PlatformStats>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      return data.data as PlatformStats;
    },
    staleTime: 30_000,
  });
};
