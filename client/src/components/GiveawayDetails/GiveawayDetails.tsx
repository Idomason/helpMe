import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { useState } from "react";
import Spinner from "../Spinner/Spinner";

export default function GiveawayDetails() {
  const { id } = useParams();
  const [isApplying, setIsApplying] = useState(false);

  const { data: giveaway, isLoading } = useQuery({
    queryKey: ["giveaway", id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/giveaways/${id}`);
      if (!response.ok) throw new Error("Failed to fetch giveaway details");
      return response.json();
    },
  });

  if (isLoading) return <Spinner />;
  if (!giveaway?.data) return <div>Giveaway not found</div>;

  const getStatusColor = () => {
    if (giveaway?.data?.isEnded) return "bg-red-100 text-red-800";
    if (giveaway?.data?.isFeatured) return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = () => {
    if (giveaway?.data?.isEnded) return "Ended";
    if (giveaway?.data?.isFeatured) return "Featured";
    return "Active";
  };

  const getDaysLeft = () => {
    const endDate = new Date(giveaway?.data?.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {giveaway?.data?.title}
            </h1>
            <span
              className={`rounded-full px-4 py-1 text-sm font-semibold ${getStatusColor()}`}
            >
              {getStatusText()}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-4 text-gray-600">
            <span>{giveaway?.data?.location}</span>
            <span>•</span>
            <span>{giveaway?.data?.category}</span>
            <span>•</span>
            <span>{getDaysLeft()} days left</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={giveaway?.data?.image?.url}
                alt={giveaway?.data?.title}
                className="h-[400px] w-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Description
              </h2>
              <p className="text-gray-600">{giveaway?.data?.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Requirements
              </h2>
              <p className="text-gray-600">{giveaway?.data?.requirements}</p>
            </div>

            {/* Rules */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Rules
              </h2>
              <p className="text-gray-600">{giveaway?.data?.rules}</p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Prizes Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Prizes
              </h2>
              <p className="text-gray-600">{giveaway?.data?.prizes}</p>
            </div>

            {/* Dates Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Important Dates
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(giveaway?.data?.startDate),
                      "MMMM d, yyyy",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">
                    {format(new Date(giveaway?.data?.endDate), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {giveaway?.data?.tags?.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{giveaway?.data?.numVotes} votes</span>
                </div>
                <button
                  onClick={() => setIsApplying(!isApplying)}
                  className="rounded-md bg-helpMe-500 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-helpMe-600 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={giveaway?.data?.isEnded}
                >
                  {isApplying ? "Applied" : "Apply Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
