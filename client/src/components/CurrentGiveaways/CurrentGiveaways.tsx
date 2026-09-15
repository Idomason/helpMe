import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CurrentGiveawaysCard from "../CurrentGiveawaysCard/CurrentGiveawaysCard";

export default function CurrentGiveaways() {
  return (
    <section className="bg-white px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-helpMe-600">
              Opportunities
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Current Giveaways
            </h2>
          </div>
          <Link
            to="/giveaways"
            className="hidden items-center gap-2 text-sm font-semibold text-helpMe-600 transition hover:text-helpMe-800 sm:inline-flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <CurrentGiveawaysCard />
      </div>
    </section>
  );
}
