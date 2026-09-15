import { useQuery } from "@tanstack/react-query";

export interface Submission {
  _id: string;
  giveawayId: string;
  participantId: string;
  proofText?: string;
  proofUrl?: string;
  status: "submitted" | "selected" | "approved" | "rejected" | "rewarded";
  reviewNote?: string;
  createdAt: string;
  participant?: { _id: string; name: string; email: string };
}

export const useMySubmission = (giveawayId?: string, enabled = true) =>
  useQuery<Submission | null>({
    queryKey: ["mySubmission", giveawayId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/giveaways/${giveawayId}/my-submission`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load submission");
      const data = await res.json();
      return data.data as Submission | null;
    },
    enabled: !!giveawayId && enabled,
  });

export const useSubmissions = (giveawayId?: string, enabled = true) =>
  useQuery<Submission[]>({
    queryKey: ["submissions", giveawayId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/giveaways/${giveawayId}/submissions`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();
      return data.data as Submission[];
    },
    enabled: !!giveawayId && enabled,
  });

export interface RewardAllocation {
  id: string;
  giveaway_id: string;
  amount_kobo: number;
  status: "selected" | "claimed" | "expired" | "reassigned" | "cancelled";
  claim_expires_at: string;
}

export const useMyRewardAllocations = (enabled = true) => useQuery<RewardAllocation[]>({
  queryKey: ["myRewardAllocations"],
  enabled,
  queryFn: async () => {
    const response = await fetch("/api/v1/giveaways/rewards/mine", { credentials: "include" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Failed to load rewards");
    return body.data as RewardAllocation[];
  },
});
