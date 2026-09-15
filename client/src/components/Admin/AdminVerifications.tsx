import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, XCircle, LoaderCircle, FileText } from "lucide-react";
import { useAdminVerifications } from "../../hooks/useAdmin";

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const { data: verifications, isLoading } = useAdminVerifications();

  const review = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => {
      const res = await fetch(`/api/v1/verification/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      return data;
    },
    onSuccess: (d) => {
      toast.success(d.message);
      queryClient.invalidateQueries({ queryKey: ["adminVerifications"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading)
    return <div className="flex justify-center py-10"><LoaderCircle className="h-5 w-5 animate-spin text-helpMe-500" /></div>;

  return (
    <div className="space-y-3">
      {(!verifications || verifications.length === 0) && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-200/60">
          No pending verifications.
        </div>
      )}
      {verifications?.map((v: any) => (
        <div key={v._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-gray-900">{v.fullName}</p>
              <p className="text-sm text-gray-500">{v.user?.name} · {v.user?.email}</p>
              <p className="mt-1 text-xs capitalize text-gray-400">ID type: {v.idDocumentType?.replace(/_/g, " ")}</p>
              {v.idDocumentUrl && (
                <a href={v.idDocumentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-helpMe-600 underline">
                  <FileText className="h-3.5 w-3.5" /> View document
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => review.mutate({ id: v._id, decision: "approved" })}
                disabled={review.isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <BadgeCheck className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => review.mutate({ id: v._id, decision: "rejected" })}
                disabled={review.isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-600/20 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
