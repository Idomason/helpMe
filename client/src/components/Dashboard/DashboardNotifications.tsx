import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  CheckCheck,
  Gift,
  HandHeart,
  LoaderCircle,
  RefreshCw,
  Trophy,
  WalletCards,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Notice {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read_at?: string | null;
  created_at: string;
}

type Filter = "all" | "unread";

const getNotifications = async (): Promise<Notice[]> => {
  const response = await fetch("/api/v1/notifications", { credentials: "include" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Notifications could not be loaded");
  return Array.isArray(body.data) ? body.data : [];
};

const relativeTime = (date: string) => {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return formatter.format(days, "day");
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

function NoticeIcon({ type }: { type: string }) {
  const normalized = type.toLowerCase();
  const config = normalized.includes("giveaway")
    ? { Icon: Gift, tone: "bg-amber-50 text-amber-700" }
    : normalized.includes("request") || normalized.includes("claim")
      ? { Icon: HandHeart, tone: "bg-pink-50 text-pink-700" }
      : normalized.includes("wallet") || normalized.includes("payment") || normalized.includes("withdraw")
        ? { Icon: WalletCards, tone: "bg-emerald-50 text-emerald-700" }
        : normalized.includes("rank") || normalized.includes("award")
          ? { Icon: Trophy, tone: "bg-purple-50 text-helpMe-800" }
          : { Icon: BellRing, tone: "bg-blue-50 text-blue-700" };
  return <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.tone}`}><config.Icon className="h-[18px] w-[18px]" /></span>;
}

export default function DashboardNotifications() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const query = useQuery<Notice[]>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const data = useMemo(() => query.data || [], [query.data]);
  const unread = data.filter((notice) => !notice.read_at).length;
  const visible = useMemo(
    () => filter === "unread" ? data.filter((notice) => !notice.read_at) : data,
    [data, filter],
  );

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Notification could not be updated");
      return body;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<Notice[]>(["notifications"]);
      queryClient.setQueryData<Notice[]>(["notifications"], (current = []) => current.map((notice) =>
        notice.id === id ? { ...notice, read_at: new Date().toISOString() } : notice,
      ));
      return { previous };
    },
    onError: (error: unknown, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["notifications"], context.previous);
      toast.error(error instanceof Error ? error.message : "Notification could not be updated");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/notifications/read-all", { method: "PATCH", credentials: "include" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Notifications could not be updated");
      return body;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<Notice[]>(["notifications"]);
      const readAt = new Date().toISOString();
      queryClient.setQueryData<Notice[]>(["notifications"], (current = []) => current.map((notice) => ({ ...notice, read_at: notice.read_at || readAt })));
      return { previous };
    },
    onError: (error: unknown, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(["notifications"], context.previous);
      toast.error(error instanceof Error ? error.message : "Notifications could not be updated");
    },
    onSuccess: () => toast.success("All notifications marked as read"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (isMobile) document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
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
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const openNotice = (notice: Notice) => {
    if (!notice.read_at) markRead.mutate(notice.id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        ref={triggerRef}
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="dashboard-notification-panel"
        onClick={() => setOpen((value) => !value)}
        className={`relative grid h-10 w-10 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 focus-visible:ring-offset-2 ${open ? "border-helpMe-200 bg-helpMe-50 text-helpMe-800" : "border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-helpMe-50 hover:text-helpMe-800"}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-pink-500 px-1 text-[9px] font-extrabold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-[10003] bg-gray-950/40 backdrop-blur-[1px] sm:hidden" />
          <div
            ref={panelRef}
            id="dashboard-notification-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-heading"
            tabIndex={-1}
            className="dashboard-mobile-sheet fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-[10004] flex max-h-[min(82dvh,42rem)] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl ring-1 ring-black/5 outline-none sm:bottom-auto sm:left-auto sm:right-4 sm:top-[4.5rem] sm:w-[24rem] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-helpMe-50 text-helpMe-800"><BellRing className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0 flex-1"><h2 id="notification-heading" className="font-bold text-gray-950">Notifications</h2><p className="text-[11px] text-gray-500">Updates that need your attention</p></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="grid h-9 w-9 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 sm:hidden"><X className="h-[18px] w-[18px]" /></button>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
              <div className="inline-flex rounded-lg bg-gray-100 p-0.5" aria-label="Notification filter">
                {(["all", "unread"] as Filter[]).map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`min-h-8 rounded-md px-3 text-[11px] font-bold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 ${filter === value ? "bg-white text-helpMe-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>{value}{value === "unread" && unread > 0 ? ` ${unread}` : ""}</button>)}
              </div>
              {unread > 0 && <button type="button" onClick={() => markAllRead.mutate()} disabled={markAllRead.isLoading} className="ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-bold text-helpMe-800 transition hover:bg-helpMe-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-600 disabled:opacity-50">{markAllRead.isLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}Mark all read</button>}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {query.isLoading ? (
                <div className="space-y-1 p-3" aria-label="Loading notifications">{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse gap-3 rounded-xl p-2"><div className="h-10 w-10 rounded-xl bg-gray-200" /><div className="flex-1 space-y-2 py-1"><div className="h-3 w-3/4 rounded bg-gray-200" /><div className="h-2.5 w-full rounded bg-gray-100" /></div></div>)}</div>
              ) : query.isError ? (
                <div className="grid min-h-52 place-items-center px-6 py-8 text-center"><div><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><RefreshCw className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-gray-900">Notifications could not be loaded</p><p className="mt-1 text-xs text-gray-500">Check your connection and try again.</p><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-helpMe-950 px-4 text-xs font-bold text-white disabled:opacity-60">{query.isFetching ? "Trying again…" : "Try again"}</button></div></div>
              ) : visible.length === 0 ? (
                <div className="grid min-h-52 place-items-center px-6 py-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-helpMe-50 text-helpMe-700"><CheckCheck className="h-5 w-5" /></span><p className="mt-3 text-sm font-bold text-gray-900">{filter === "unread" ? "You’re all caught up" : "No notifications yet"}</p><p className="mx-auto mt-1 max-w-56 text-xs leading-5 text-gray-500">{filter === "unread" ? "New updates will appear here when they arrive." : "Request claims and giveaway rewards will appear here."}</p></div></div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {visible.map((notice) => {
                    const content = <><NoticeIcon type={notice.type} /><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><p className="min-w-0 flex-1 text-sm font-bold leading-5 text-gray-900">{notice.title}</p>{!notice.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-500" aria-label="Unread" />}</div><p className="mt-0.5 text-xs leading-5 text-gray-500">{notice.body}</p><p className="mt-1 text-[10px] font-medium text-gray-400">{relativeTime(notice.created_at)}</p></div></>;
                    const classes = `flex w-full items-start gap-3 px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-helpMe-600 ${notice.read_at ? "bg-white hover:bg-gray-50" : "bg-purple-50/45 hover:bg-purple-50"}`;
                    return notice.link ? <Link key={notice.id} to={notice.link} onClick={() => openNotice(notice)} className={classes}>{content}</Link> : <button key={notice.id} type="button" onClick={() => openNotice(notice)} className={classes}>{content}</button>;
                  })}
                </div>
              )}
            </div>
            {data.length > 0 && <div className="border-t border-gray-100 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 text-center text-[10px] text-gray-400 sm:pb-2.5">Showing your latest {data.length} {data.length === 1 ? "notification" : "notifications"}</div>}
          </div>
        </>
      )}
    </div>
  );
}
