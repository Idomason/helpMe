import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  FileText,
  Gift,
  Home,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Trophy,
  UserCog,
  Wallet,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminAccount from "../../components/Admin/AdminAccount";
import HelperSettings from "../../components/AccountSettings/HelperSettings";
import DashFinance from "../../components/Dashboard/DashFinance";
import DashGiveaways from "../../components/Dashboard/DashGiveaways";
import DashGiverBoard from "../../components/Dashboard/DashGiverBoard";
import DashOverview from "../../components/Dashboard/DashOverview";
import DashRequests from "../../components/Dashboard/DashRequests";
import Spinner from "../../components/Spinner/Spinner";
import { userInitials } from "../../utils/userInitials";
import DashboardNotifications from "../../components/Dashboard/DashboardNotifications";
import type { IUser } from "../../utils/types";

type Tab =
  | "overview"
  | "requests"
  | "giveaways"
  | "giver-board"
  | "finance"
  | "profile"
  | "account";

const VALID_TABS: Tab[] = [
  "overview",
  "requests",
  "giveaways",
  "giver-board",
  "finance",
  "profile",
  "account",
];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.has("paymentReference")
    ? "finance"
    : searchParams.get("tab") as Tab) || "overview";
  const [tab, setTab] = useState<Tab>(
    VALID_TABS.includes(initialTab) ? initialTab : "overview",
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const moreSheetRef = useRef<HTMLDivElement>(null);
  const tabParam = searchParams.get("tab") as Tab | null;

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) setTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!moreOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = moreTriggerRef.current;
    document.body.style.overflow = "hidden";
    const sheet = moreSheetRef.current;
    const focusable = () => Array.from(
      sheet?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [],
    );
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [moreOpen]);

  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<IUser | null>({ queryKey: ["authUser"] });
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await fetch("/api/v1/users/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out");
    },
  });

  if (isLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  const isVerified = !!user.isVerified;
  const nav: { id: Tab; label: string; Icon: typeof FileText; show: boolean }[] = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard, show: true },
    { id: "requests", label: "My Requests", Icon: FileText, show: true },
    { id: "giveaways", label: "Giveaways", Icon: Gift, show: true },
    { id: "giver-board", label: "Giver-board", Icon: Trophy, show: true },
    { id: "finance", label: "Wallet", Icon: Wallet, show: true },
    { id: "profile", label: "Profile & Verification", Icon: BadgeCheck, show: true },
    { id: "account", label: "My Account", Icon: UserCog, show: true },
  ];
  const visibleNav = nav.filter((item) => item.show);
  const primaryTabs: Tab[] = ["overview", "requests", "giveaways", "finance"];
  const secondaryTabs: Tab[] = ["giver-board", "profile", "account"];
  const activeLabel = visibleNav.find((item) => item.id === tab)?.label ?? "Overview";
  const subtitles: Record<Tab, string> = {
    overview: "Your activity at a glance.",
    requests: "Create and manage your help requests.",
    giveaways: "Browse, join, and create financial giveaways.",
    "giver-board": "Track your giving impact, rank, and board visibility.",
    finance: "Add funds, withdraw rewards, and track activity.",
    profile: "Your expertise, awards, and verification status.",
    account: "Manage your profile and security.",
  };

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    setMoreOpen(false);
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    if (nextTab !== "finance") {
      next.delete("paymentReference");
      next.delete("transactionReference");
    }
    if (nextTab !== "requests") next.delete("new");
    setSearchParams(next);
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">
          {user.profileImg?.url ? (
            <img src={user.profileImg.url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            userInitials(user.name || "")
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">{user.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-helpMe-300">
            {isVerified ? (
              <>
                <BadgeCheck className="h-3 w-3 text-emerald-400" /> Verified Member
              </>
            ) : (
              "Dashboard"
            )}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleNav.map((item) => (
          <button
            key={item.id}
            aria-pressed={tab === item.id}
            onClick={() => selectTab(item.id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === item.id
                ? "bg-white/10 text-white"
                : "text-helpMe-200 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-helpMe-200 transition hover:bg-white/5 hover:text-white"
        >
          <Home className="h-5 w-5" /> Back to Site
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut className="h-5 w-5" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-gray-50">
      <div className="flex h-[100dvh]">
        <aside className="hidden h-[100dvh] w-60 shrink-0 bg-helpMe-950 lg:block">
          {SidebarContent}
        </aside>

        <main className="flex h-[100dvh] min-w-0 flex-1 flex-col">
          <div className="relative z-[60] flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-xs font-bold text-white lg:hidden">
              {user.profileImg?.url ? (
                <img src={user.profileImg.url} alt="" className="h-full w-full object-cover" />
              ) : userInitials(user.name || "")}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900">{activeLabel}</h1>
              <p className="hidden text-xs text-gray-500 sm:block">{subtitles[tab]}</p>
            </div>
            <DashboardNotifications />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-3 sm:p-6 lg:pb-6">
            <div className="mx-auto max-w-6xl">
              {tab === "overview" && <DashOverview user={user} />}
              {tab === "requests" && <DashRequests user={user} />}
              {tab === "giveaways" && <DashGiveaways isVerified={isVerified} />}
              {tab === "giver-board" && <DashGiverBoard />}
              {tab === "finance" && <DashFinance />}
              {tab === "profile" && <HelperSettings />}
              {tab === "account" && <AdminAccount />}
            </div>
          </div>
        </main>

        <nav aria-label="Dashboard navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/90 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-18px_rgba(40,12,67,0.45)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid h-[4.25rem] max-w-xl grid-cols-5">
            {visibleNav.filter((item) => primaryTabs.includes(item.id)).map((item) => {
              const active = tab === item.id;
              return (
                <button key={item.id} type="button" aria-current={active ? "page" : undefined} onClick={() => selectTab(item.id)} className={`group relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 focus-visible:ring-offset-1 ${active ? "text-helpMe-900" : "text-gray-500 active:bg-gray-100"}`}>
                  <span className={`grid h-7 min-w-10 place-items-center rounded-full px-2 transition ${active ? "bg-helpMe-100 text-helpMe-800" : "group-active:bg-gray-100"}`}><item.Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.4 : 2} /></span>
                  <span>{item.id === "requests" ? "Requests" : item.label}</span>
                </button>
              );
            })}
            <button ref={moreTriggerRef} type="button" aria-label="More dashboard options" aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)} className={`group relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 focus-visible:ring-offset-1 ${moreOpen || secondaryTabs.includes(tab) ? "text-helpMe-900" : "text-gray-500 active:bg-gray-100"}`}>
              <span className={`grid h-7 min-w-10 place-items-center rounded-full px-2 transition ${moreOpen || secondaryTabs.includes(tab) ? "bg-helpMe-100 text-helpMe-800" : "group-active:bg-gray-100"}`}><MoreHorizontal className="h-5 w-5" /></span>
              <span>More</span>
            </button>
          </div>
        </nav>

        {moreOpen && (
          <div className="fixed inset-0 z-[10002] lg:hidden" role="presentation">
            <button type="button" aria-label="Close more options" onClick={() => setMoreOpen(false)} className="absolute inset-0 h-full w-full bg-gray-950/45 backdrop-blur-[2px]" />
            <div ref={moreSheetRef} role="dialog" aria-modal="true" aria-labelledby="dashboard-more-title" className="dashboard-more-sheet absolute inset-x-0 bottom-0 max-h-[min(82dvh,42rem)] overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">
                  {user.profileImg?.url ? <img src={user.profileImg.url} alt="" className="h-full w-full object-cover" /> : userInitials(user.name || "")}
                </div>
                <div className="min-w-0 flex-1"><h2 id="dashboard-more-title" className="truncate text-sm font-bold text-gray-950">{user.name}</h2><p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">{isVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />}{isVerified ? "Verified member" : "Member account"}</p></div>
                <button type="button" onClick={() => setMoreOpen(false)} aria-label="Close more options" className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-600 transition active:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-1 py-3">
                {visibleNav.filter((item) => secondaryTabs.includes(item.id)).map((item) => (
                  <button key={item.id} type="button" onClick={() => selectTab(item.id)} aria-current={tab === item.id ? "page" : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 ${tab === item.id ? "bg-helpMe-50 text-helpMe-900" : "text-gray-700 active:bg-gray-100"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${tab === item.id ? "bg-white text-helpMe-800 shadow-sm" : "bg-gray-100 text-gray-600"}`}><item.Icon className="h-[19px] w-[19px]" /></span>{item.label}</button>
                ))}
              </div>
              <div className="grid gap-1 border-t border-gray-100 pt-3">
                <Link to="/" onClick={() => setMoreOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-gray-700 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100"><Home className="h-[19px] w-[19px]" /></span>Back to Site</Link>
                <button type="button" onClick={() => logout()} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-600 active:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50"><LogOut className="h-[19px] w-[19px]" /></span>Log Out</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
