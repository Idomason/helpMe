import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Heart, Clock, ArrowRight, Trophy } from "lucide-react";
import { categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";

interface GiveawayCardProps {
  giveaway: {
    _id: string;
    title: string;
    description: string;
    image: { url: string; publicId: string };
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    tags: string[];
    numVotes: number;
    isActive: boolean;
    isFeatured: boolean;
    isEnded: boolean;
    requirements: string[];
    prizes: string;
    rules?: string;
    prizeAmount?: number;
  };
}

export default function GiftCard({ giveaway }: GiveawayCardProps) {
  const daysLeft = (() => {
    const diff = new Date(giveaway.endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const isEnded = giveaway.isEnded || daysLeft < 0;

  const status = isEnded
    ? { label: "Ended", cls: "bg-gray-100 text-gray-600" }
    : giveaway.isFeatured
      ? { label: "Featured", cls: "bg-purple-100 text-purple-700" }
      : { label: "Active", cls: "bg-emerald-100 text-emerald-700" };

  return (
    <article className="group flex h-full min-h-[390px] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-helpMe-950/10">
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <img
          src={imgOrPlaceholder(giveaway?.image?.url)}
          alt={giveaway?.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.svg";
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${status.cls}`}>
          {status.label}
        </span>
        {!!giveaway.prizeAmount && giveaway.prizeAmount > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            <Trophy className="h-3 w-3" /> ₦{giveaway.prizeAmount.toLocaleString()}
          </span>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="line-clamp-1 text-base font-bold text-white">{giveaway?.title}</h3>
          <p className="mt-0.5 text-xs text-gray-200">
            {giveaway?.location} • {categoryLabel(giveaway?.category)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm text-gray-600">{giveaway?.description}</p>

        {giveaway?.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {giveaway.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="rounded-full bg-helpMe-50 px-2.5 py-0.5 text-xs font-medium text-helpMe-700">
                {tag}
              </span>
            ))}
            {giveaway.tags.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                +{giveaway.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-pink-400" /> {giveaway?.numVotes ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {isEnded ? "Ended" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
          </span>
          <span className="whitespace-nowrap">{format(new Date(giveaway?.endDate), "MMM d, yyyy")}</span>
        </div>

        <Link
          to={`/giveaways/${giveaway?._id}`}
          className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-helpMe-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-helpMe-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500 focus-visible:ring-offset-2"
        >
          View Details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
