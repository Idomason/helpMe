import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, LoaderCircle, Flag } from "lucide-react";
import { useAdminReports } from "../../hooks/useAdmin";

export default function AdminReports() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useAdminReports();

  const resolve = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "resolved" | "dismissed" }) => {
      const res = await fetch(`/api/v1/admin/reports/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      return data;
    },
    onSuccess: (d) => {
      toast.success(d.message);
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading)
    return <div className="flex justify-center py-10"><LoaderCircle className="h-5 w-5 animate-spin text-helpMe-500" /></div>;

  return (
    <div className="space-y-3">
      {(!reports || reports.length === 0) && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-gray-200/60">
          No open reports.
        </div>
      )}
      {reports?.map((r: any) => (
        <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/60">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-gray-900">{r.reason}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold capitalize text-gray-600">{r.target_type}</span>
          </div>
          {r.details && <p className="mt-1 text-sm text-gray-500">{r.details}</p>}
          <p className="mt-1 text-xs text-gray-400">
            Reported by {r.users?.name || "unknown"} · target {String(r.target_id).slice(0, 8)}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => resolve.mutate({ id: r.id, status: "resolved" })}
              disabled={resolve.isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Resolve
            </button>
            <button
              onClick={() => resolve.mutate({ id: r.id, status: "dismissed" })}
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
