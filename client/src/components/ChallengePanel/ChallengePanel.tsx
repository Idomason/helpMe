import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  LoaderCircle,
  Upload,
  Send,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
} from "lucide-react";
import { useMyRewardAllocations, useMySubmission, useSubmissions, type Submission } from "../../hooks/useSubmissions";

interface Props {
  giveawayId: string;
  ownerId?: string | null;
  prizeAmount?: number;
  isFunded?: boolean;
}
interface AuthUser { _id: string }

const statusPill: Record<Submission["status"], string> = {
  submitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  rewarded: "bg-amber-50 text-amber-700 ring-amber-600/20",
  selected: "bg-purple-50 text-purple-700 ring-purple-600/20",
};

export default function ChallengePanel({ giveawayId, ownerId, prizeAmount = 0, isFunded = true }: Props) {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery<AuthUser>({ queryKey: ["authUser"] });
  const isOwner = !!authUser && authUser._id === ownerId;

  const { data: mySubmission } = useMySubmission(giveawayId, !!authUser && !isOwner);
  const { data: submissions } = useSubmissions(giveawayId, isOwner);
  const { data: rewards } = useMyRewardAllocations(!!authUser && !isOwner);
  const reward = rewards?.find((item) => item.giveaway_id === giveawayId && item.status === "selected");

  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Submit proof
  const { mutate: submit, isLoading: submitting } = useMutation({
    mutationFn: async () => {
      let proofUrl: string | undefined;
      let proofPath: string | undefined;
      if (proofFile) {
        const fd = new FormData();
        fd.append("image", proofFile);
        fd.append("type", "submission");
        const up = await fetch("/api/v1/upload", { method: "POST", body: fd, credentials: "include" });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.message || "Proof upload failed");
        proofUrl = upData.data.url;
        proofPath = upData.data.publicId;
      }
      const res = await fetch(`/api/v1/giveaways/${giveawayId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ proofText, proofUrl, proofPath }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Submission received!");
      queryClient.invalidateQueries({ queryKey: ["mySubmission", giveawayId] });
      setProofText("");
      setProofFile(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  // Judge (reward / reject)
  const judge = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "reward" | "reject" }) => {
      const res = await fetch(`/api/v1/giveaways/submissions/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      return data;
    },
    onSuccess: (_d, v) => {
      toast.success(v.action === "reward" ? "Winner selected. They have seven days to claim." : "Submission rejected");
      queryClient.invalidateQueries({ queryKey: ["submissions", giveawayId] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const claimReward = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/giveaways/rewards/${reward!.id}/claim`, { method: "POST", credentials: "include" });
      const body = await response.json(); if (!response.ok) throw new Error(body.message); return body;
    },
    onSuccess: () => { toast.success("Reward added to your wallet"); queryClient.invalidateQueries({ queryKey: ["myRewardAllocations"] }); queryClient.invalidateQueries({ queryKey: ["wallet"] }); queryClient.invalidateQueries({ queryKey: ["mySubmission", giveawayId] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Claim failed"),
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
          <Trophy className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Giveaway Challenge</h3>
          <p className="text-xs text-gray-500">
            {prizeAmount > 0 ? `Prize: ₦${prizeAmount.toLocaleString()}` : "Complete the task to win"}
          </p>
        </div>
      </div>

      {prizeAmount > 0 && !isFunded && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          This challenge is awaiting escrow funding before it goes live.
        </p>
      )}

      {/* OWNER: judging panel */}
      {isOwner ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            Submissions ({submissions?.length || 0})
          </p>
          {(!submissions || submissions.length === 0) && (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">No submissions yet.</p>
          )}
          {submissions?.map((s) => (
            <div key={s._id} className="rounded-xl border border-gray-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{s.participant?.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusPill[s.status]}`}>
                  {s.status}
                </span>
              </div>
              {s.proofText && <p className="mb-2 text-sm text-gray-600">{s.proofText}</p>}
              {s.proofUrl && (
                <a href={s.proofUrl} target="_blank" rel="noreferrer" className="mb-2 inline-block text-xs font-medium text-helpMe-600 underline">
                  View proof
                </a>
              )}
              {s.status === "submitted" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => judge.mutate({ id: s._id, action: "reward" })}
                    disabled={judge.isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Award className="h-3.5 w-3.5" />
                    Select Winner
                  </button>
                  <button
                    onClick={() => judge.mutate({ id: s._id, action: "reject" })}
                    disabled={judge.isLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-600/20 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !authUser ? (
        <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Log in to participate in this challenge.
        </p>
      ) : mySubmission ? (
        /* PARTICIPANT: already submitted */
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {mySubmission.status === "rewarded" || mySubmission.status === "approved" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : mySubmission.status === "rejected" ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600" />
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusPill[mySubmission.status]}`}>
              {mySubmission.status}
            </span>
          </div>
          {reward && (
            <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm text-purple-800">
              <p className="font-bold">You were selected</p>
              <p className="mt-1 text-xs">Claim by {new Date(reward.claim_expires_at).toLocaleString()}.</p>
              <button onClick={() => claimReward.mutate()} disabled={claimReward.isLoading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-helpMe-950 px-3 py-2 font-bold text-white disabled:opacity-50">{claimReward.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Award className="h-4 w-4"/>}Claim ₦{(reward.amount_kobo / 100).toLocaleString()} to wallet</button>
            </div>
          )}
          {mySubmission.status === "rewarded" && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              🏆 Reward claimed. It is now in your withdrawable wallet balance.
            </p>
          )}
          {mySubmission.status === "submitted" && (
            <p className="text-sm text-gray-500">Your submission is under review.</p>
          )}
        </div>
      ) : (
        /* PARTICIPANT: submit form */
        <div className="space-y-3">
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
            rows={3}
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            placeholder="Describe how you completed the task…"
          />
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition hover:border-helpMe-500 hover:bg-white">
            <Upload className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{proofFile ? proofFile.name : "Attach proof (optional)"}</span>
            <input type="file" accept="image/*" hidden onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
          </label>
          <button
            onClick={() => (proofText || proofFile ? submit() : toast.error("Add proof text or a file"))}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-helpMe-800 disabled:opacity-50"
          >
            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Entry
          </button>
        </div>
      )}
    </div>
  );
}
