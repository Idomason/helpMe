import { BadgeCheck, Clock, ShieldAlert, ShieldX } from "lucide-react";

type Status = "unverified" | "pending" | "verified" | "rejected";

const config: Record<
  Status,
  { label: string; className: string; Icon: typeof BadgeCheck }
> = {
  verified: {
    label: "Verified Helper",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Icon: BadgeCheck,
  },
  pending: {
    label: "Verification Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Icon: Clock,
  },
  rejected: {
    label: "Verification Rejected",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    Icon: ShieldX,
  },
  unverified: {
    label: "Not Verified",
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
    Icon: ShieldAlert,
  },
};

export default function VerifiedBadge({
  status,
  size = "md",
}: {
  status: Status;
  size?: "sm" | "md";
}) {
  const { label, className, Icon } = config[status] || config.unverified;
  const dims = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${dims} ${className}`}
    >
      <Icon className={icon} />
      {label}
    </span>
  );
}
