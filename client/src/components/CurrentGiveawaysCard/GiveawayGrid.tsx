import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import GiftCard from "./GiftCard";
import Spinner from "../Spinner/Spinner";
import { Giveaway } from "../../store";
import { categories } from "../../data/helpRequestData";

interface GiveawaysResponse {
  data: Giveaway[];
  message: string;
  success: boolean;
}

export default function GiveawayGrid() {
  const { data: giveaways, isLoading } = useQuery<GiveawaysResponse>({
    queryKey: ["giveaways"],
    queryFn: async () => {
      const response = await fetch("/api/v1/giveaways");
      if (!response.ok) throw new Error("Failed to fetch giveaways");
      return response.json();
    },
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const allGiveaways = useMemo(() => giveaways?.data || [], [giveaways]);

  const filteredGiveaways = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allGiveaways.filter((g) => {
      const matchesCategory = category === "all" || g.category === category;
      const matchesSearch =
        !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.location?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allGiveaways, search, category]);

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <section className="bg-gray-50 px-5 py-12 pt-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-helpMe-600">
            Win Rewards
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Giveaways
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Complete challenges and get rewarded by the community.
          </p>
        </div>

        {/* Search + category filter */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or location…"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-helpMe-500 focus:ring-2 focus:ring-helpMe-500/20"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-helpMe-500 focus:ring-2 focus:ring-helpMe-500/20 sm:w-64"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {allGiveaways.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-gray-200/60">
            <p className="text-lg font-medium text-gray-900">No giveaways yet</p>
            <p className="mt-1 text-sm text-gray-500">Check back soon for new opportunities.</p>
          </div>
        ) : filteredGiveaways.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-gray-200/60">
            <p className="text-lg font-medium text-gray-900">No giveaways match your search</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search term or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGiveaways.map((giveaway) => (
              <GiftCard key={giveaway._id} giveaway={giveaway} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
