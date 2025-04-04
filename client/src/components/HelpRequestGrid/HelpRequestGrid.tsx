import { useQuery } from "@tanstack/react-query";
import Spinner from "../Spinner/Spinner";
import { format } from "date-fns";
import { MapPin, Calendar, Coins } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 pt-12">
        <h2 className="text-3xl font-bold text-gray-900">Help Requests</h2>
        <p className="mt-2 text-gray-600">
          Browse through all help requests and extend a helping hand
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {requests?.data?.requests.map((request: HelpRequest) => (
          <Link
            key={request._id}
            to={`/requests/${request._id}`}
            className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg"
          >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={request.image?.url}
                alt={request.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center rounded-full bg-pink-500 px-3 py-1 text-sm font-medium capitalize text-white">
                  {request.category}
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
      {requests?.data?.length === 0 && (
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <p className="text-xl font-medium text-gray-900">
            No help requests found
          </p>
          <p className="mt-2 text-gray-600">
            Be the first to create a help request and get support from our
            community
          </p>
        </div>
      )}
    </div>
  );
}
