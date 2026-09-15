interface ProgressBarProps {
  /** Amount raised/funded so far */
  raised: number;
  /** Target/goal amount */
  target: number;
  /** Show the "₦X raised of ₦Y" label row above the bar. Default true. */
  showLabel?: boolean;
  /** Optional number of contributors to show next to the label. */
  contributors?: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Funding progress bar (raised vs target), following the app's rounded/ring
 * Tailwind conventions (see EscrowBadge.tsx for the sibling pattern).
 */
export default function ProgressBar({
  raised,
  target,
  showLabel = true,
  contributors,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const barHeight = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-gray-900">
            ₦{raised.toLocaleString()}
            <span className="ml-1 font-normal text-gray-500">
              raised of ₦{target.toLocaleString()}
            </span>
          </p>
          <span className="shrink-0 text-xs font-semibold text-helpMe-600">{pct}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${barHeight}`}>
        <div
          className={`${barHeight} rounded-full bg-gradient-to-r from-helpMe-600 to-helpMe-500 transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {typeof contributors === "number" && (
        <p className="mt-1.5 text-xs text-gray-500">
          {contributors} {contributors === 1 ? "supporter" : "supporters"}
        </p>
      )}
    </div>
  );
}
