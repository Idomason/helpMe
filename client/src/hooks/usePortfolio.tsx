import { useQuery } from "@tanstack/react-query";

export interface PortfolioAward {
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  earnedAt: string;
}

export interface Portfolio {
  profile: {
    bio: string;
    skills: string[];
    criteriaTags: string[];
    location: string;
    verificationStatus: "unverified" | "pending" | "verified" | "rejected";
    isVerified: boolean;
    rating: number;
    helpsCount: number;
    level: string;
    user?: { _id: string; name: string; email: string; role: string; profileImg?: { url: string } };
  };
  helpsRendered: number;
  awards: PortfolioAward[];
  requests: any[];
  joinedAt: string;
}

export const usePortfolio = (name?: string) =>
  useQuery<Portfolio>({
    queryKey: ["portfolio", name],
    queryFn: async () => {
      const res = await fetch(`/api/v1/portfolio/${encodeURIComponent(name!)}`);
      if (!res.ok) throw new Error("Portfolio not found");
      const data = await res.json();
      return data.data as Portfolio;
    },
    enabled: !!name,
  });

export const useWeeklyLeaderboard = () =>
  useQuery<any[]>({
    queryKey: ["weeklyLeaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/v1/requests/leaderboard/weekly");
      if (!res.ok) throw new Error("Failed to load leaderboard");
      const data = await res.json();
      return data.data.requests as any[];
    },
    staleTime: 60_000,
  });

export type GiverBoardPeriod = "month" | "all";

export interface RankedGiver {
  rank: number;
  user: { id: string; name: string; profileImg: string };
  location: string;
  isVerified: boolean;
  level: string;
  points: number;
  impactCount: number;
  helpCount: number;
  giveawayCount: number;
  latestImpactAt: string;
  isAnonymous: boolean;
  isDemo?: boolean;
}

export interface GiverBoardData {
  period: GiverBoardPeriod;
  periodStart: string | null;
  summary: { totalGivers: number; totalImpactActions: number };
  givers: RankedGiver[];
  isDemo?: boolean;
}

export const useGiverBoard = (period: GiverBoardPeriod) =>
  useQuery<GiverBoardData>({
    queryKey: ["giverBoard", period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/portfolio/leaderboard?period=${period}`);
      if (!res.ok) throw new Error("Failed to load the Givers-board");
      const data = await res.json();
      return data.data as GiverBoardData;
    },
    staleTime: 60_000,
  });

export interface MyGiverPerformanceData {
  period: GiverBoardPeriod;
  periodStart: string | null;
  performance: {
    isRanked: boolean;
    rank: number | null;
    totalGivers: number;
    points: number;
    impactCount: number;
    helpCount: number;
    giveawayCount: number;
    latestImpactAt: string | null;
    isAnonymous: boolean;
    nextRank: { rank: number; pointsNeeded: number; actionsNeeded: number } | null;
  };
  nearbyGivers: RankedGiver[];
}

export const useMyGiverPerformance = (period: GiverBoardPeriod) =>
  useQuery<MyGiverPerformanceData>({
    queryKey: ["myGiverPerformance", period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/portfolio/leaderboard/me?period=${period}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load your Givers-board performance");
      const data = await res.json();
      return data.data as MyGiverPerformanceData;
    },
    staleTime: 30_000,
  });

export const useFreeHelp = () =>
  useQuery<any[]>({
    queryKey: ["freeHelp"],
    queryFn: async () => {
      const res = await fetch("/api/v1/requests/free-help");
      if (!res.ok) throw new Error("Failed to load free help");
      const data = await res.json();
      return data.data.requests as any[];
    },
  });
