import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, PlusCircle, X } from "lucide-react";
import Spinner from "../Spinner/Spinner";
import GiftCard from "../CurrentGiveawaysCard/GiftCard";
import GiveawayForm from "../GiveawayForm/GiveawayForm";
import { Giveaway } from "../../store";

export default function DashGiveaways({ isVerified }: { isVerified?: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useQuery<{ data: Giveaway[] }>({
    queryKey: ["giveaways"],
    queryFn: async () => {
      const res = await fetch("/api/v1/giveaways");
      if (!res.ok) throw new Error("Failed to load giveaways");
      return res.json();
    },
  });

  const giveaways = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-stretch sm:justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-helpMe-800 sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Giveaway</span>
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : giveaways.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200/60">
          <Gift className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-semibold text-gray-700">No giveaways yet</p>
          <p className="text-sm text-gray-500">Create the first giveaway challenge.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-helpMe-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-helpMe-800"
          >
            <PlusCircle className="h-4 w-4" /> New Giveaway
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {giveaways.map((g) => (
            <GiftCard key={g._id} giveaway={g} />
          ))}
        </div>
      )}

      {/* New Giveaway modal */}
      {showForm && (
        <div className="fixed inset-0 z-[10003] flex items-end justify-center overflow-hidden bg-black/50 backdrop-blur-sm sm:items-start sm:overflow-y-auto sm:p-6">
          <div role="dialog" aria-modal="true" aria-labelledby="create-giveaway-title" className="dashboard-mobile-sheet relative h-[100dvh] w-full overflow-hidden bg-white sm:my-auto sm:h-auto sm:max-w-3xl sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-black/5">
            <div className="flex items-start justify-between border-b border-gray-100 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
              <div>
                <h3 id="create-giveaway-title" className="text-lg font-bold tracking-tight text-gray-900">Create a giveaway</h3>
                <p className="mt-0.5 text-xs text-gray-500">Give people everything they need to participate.</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white">
              <GiveawayForm onSuccess={() => setShowForm(false)} inModal isVerified={isVerified} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
