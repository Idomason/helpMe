import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../Spinner/Spinner";
import PayoutSettings from "../AccountSettings/PayoutSettings";
import { money, useWallet, type WalletEntry } from "../../hooks/useWallet";

const QUICK_TOPUPS = [5000, 10000, 25000];

const post = async (url: string, body: object) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Action failed");
  return data;
};

const entryAmount = (entry: WalletEntry) =>
  Number(entry.available_delta_kobo || 0) + Number(entry.committed_delta_kobo || 0);

const entryLabel = (type: string) => {
  const labels: Record<string, string> = {
    wallet_topup: "Wallet funded",
    collection_fee: "Payment fee",
    request_funding: "Request supported",
    giveaway_funding: "Giveaway funded",
    giveaway_reward: "Giveaway reward",
    request_release: "Request reward",
    withdrawal_hold: "Withdrawal started",
    withdrawal_completed: "Withdrawal sent",
    withdrawal_reversal: "Withdrawal returned",
    refund: "Funds returned",
  };
  return labels[type] || type.replace(/_/g, " ");
};

export default function DashFinance() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useWallet();
  const handledPaymentReference = useRef<string | null>(null);
  const [topup, setTopup] = useState("");
  const [withdrawal, setWithdrawal] = useState("");
  const pendingAction = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("helpmePendingWalletAction") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (pendingAction?.shortfall) setTopup(String(pendingAction.shortfall));
  }, [pendingAction]);

  const feePreview = useMemo(() => {
    const value = Number(topup) || 0;
    return value * Number(data?.fees.collectionPercent || 0) / 100
      + Number(data?.fees.collectionFlat || 0);
  }, [topup, data]);

  const verify = useMutation({
    mutationFn: (paymentReference: string) => fetch(
      `/api/v1/wallet/topups/${encodeURIComponent(paymentReference)}`,
      { credentials: "include" },
    ).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.message);
      return body;
    }),
    onSuccess: async (body) => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("paymentReference");
        next.delete("transactionReference");
        return next;
      }, { replace: true });
      if (body.data?.status !== "paid") {
        toast.success("Payment is still being confirmed");
        return;
      }
      toast.success("Wallet funded");
      if (!pendingAction?.payload) return;
      const target = pendingAction.type === "request" ? "/api/v1/escrow/fund" : "/api/v1/giveaways";
      try {
        const resumed = await post(target, pendingAction.payload);
        localStorage.removeItem("helpmePendingWalletAction");
        toast.success(pendingAction.type === "request" ? "Contribution completed" : "Giveaway funded and published");
        queryClient.invalidateQueries();
        if (pendingAction.type === "request") window.location.assign(`/requests/${pendingAction.payload.requestId}`);
        else if (resumed.data?.id || resumed.data?._id) window.location.assign(`/giveaways/${resumed.data.id || resumed.data._id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Wallet funded, but the saved action needs attention");
      }
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Verification failed"),
  });

  useEffect(() => {
    // Older checkout URLs could contain Monnify's duplicate query suffix in
    // the value. Taking the first segment lets those successful payments be
    // recovered instead of leaving the member with an uncredited wallet.
    const paymentReference = params.get("paymentReference")?.split(/[?&]/, 1)[0];
    if (paymentReference && handledPaymentReference.current !== paymentReference) {
      handledPaymentReference.current = paymentReference;
      verify.mutate(paymentReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const addFunds = useMutation({
    mutationFn: () => post("/api/v1/wallet/topups", { amount: Number(topup) }),
    onSuccess: (body) => window.location.assign(body.data.checkoutUrl),
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not start checkout"),
  });

  const withdraw = useMutation({
    mutationFn: () => post("/api/v1/wallet/withdrawals", { amount: Number(withdrawal) }),
    onSuccess: (body) => {
      setWithdrawal("");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(body.data.status === "pending_review" ? "Withdrawal sent for review" : "Withdrawal is processing");
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Withdrawal failed"),
  });

  if (isLoading || !data) return <Spinner />;
  const { wallet } = data;
  const sandbox = data.providerMode !== "live";
  const canTopUp = data.providerReady && Number(topup) >= 100;
  const canWithdraw = data.disbursementsReady
    && Number(withdrawal) >= 1000
    && Number(withdrawal) * 100 + Number(data.fees.withdrawal) * 100 <= wallet.withdrawableKobo;

  return (
    <div className="space-y-4 pb-3">
      <section className="relative overflow-hidden rounded-2xl bg-helpMe-950 p-5 text-white shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-purple-200">Available balance</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${sandbox ? "bg-amber-300/15 text-amber-200" : "bg-emerald-300/15 text-emerald-200"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sandbox ? "bg-amber-300" : "bg-emerald-300"}`} />
                {sandbox ? "Test mode" : "Live"}
              </span>
            </div>
            <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{money(wallet.availableKobo)}</p>
            <p className="mt-1 text-xs text-purple-200">Use this balance to support requests and fund giveaways.</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:min-w-[320px]">
            <div className="bg-white/[0.06] p-3.5 sm:p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-200"><ArrowUpRight className="h-3.5 w-3.5" />Withdrawable</div>
              <strong className="mt-1 block text-lg">{money(wallet.withdrawableKobo)}</strong>
            </div>
            <div className="bg-white/[0.06] p-3.5 sm:p-4">
              <div className="flex items-center gap-1.5 text-[11px] text-purple-200"><LockKeyhole className="h-3.5 w-3.5" />In escrow</div>
              <strong className="mt-1 block text-lg">{money(wallet.committedKobo)}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-xs ${data.providerReady ? (sandbox ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800") : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {data.providerReady ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />}
        <div>
          <strong className="font-bold">
            {data.providerReady ? (sandbox ? "Monnify test mode is active" : "Monnify live payments are active") : "Monnify test mode is ready to connect"}
          </strong>
          <span className="ml-1">
            {data.providerReady
              ? (sandbox ? "Test payments do not move real money." : "Payments and withdrawals use the live account.")
              : "Add your sandbox API key, secret key, and contract code to start testing."}
          </span>
        </div>
      </div>

      {pendingAction && (
        <div className="flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-3 text-xs text-purple-900">
          <CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0" />
          <div><strong>Finish your {pendingAction.type === "request" ? "contribution" : "giveaway"}</strong><span className="ml-1">Add at least ₦{Number(pendingAction.shortfall || 0).toLocaleString()}; your saved action will continue after payment.</span></div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-50 text-helpMe-700"><ArrowDownLeft className="h-[18px] w-[18px]" /></span>
            <div><h3 className="text-base font-bold text-gray-950">Add funds</h3><p className="text-xs text-gray-500">Secure checkout by Monnify</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick top-up amounts">
            {QUICK_TOPUPS.map((amount) => (
              <button key={amount} type="button" onClick={() => setTopup(String(amount))} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500 ${Number(topup) === amount ? "border-helpMe-700 bg-purple-50 text-helpMe-800" : "border-gray-200 text-gray-600 hover:border-purple-200 hover:text-helpMe-700"}`}>₦{amount.toLocaleString()}</button>
            ))}
          </div>
          <label className="mt-3 block text-xs font-semibold text-gray-700" htmlFor="wallet-topup">Amount</label>
          <div className="mt-1.5 flex flex-col gap-2 min-[360px]:flex-row">
            <div className="relative min-w-0 flex-1"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span><input id="wallet-topup" type="number" inputMode="decimal" min="100" value={topup} onChange={(event) => setTopup(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 pl-7 pr-3 text-sm font-semibold outline-none transition focus:border-helpMe-500 focus:ring-2 focus:ring-helpMe-500/20" placeholder="5,000" /></div>
            <button onClick={() => addFunds.mutate()} disabled={addFunds.isLoading || !canTopUp} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 text-xs font-bold text-white transition hover:bg-helpMe-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">{addFunds.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}Continue</button>
          </div>
          {Number(topup) > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500">
              <div><span className="block">Wallet gets</span><strong className="text-gray-900">₦{Number(topup).toLocaleString()}</strong></div>
              <div><span className="block">Fee</span><strong className="text-gray-900">₦{feePreview.toLocaleString()}</strong></div>
              <div className="text-right"><span className="block">You pay</span><strong className="text-helpMe-800">₦{(Number(topup) + feePreview).toLocaleString()}</strong></div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ArrowUpRight className="h-[18px] w-[18px]" /></span>
            <div><h3 className="text-base font-bold text-gray-950">Withdraw rewards</h3><p className="text-xs text-gray-500">Send earned funds to your verified bank</p></div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2.5 text-xs">
            <span className="text-emerald-800">Ready to withdraw</span><strong className="text-sm text-emerald-900">{money(wallet.withdrawableKobo)}</strong>
          </div>
          <label className="mt-3 block text-xs font-semibold text-gray-700" htmlFor="wallet-withdrawal">Amount</label>
          <div className="mt-1.5 flex flex-col gap-2 min-[360px]:flex-row">
            <div className="relative min-w-0 flex-1"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">₦</span><input id="wallet-withdrawal" type="number" inputMode="decimal" min="1000" value={withdrawal} onChange={(event) => setWithdrawal(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 pl-7 pr-3 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" placeholder="Minimum 1,000" /></div>
            <button onClick={() => withdraw.mutate()} disabled={withdraw.isLoading || !canWithdraw} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">{withdraw.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}Withdraw</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><LockKeyhole className="h-3.5 w-3.5" />Fee: ₦{Number(data.fees.withdrawal).toLocaleString()}</span>
            {!data.disbursementsReady && <span>Available after payout setup</span>}
            {data.disbursementsReady && Number(withdrawal) * 100 > wallet.withdrawableKobo && <span className="text-rose-600">Amount exceeds withdrawable balance</span>}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PayoutSettings compact providerReady={data.providerReady} />
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 text-gray-600"><ReceiptText className="h-[18px] w-[18px]" /></span><div><h3 className="text-base font-bold text-gray-950">Recent activity</h3><p className="text-xs text-gray-500">Latest wallet movements</p></div></div>
          {!data.recentEntries.length ? (
            <div className="grid min-h-32 place-items-center text-center"><div><Clock3 className="mx-auto h-5 w-5 text-gray-300" /><p className="mt-2 text-xs text-gray-400">Your first transaction will appear here.</p></div></div>
          ) : (
            <div className="mt-3 divide-y divide-gray-100">
              {data.recentEntries.slice(0, 5).map((entry) => {
                const amount = entryAmount(entry);
                return (
                  <div key={entry.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0"><p className="truncate text-xs font-semibold capitalize text-gray-900">{entryLabel(entry.entry_type)}</p><p className="text-[10px] text-gray-400">{new Date(entry.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
                    <strong className={`shrink-0 text-xs ${amount > 0 ? "text-emerald-600" : amount < 0 ? "text-gray-900" : "text-gray-500"}`}>{amount > 0 ? "+" : ""}{money(amount)}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {data.providerReady && (
        <p className="flex items-center justify-center gap-1.5 py-1 text-[11px] text-gray-400"><BadgeCheck className="h-3.5 w-3.5" />Payments are verified by Monnify before your balance changes.</p>
      )}
    </div>
  );
}
