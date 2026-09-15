import { Link } from "react-router-dom";
import { ThumbsUp, MessageCircle, ArrowRight, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IRequest } from "../../utils/types";
import { categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";
import { formattedDate } from "../../utils/formattedDate";

export default function CurrentHelpCard({
  _id,
  specificDetails,
  votes,
  comments,
  image,
  name,
  requestDescription,
  category,
  city,
}: IRequest) {
  const totalVotes = votes?.length ?? 0;
  const totalComments = comments?.length ?? 0;
  const formatDate = formattedDate(specificDetails?.deadline);
  const plainDescription = requestDescription
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const queryClient = useQueryClient();

  const { mutate: vote } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/requests/${_id}/vote`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to vote");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["latest-requests"] });
      toast.success(data.message);
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to vote, please try again"),
  });

  return (
    <article className="group flex h-full min-h-[374px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-helpMe-950/10">
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <img
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={imgOrPlaceholder(image?.url)}
          alt="Request"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-pink-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
          <ThumbsUp className="h-3 w-3" />
          {totalVotes} Votes
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="line-clamp-1 text-[11px] font-bold uppercase tracking-[0.08em] text-helpMe-600">
          {categoryLabel(category)}
        </span>
        <h3 className="mt-1.5 line-clamp-1 font-bold text-slate-900">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {plainDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {city}
          </span>
          <span className="whitespace-nowrap">Due <span className="font-semibold text-slate-700">{formatDate}</span></span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Link
            to={`/requests/${_id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-helpMe-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-helpMe-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500 focus-visible:ring-offset-2"
          >
            Learn More
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => vote()}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500"
              title="Vote"
            >
              <ThumbsUp className="h-5 w-5 text-pink-400" />
              <span>{totalVotes}</span>
            </button>
            <Link to={`/requests/${_id}`} className="flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-helpMe-500">
              <MessageCircle className="h-5 w-5 text-pink-400" />
              <span>{totalComments}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
