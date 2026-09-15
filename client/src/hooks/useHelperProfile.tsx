import { useQuery } from "@tanstack/react-query";

export interface HelperProfile {
  _id: string;
  userId: string;
  bio: string;
  skills: string[];
  criteriaTags: string[];
  location: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  isVerified: boolean;
  rating: number;
  helpsCount: number;
  level: string;
  leaderboardAnonymous: boolean;
}

export interface HelperTag {
  id: string;
  slug: string;
  name: string;
}

export const useHelperProfile = (enabled = true) =>
  useQuery<HelperProfile>({
    queryKey: ["helperProfile"],
    queryFn: async () => {
      const res = await fetch("/api/v1/helpers/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load helper profile");
      const data = await res.json();
      return data.data as HelperProfile;
    },
    enabled,
  });

export const useHelperTags = () =>
  useQuery<HelperTag[]>({
    queryKey: ["helperTags"],
    queryFn: async () => {
      const res = await fetch("/api/v1/helpers/tags");
      if (!res.ok) throw new Error("Failed to load tags");
      const data = await res.json();
      return data.data as HelperTag[];
    },
    staleTime: 5 * 60_000,
  });

export interface Verification {
  _id: string;
  status: "pending" | "approved" | "rejected";
  fullName: string;
  idDocumentType: string;
  reviewNote?: string;
  createdAt: string;
}

export const useMyVerification = (enabled = true) =>
  useQuery<Verification | null>({
    queryKey: ["myVerification"],
    queryFn: async () => {
      const res = await fetch("/api/v1/verification/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load verification");
      const data = await res.json();
      return data.data as Verification | null;
    },
    enabled,
  });
