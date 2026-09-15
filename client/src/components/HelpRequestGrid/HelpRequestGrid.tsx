import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../Spinner/Spinner";
import { format } from "date-fns";
import { MapPin, Calendar, Coins, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { categories, categoryLabel, imgOrPlaceholder } from "../../data/helpRequestData";
import ProgressBar from "../ProgressBar/ProgressBar";

interface HelpRequest {
  _id: string;
  name: string;
  image: { url: string };
  city: string;
  state: string;
  country: string;
  category: string;
  status: string;
  specificDetails: {
    amount: number;
    deadline: string;
  };
  raised?: number;
  requestDescription: string;
  createdAt: string;
}

export default function HelpRequestGrid() {
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["helpRequests"],
    queryFn: async () => {
      const response = await fetch("/api/v1/requests");
      if (!response.ok) throw new Error("Failed to fetch help requests");
      return response.json();
    },
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const allRequests: HelpRequest[] = useMemo(
    () => requests?.data?.requests || [],
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRequests.filter((request) => {
      const matchesCategory = category === "all" || request.category === category;
      const matchesSearch =
        !q ||
        request.name.toLowerCase().includes(q) ||
        request.requestDescription.toLowerCase().includes(q) ||
        request.city?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allRequests, search, category]);

  const getCurrentStatus = (request: HelpRequest) => {
    const today = new Date();
    const deadline = new Date(request.specificDetails.deadline);
    if (deadline < today) return "Expired";
    return request.status.charAt(0).toUpperCase() + request.status.slice(1);
  };

  if (isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">Failed to load help requests</p>
      </div>
    );

  return (
    <section className="bg-gray-50 px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-helpMe-600">
            Browse
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            All Help Requests
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse through all help requests and extend a helping hand
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
              placeholder="Search by title, description, or city…"
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request: HelpRequest) => (
            <Link
              key={request._id}
              to={`/requests/${request._id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={imgOrPlaceholder(request.image?.url)}
                alt={request.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center rounded-full bg-pink-500 px-3 py-1 text-sm font-medium text-white">
                  {categoryLabel(request.category)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {request.name}
              </h3>
              <p className="mb-4 line-clamp-2 text-gray-600">
                {request.requestDescription}
              </p>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>
                    {request.city}, {request.state}, {request.country}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Deadline:{" "}
                    {format(new Date(request.specificDetails.deadline), "PPP")}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Coins className="mr-2 h-4 w-4" />
                  <span>
                    Amount: ₦{request.specificDetails.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Funding progress */}
              {request.specificDetails.amount > 0 && (
                <ProgressBar
                  raised={request.raised || 0}
                  target={request.specificDetails.amount}
                  size="sm"
                  className="mt-4"
                />
              )}

              {/* Status Badge */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    getCurrentStatus(request) === "Expired"
                      ? "bg-red-100 text-red-800"
                      : request.status === "active"
                        ? "bg-green-100 text-green-800"
                        : request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {/* {request.status.charAt(0).toUpperCase() +
                    request.status.slice(1)} */}
                  {getCurrentStatus(request)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm ring-1 ring-gray-200/60">
          <p className="text-lg font-medium text-gray-900">
            {allRequests.length === 0 ? "No help requests found" : "No requests match your search"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {allRequests.length === 0
              ? "Be the first to create a help request and get support from our community"
              : "Try a different search term or category"}
          </p>
        </div>
      )}
      </div>
    </section>
  );
}
