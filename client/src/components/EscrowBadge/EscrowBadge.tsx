import { ShieldCheck, Clock, Send, CheckCircle2, RotateCcw, AlertTriangle, XCircle } from "lucide-react";
import type { EscrowStatus } from "../../hooks/useEscrow";

const config: Record<EscrowStatus, { label: string; className: string; Icon: typeof ShieldCheck }> = {
  pending: { label: "Awaiting Payment", className: "bg-gray-100 text-gray-600 ring-gray-500/20", Icon: Clock },
  held: { label: "Funds in Escrow", className: "bg-blue-50 text-blue-700 ring-blue-600/20", Icon: ShieldCheck },
  releasing: { label: "Releasing…", className: "bg-indigo-50 text-indigo-700 ring-indigo-600/20", Icon: Send },
  released: { label: "Released", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", Icon: CheckCircle2 },
  refunding: { label: "Refunding…", className: "bg-amber-50 text-amber-700 ring-amber-600/20", Icon: RotateCcw },
  refunded: { label: "Refunded", className: "bg-amber-50 text-amber-700 ring-amber-600/20", Icon: RotateCcw },
  disputed: { label: "Disputed", className: "bg-red-50 text-red-700 ring-red-600/20", Icon: AlertTriangle },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-600/20", Icon: XCircle },
};

export default function EscrowBadge({ status, size = "md" }: { status: EscrowStatus; size?: "sm" | "md" }) {
  const { label, className, Icon } = config[status] || config.pending;
  const dims = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${dims} ${className}`}>
      <Icon className={icon} />
      {label}
    </span>
  );
}
