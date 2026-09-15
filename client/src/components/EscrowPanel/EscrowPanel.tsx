import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useRequestEscrow } from "../../hooks/useEscrow";

interface Props { requestId: string; requestOwnerId: string; suggestedAmount?: number }
interface AuthUser { _id: string }
interface RequestClaim { status: string; review_ends_at: string }
interface ClaimData { claim: RequestClaim | null }

export default function EscrowPanel({ requestId, requestOwnerId, suggestedAmount }: Props) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState(suggestedAmount || 0);
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { data: authUser } = useQuery<AuthUser>({ queryKey: ["authUser"] });
  const { data: escrows, isLoading } = useRequestEscrow(requestId);
  const isOwner = authUser?._id === requestOwnerId;
  const totalHeld = (escrows || []).filter((item) => ["held", "disputed", "releasing", "released"].includes(item.status)).reduce((sum, item) => sum + item.amount, 0);
  const mine = (escrows || []).filter((item) => item.funderId === authUser?._id);
  const claimQuery = useQuery<ClaimData | null>({
    queryKey: ["requestClaim", requestId], enabled: !!authUser,
    queryFn: async () => { const response = await fetch(`/api/v1/escrow/request/${requestId}/claim`, { credentials: "include" }); if (!response.ok) return null; return (await response.json()).data; },
  });
  const fund = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/v1/escrow/fund", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ amount, purpose: "request", requestId, message: message.trim() || undefined, isAnonymous }) });
      const body = await response.json();
      if (response.status === 402) {
        localStorage.setItem("helpmePendingWalletAction", JSON.stringify({ type: "request", shortfall: body.data?.shortfall || 0, payload: body.data?.resume || { purpose: "request", requestId, amount, message, isAnonymous } }));
        window.location.assign("/dashboard?tab=finance");
        throw new Error(`Add ₦${Number(body.data?.shortfall || 0).toLocaleString()} to continue.`);
      }
      if (!response.ok) throw new Error(body.message || "Funding failed"); return body;
    },
    onSuccess: () => { setAmount(0); setMessage(""); toast.success("Contribution secured from your wallet"); queryClient.invalidateQueries({ queryKey: ["requestEscrow", requestId] }); queryClient.invalidateQueries({ queryKey: ["wallet"] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Funding failed"),
  });
  const claim = useMutation({
    mutationFn: async () => { const response = await fetch(`/api/v1/escrow/request/${requestId}/claim`, { method: "POST", credentials: "include" }); const body = await response.json(); if (!response.ok) throw new Error(body.message); return body; },
    onSuccess: () => { toast.success("Claim submitted for 48-hour review"); queryClient.invalidateQueries({ queryKey: ["requestClaim", requestId] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Claim failed"),
  });
  const dispute = useMutation({
    mutationFn: async (id: string) => { const response = await fetch(`/api/v1/escrow/${id}/dispute`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ reason: "Request payout claim disputed", details: "I need an administrator to review this contribution before release." }) }); const body = await response.json(); if (!response.ok) throw new Error(body.message); return body; },
    onSuccess: () => { toast.success("Your contribution is frozen for review"); queryClient.invalidateQueries({ queryKey: ["requestEscrow", requestId] }); },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : "Dispute failed"),
  });
  if (isLoading) return <div className="flex justify-center rounded-2xl bg-white p-6"><LoaderCircle className="h-5 w-5 animate-spin text-helpMe-500" /></div>;
  const activeClaim = claimQuery.data?.claim;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/60">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><ShieldCheck className="h-5 w-5" /></span><div><h3 className="font-bold text-gray-900">Wallet escrow</h3><p className="text-xs text-gray-500">Contributions release after a reviewed claim</p></div></div>
      <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3"><p className="text-xs text-gray-500">Secured for this request</p><p className="text-xl font-bold text-gray-900">₦{totalHeld.toLocaleString()}</p></div>
      {activeClaim && <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-800"><Clock3 className="mt-0.5 h-4 w-4 shrink-0"/><span>{activeClaim.status === "reviewing" ? `Claim under review until ${new Date(activeClaim.review_ends_at).toLocaleString()}.` : `Claim status: ${activeClaim.status.replace(/_/g, " ")}`}</span></div>}
      {isOwner ? (
        <button onClick={() => claim.mutate()} disabled={claim.isLoading || (!!activeClaim && ["reviewing", "partially_released"].includes(activeClaim.status))} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{claim.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}Claim eligible funds</button>
      ) : authUser ? (
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-gray-700">Contribution amount (₦)</label><input type="number" min={100} value={amount || ""} onChange={(event) => setAmount(Number(event.target.value))} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-helpMe-500" placeholder="Enter amount"/>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={2} maxLength={500} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-helpMe-500" placeholder="Encouraging message (optional)"/>
          <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} /> Give anonymously</label>
          <button onClick={() => amount > 0 ? fund.mutate() : toast.error("Enter a valid amount")} disabled={fund.isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">{fund.isLoading ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Lock className="h-4 w-4"/>}Fund from wallet</button>
          <Link to="/dashboard?tab=finance" className="block text-center text-xs font-semibold text-helpMe-700">Add funds or view wallet</Link>
          {activeClaim?.status === "reviewing" && mine.filter((item) => item.status === "held").map((item) => <button key={item._id} onClick={() => dispute.mutate(item._id)} disabled={dispute.isLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><AlertTriangle className="h-4 w-4"/>Dispute my ₦{item.amount.toLocaleString()} contribution</button>)}
        </div>
      ) : <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">Log in to contribute from your wallet.</p>}
    </div>
  );
}
