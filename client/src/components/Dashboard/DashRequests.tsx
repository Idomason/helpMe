import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, MapPin, ArrowRight, Inbox, X } from "lucide-react";
import Spinner from "../Spinner/Spinner";
import RequestForm from "../RequestForm/RequestForm";
import { categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";

export default function DashRequests({ user }: { user?: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);

  // Auto-open the modal when arriving with ?new=1
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowForm(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-my-requests", user?._id],
    queryFn: async () => {
      const res = await fetch("/api/v1/requests");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return (json.data?.requests || []).filter(
        (r: any) => r.user?._id === user?._id,
      );
    },
    enabled: !!user?._id,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-stretch sm:justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-helpMe-800 sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200/60">
          <Inbox className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">No requests yet</p>
          <p className="text-sm text-gray-500">Create your first help request to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-helpMe-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-helpMe-800"
          >
            <PlusCircle className="h-4 w-4" /> New Request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r: any) => (
            <Link key={r._id} to={`/requests/${r._id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 transition hover:shadow-md">
              <div className="relative h-36 overflow-hidden">
                <img src={imgOrPlaceholder(r.image?.url)} alt={r.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-white ${r.status === "active" ? "bg-emerald-500" : "bg-gray-500"}`}>{r.status}</span>
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-helpMe-600">{categoryLabel(r.category)}</span>
                <h3 className="mt-1 line-clamp-1 font-bold text-gray-900">{r.name}</h3>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" /> {r.city}</div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-bold text-pink-500">₦{Number(r.specificDetails?.amount || 0).toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-helpMe-600">View <ArrowRight className="h-3.5 w-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Request modal */}
      {showForm && (
        <div className="fixed inset-0 z-[10003] flex items-end justify-center overflow-hidden bg-black/50 backdrop-blur-sm sm:items-start sm:overflow-y-auto sm:p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="create-request-title" className="dashboard-mobile-sheet relative h-[100dvh] w-full overflow-hidden bg-white sm:my-6 sm:h-auto sm:max-w-2xl sm:rounded-2xl sm:shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:rounded-t-2xl sm:px-6 sm:py-4">
              <h3 id="create-request-title" className="text-lg font-bold text-gray-900">Create a Request</h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="rounded-b-2xl bg-white">
              <RequestForm onSuccess={() => setShowForm(false)} inModal />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
