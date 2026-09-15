import { Link } from "react-router-dom";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";

export default function SliderCard({ ...request }) {
  return (
    <Link
      to={`/requests/${request._id}`}
      className="group flex h-full min-h-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-helpMe-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={imgOrPlaceholder(request.image?.url)}
          alt={request?.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize text-white shadow-sm ${
          request.status === "active" ? "bg-emerald-500" : "bg-gray-500"
        }`}>
          {request?.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.08em] text-helpMe-600">
          {categoryLabel(request?.category)}
        </span>
        <h3 className="mt-1.5 line-clamp-2 min-h-10 font-bold leading-snug text-slate-900">
          {request?.name}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {request?.city}, {request?.state}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          Deadline: {format(new Date(request.specificDetails?.deadline || request.deadline), "MMM d, yyyy")}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-base font-extrabold text-pink-500">
            ₦{Number(request.specificDetails?.amount || 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-helpMe-700 transition group-hover:text-helpMe-950">
            Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
