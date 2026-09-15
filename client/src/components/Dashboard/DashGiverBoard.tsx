import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Award, CheckCircle2, EyeOff, Gift, HandHeart, LoaderCircle, MapPin, RefreshCw, ShieldCheck, Trophy, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useHelperProfile } from "../../hooks/useHelperProfile";
import { GiverBoardPeriod, RankedGiver, useMyGiverPerformance } from "../../hooks/usePortfolio";

function Stat({ label, value, Icon, tone }: { label: string; value: string | number; Icon: typeof Trophy; tone: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm sm:rounded-2xl sm:p-4"><div className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><p className="mt-2 text-xl font-black tracking-tight text-gray-950 sm:mt-3 sm:text-2xl">{value}</p><p className="mt-0.5 text-[11px] leading-4 text-gray-500 sm:text-xs">{label}</p></div>;
}

function NearbyGiver({ giver }: { giver: RankedGiver }) {
  const identity = <><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-black text-helpMe-800">{giver.isAnonymous ? <UserRound className="h-5 w-5" /> : giver.user.name.charAt(0)}</div><div className="min-w-0 flex-1"><p className="flex items-center gap-1 truncate text-sm font-bold text-gray-900">{giver.user.name}{giver.isVerified && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}</p><p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">{giver.location ? <><MapPin className="h-3 w-3" />{giver.location}</> : "Private profile"}</p></div><div className="text-right"><p className="text-sm font-black text-helpMe-900">#{giver.rank}</p><p className="text-[10px] text-gray-500">{giver.points.toLocaleString()} pts</p></div></>;
  const className = "flex items-center gap-3 border-t border-gray-100 px-4 py-3 first:border-0 sm:px-5";
  return giver.isAnonymous || giver.isDemo ? <div className={className}>{identity}</div> : <Link to={`/u/${encodeURIComponent(giver.user.name)}`} className={`${className} transition hover:bg-helpMe-50/50`}>{identity}</Link>;
}

export default function DashGiverBoard() {
  const [period, setPeriod] = useState<GiverBoardPeriod>("month");
  const [privacyOverride, setPrivacyOverride] = useState<boolean | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useMyGiverPerformance(period);
  const { data: profile, isLoading: profileLoading } = useHelperProfile();
  const performance = data?.performance;

  const privacyMutation = useMutation({
    mutationFn: async (leaderboardAnonymous: boolean) => {
      const res = await fetch("/api/v1/helpers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaderboardAnonymous }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Could not update board visibility");
      return result;
    },
    onMutate: (leaderboardAnonymous) => setPrivacyOverride(leaderboardAnonymous),
    onSuccess: (_, leaderboardAnonymous) => {
      queryClient.setQueryData(["helperProfile"], (current: typeof profile) => current ? { ...current, leaderboardAnonymous } : current);
      setPrivacyOverride(null);
      toast.success(leaderboardAnonymous ? "Your Giver-board identity is now private" : "Your Giver-board identity is now public");
      queryClient.invalidateQueries({ queryKey: ["myGiverPerformance"] });
      queryClient.invalidateQueries({ queryKey: ["giverBoard"] });
    },
    onError: (error: unknown) => {
      setPrivacyOverride(null);
      toast.error(error instanceof Error ? error.message : "Could not update visibility");
    },
  });

  if (isLoading || profileLoading) return <div className="space-y-4"><div className="h-36 animate-pulse rounded-2xl bg-gray-200" /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-200" />)}</div></div>;
  if (isError) return <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center"><RefreshCw className="mx-auto h-6 w-6 text-rose-500" /><p className="mt-3 font-bold text-gray-900">Your performance could not be loaded</p><button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-4 rounded-xl bg-helpMe-950 px-4 py-2 text-sm font-bold text-white">Try again</button></div>;

  const anonymous = privacyOverride ?? profile?.leaderboardAnonymous ?? false;
  return <div className="space-y-4 sm:space-y-5">
    <section className="overflow-hidden rounded-2xl bg-helpMe-950 text-white shadow-sm"><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-pink-200 sm:text-[11px]"><Award className="h-3.5 w-3.5" /> Your community impact</div><h2 className="mt-2 text-xl font-black sm:text-2xl">{performance?.isRanked ? `You’re ranked #${performance.rank}` : "Your first impact is waiting"}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-purple-100/70 sm:text-sm sm:leading-6">{performance?.isRanked ? `${performance.points.toLocaleString()} points from verified public giving activity.` : "Complete a public help or fund a monetary giveaway to enter the rankings."}</p></div><div className="grid h-10 w-full shrink-0 grid-cols-2 rounded-xl bg-white/10 p-1 sm:inline-flex sm:w-auto" aria-label="Performance period">{([['month', 'This month'], ['all', 'All time']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPeriod(value)} aria-pressed={period === value} className={`rounded-lg px-4 text-xs font-bold transition ${period === value ? "bg-white text-helpMe-950" : "text-purple-100 hover:bg-white/10"}`}>{label}</button>)}</div></div></section>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Official rank" value={performance?.rank ? `#${performance.rank}` : "—"} Icon={Trophy} tone="bg-amber-50 text-amber-600" /><Stat label="Impact points" value={(performance?.points || 0).toLocaleString()} Icon={Award} tone="bg-purple-50 text-helpMe-700" /><Stat label="Completed helps" value={performance?.helpCount || 0} Icon={HandHeart} tone="bg-pink-50 text-pink-600" /><Stat label="Funded giveaways" value={performance?.giveawayCount || 0} Icon={Gift} tone="bg-emerald-50 text-emerald-600" /></div>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl bg-helpMe-50 p-2 text-helpMe-700"><Trophy className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-gray-950">Next milestone</h3>{performance?.rank === 1 ? <p className="mt-1 text-sm text-gray-500">You currently hold the top position. Keep creating verified impact to stay there.</p> : <><p className="mt-1 text-sm text-gray-500">{performance?.nextRank?.actionsNeeded || 1} more qualifying action{(performance?.nextRank?.actionsNeeded || 1) === 1 ? "" : "s"} can move you toward {performance?.isRanked ? `rank #${performance.nextRank?.rank}` : "the board"}.</p><div className="mt-3 inline-flex rounded-lg bg-helpMe-50 px-3 py-2 text-xs font-bold text-helpMe-800">Next verified action: +100 points</div></>}</div></div></section>
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start gap-3"><div className={`rounded-xl p-2 ${anonymous ? "bg-purple-100 text-helpMe-800" : "bg-emerald-50 text-emerald-700"}`}>{anonymous ? <EyeOff className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><h3 className="font-bold text-gray-950">Board visibility</h3><p className="mt-1 text-sm leading-5 text-gray-500">{anonymous ? "Your name, photo, location, badge, and profile link are hidden. Your points and rank still count." : "Your public profile identity appears beside your verified impact."}</p></div><button type="button" role="switch" aria-checked={anonymous} disabled={privacyMutation.isLoading} onClick={() => privacyMutation.mutate(!anonymous)} className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-helpMe-500 disabled:opacity-60 ${anonymous ? "bg-helpMe-800" : "bg-gray-300"}`} aria-label="Appear anonymously on the Giver-board"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${anonymous ? "translate-x-6" : "translate-x-1"}`} />{privacyMutation.isLoading && <LoaderCircle className="absolute -left-6 top-1.5 h-4 w-4 animate-spin text-helpMe-700" />}</button></div></section>
      </div>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="flex items-center justify-between px-5 py-4"><div><h3 className="font-bold text-gray-950">{performance?.isRanked ? "Nearby rankings" : "People to catch"}</h3><p className="mt-0.5 text-xs text-gray-500">Official positions stay unchanged</p></div><Link to="/giver-board" className="flex items-center gap-1 text-xs font-bold text-helpMe-800">View board <ArrowRight className="h-3.5 w-3.5" /></Link></div>{data?.nearbyGivers.length ? data.nearbyGivers.map((giver) => <NearbyGiver key={`${giver.rank}-${giver.user.id}`} giver={giver} />) : <div className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">The board is waiting for its first qualifying impact.</div>}</section>
    </div>
  </div>;
}
