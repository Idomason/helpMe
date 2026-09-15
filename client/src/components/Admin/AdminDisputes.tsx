import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, RotateCcw, XCircle, LoaderCircle } from "lucide-react";
import { useAdminDisputes } from "../../hooks/useAdmin";

export default function AdminDisputes() {
  const queryClient = useQueryClient();
  const { data: disputes, isLoading } = useAdminDisputes();

  const resolve = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "release" | "refund" | "dismiss" }) => {
      const res = await fetch(`/api/v1/admin/disputes/${id}/resolve`, {
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
      queryClient.invalidateQueries({ queryKey: ["adminDisputes"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading)
    return <div className="flex justify-center py-10"><LoaderCircle className="h-5 w-5 animate-spin text-helpMe-500" /></div>;

  return (
    <div className="space-y-3">
      {(!disputes || disputes.length === 0) && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-200/60">
          No open disputes.
        </div>
      )}
      {disputes?.map((d: any) => (
        <div key={d._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/60">
          <p className="font-semibold text-gray-900">{d.reason}</p>
          {d.details && <p className="mt-1 text-sm text-gray-500">{d.details}</p>}
          <p className="mt-1 text-xs text-gray-400">Escrow: {d.escrowId}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => resolve.mutate({ id: d._id, decision: "release" })}
              disabled={resolve.isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Release to beneficiary
            </button>
            <button
              onClick={() => resolve.mutate({ id: d._id, decision: "refund" })}
              disabled={resolve.isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Refund funder
            </button>
            <button
              onClick={() => resolve.mutate({ id: d._id, decision: "dismiss" })}
              disabled={resolve.isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" /> Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
