import { Link } from "react-router-dom";
import {
  FileText,
  Flame,
  Gift,
  Sparkles,
  HandHeart,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { useStats } from "../../hooks/useStats";

function StatCard({ label, value, Icon, accent }: { label: string; value: number | string; Icon: typeof FileText; accent: string }) {
  return (
    <div className="rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-gray-200/60 sm:rounded-2xl sm:p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-2 text-xl font-bold text-gray-900 sm:mt-3 sm:text-2xl">{value}</p>
      <p className="text-xs leading-4 text-gray-500 sm:text-sm">{label}</p>
    </div>
  );
}

export default function DashOverview({ user }: { user?: any }) {
  const { data: stats } = useStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-helpMe-950 to-purple-900 p-5 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl font-bold sm:text-2xl">
            Welcome back, {user?.name?.split(" ")[0] || "friend"} 👋
          </h2>
          <p className="mt-1 text-sm text-helpMe-200">
            Ask for help, support a request, or run a giveaway — all in one place.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link to="/dashboard?tab=requests&new=1" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600">
              <PlusCircle className="h-4 w-4" /> Post a Request
            </Link>
            <Link to="/all-help-requests" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Browse Requests <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="My Requests" value={stats?.myRequests ?? 0} Icon={FileText} accent="bg-blue-50 text-blue-600" />
        <StatCard label="My Active" value={stats?.myActiveRequests ?? 0} Icon={Flame} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="All Requests" value={stats?.totalRequests ?? 0} Icon={HandHeart} accent="bg-pink-50 text-pink-600" />
        <StatCard label="Active Giveaways" value={stats?.activeGiveaways ?? 0} Icon={Gift} accent="bg-amber-50 text-amber-600" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/giveaways" className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 transition hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Gift className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Giveaways</p>
            <p className="text-sm text-gray-500">Join a challenge and win rewards</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
        </Link>
        <Link to="/free-help/offers" className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 transition hover:shadow-md sm:gap-4 sm:p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600"><Sparkles className="h-5 w-5" /></div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Free Help</p>
            <p className="text-sm text-gray-500">No-cost offers from the community</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
