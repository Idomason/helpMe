import { Link } from "react-router-dom";
import { TrendingUp, ThumbsUp, Medal } from "lucide-react";
import { useWeeklyLeaderboard } from "../../hooks/usePortfolio";
import { categoryLabel } from "../../data/helpRequestData";

const medalColor = ["text-yellow-500", "text-gray-400", "text-amber-700"];

export default function WeeklyLeaderboard() {
  const { data: requests, isLoading } = useWeeklyLeaderboard();

  if (isLoading || !requests || requests.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-pink-500" />
        <h2 className="text-2xl font-bold text-gray-900">Top Requests This Week</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {requests.map((r: any, i: number) => (
          <Link
            key={r._id}
            to={`/requests/${r._id}`}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 transition hover:shadow-md"
          >
            <div className="flex w-8 shrink-0 items-center justify-center">
              {i < 3 ? (
                <Medal className={`h-6 w-6 ${medalColor[i]}`} />
              ) : (
                <span className="text-lg font-bold text-gray-300">{i + 1}</span>
              )}
            </div>
            {r.image?.url && (
              <img src={r.image.url} alt={r.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-500">{categoryLabel(r.category)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-pink-600">
              <ThumbsUp className="h-4 w-4" />
              {r.totalVotes}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
