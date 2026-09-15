import { Link } from "react-router-dom";
import { HandHeart, MapPin, User } from "lucide-react";
import { useFreeHelp } from "../../hooks/usePortfolio";
import Spinner from "../../components/Spinner/Spinner";
import { categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";

export default function FreeHelp() {
  const { data: offers, isLoading } = useFreeHelp();

  return (
    <div className="min-h-screen bg-gray-50 pt-[60px]">
      <div className="bg-helpMe-950 pb-10 pt-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <HandHeart className="h-8 w-8 text-pink-400" />
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Free Help Offers</h1>
              <p className="mt-1 text-sm text-gray-400">
                Helpers offering their time and skills — no tasks, no strings attached.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <Spinner />
        ) : !offers || offers.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm ring-1 ring-gray-200/60">
            No free help offers yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o: any) => (
              <div key={o._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60">
                <img src={imgOrPlaceholder(o.image?.url)} alt={o.name} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <span className="inline-block rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-600">
                    {categoryLabel(o.category)}
                  </span>
                  <h3 className="mt-2 font-bold text-gray-900">{o.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{o.requestDescription}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {o.city}
                    </span>
                    {o.user?.name && (
                      <Link to={`/u/${encodeURIComponent(o.user.name)}`} className="flex items-center gap-1 font-medium text-helpMe-600 hover:underline">
                        <User className="h-3.5 w-3.5" /> {o.user.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
