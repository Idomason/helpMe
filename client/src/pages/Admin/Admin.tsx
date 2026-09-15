import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  ShieldAlert,
  Flag,
  Wallet,
  HeartHandshake,
  Trophy,
  Home,
  LogOut,
  Menu,
  UserCog,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminStats } from "../../hooks/useAdmin";
import Spinner from "../../components/Spinner/Spinner";
import AdminUsers from "../../components/Admin/AdminUsers";
import AdminVerifications from "../../components/Admin/AdminVerifications";
import AdminDisputes from "../../components/Admin/AdminDisputes";
import AdminReports from "../../components/Admin/AdminReports";
import AdminAccount from "../../components/Admin/AdminAccount";
import AdminPayments from "../../components/Admin/AdminPayments";

type Tab = "overview" | "users" | "verifications" | "payments" | "disputes" | "reports" | "account";

function StatCard({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number | string;
  Icon: typeof Users;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/60">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const VALID_TABS: Tab[] = ["overview", "users", "verifications", "payments", "disputes", "reports", "account"];
  const initialTab = (searchParams.get("tab") as Tab) || "overview";
  const [tab, setTab] = useState<Tab>(
    VALID_TABS.includes(initialTab) ? initialTab : "overview",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: authUser, isLoading: authLoading } = useQuery<any>({ queryKey: ["authUser"] });
  const { data: stats } = useAdminStats();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await fetch("/api/v1/users/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out");
    },
  });

  if (authLoading) return <Spinner />;
  if (!authUser) return <Navigate to="/login" replace />;
  if (authUser.role !== "admin") return <Navigate to="/" replace />;

  const nav: { id: Tab; label: string; Icon: typeof Users; badge?: number }[] = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "users", label: "Users", Icon: Users },
    { id: "verifications", label: "Verifications", Icon: BadgeCheck, badge: stats?.pendingVerifications },
    { id: "payments", label: "Payments", Icon: Wallet },
    { id: "disputes", label: "Disputes", Icon: ShieldAlert, badge: stats?.openDisputes },
    { id: "reports", label: "Reports", Icon: Flag, badge: stats?.openReports },
    { id: "account", label: "My Account", Icon: UserCog },
  ];

  const activeLabel = nav.find((n) => n.id === tab)?.label ?? "Overview";
  const subtitles: Record<Tab, string> = {
    overview: "Platform metrics at a glance.",
    users: "Manage roles and account status.",
    verifications: "Review helper identity verifications.",
    payments: "Review withdrawals and payment operations.",
    disputes: "Resolve escrow disputes.",
    reports: "Moderate flagged content.",
    account: "Manage your admin profile and security.",
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500 text-sm font-bold text-white">
          H
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">HelpMe</p>
          <p className="text-[11px] text-helpMe-300">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setTab(n.id);
              setMobileOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === n.id
                ? "bg-white/10 text-white"
                : "text-helpMe-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <n.Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{n.label}</span>
            {!!n.badge && n.badge > 0 && (
              <span className="rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-helpMe-200 transition hover:bg-white/5 hover:text-white"
        >
          <Home className="h-5 w-5" />
          Back to Site
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden h-screen w-60 shrink-0 bg-helpMe-950 lg:block">
          {SidebarContent}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[10002] lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-helpMe-950 shadow-2xl">
              {SidebarContent}
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex h-screen min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{activeLabel}</h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                {subtitles[tab]}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-6xl">
              {tab === "overview" && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatCard label="Total Users" value={stats?.totalUsers ?? 0} Icon={Users} accent="bg-blue-50 text-blue-600" />
                  <StatCard label="Verified Members" value={stats?.verifiedMembers ?? 0} Icon={BadgeCheck} accent="bg-emerald-50 text-emerald-600" />
                  <StatCard label="Help Requests" value={stats?.totalRequests ?? 0} Icon={HeartHandshake} accent="bg-pink-50 text-pink-600" />
                  <StatCard label="Giveaways" value={stats?.totalGiveaways ?? 0} Icon={Trophy} accent="bg-amber-50 text-amber-600" />
                  <StatCard label="Held in Escrow" value={`₦${(stats?.heldVolume ?? 0).toLocaleString()}`} Icon={Wallet} accent="bg-indigo-50 text-indigo-600" />
                  <StatCard label="Released Volume" value={`₦${(stats?.releasedVolume ?? 0).toLocaleString()}`} Icon={Wallet} accent="bg-emerald-50 text-emerald-600" />
                  <StatCard label="Open Disputes" value={stats?.openDisputes ?? 0} Icon={ShieldAlert} accent="bg-red-50 text-red-600" />
                  <StatCard label="Open Reports" value={stats?.openReports ?? 0} Icon={Flag} accent="bg-orange-50 text-orange-600" />
                </div>
              )}

              {tab === "users" && <AdminUsers />}
              {tab === "verifications" && <AdminVerifications />}
              {tab === "payments" && <AdminPayments />}
              {tab === "disputes" && <AdminDisputes />}
              {tab === "reports" && <AdminReports />}
              {tab === "account" && <AdminAccount />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
