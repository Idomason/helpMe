import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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
    requirements: string;
    prizes: string;
    rules: string;
  };
}

export default function GiftCard({ giveaway }: GiveawayCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    if (giveaway.isEnded) return "bg-red-100 text-red-800";
    if (giveaway.isFeatured) return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = () => {
    if (giveaway.isEnded) return "Ended";
    if (giveaway.isFeatured) return "Featured";
    return "Active";
  };

  const getDaysLeft = () => {
    const endDate = new Date(giveaway.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div
      className="group relative w-72 overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Status Badge */}
      <div
        className={`absolute right-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor()}`}
      >
        {getStatusText()}
      </div>

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={giveaway?.image?.url}
          alt={giveaway?.title}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">{giveaway?.title}</h3>
          <p className="mt-1 text-sm text-gray-200">
            {giveaway?.location} • {giveaway?.category}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {giveaway?.description}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {giveaway?.tags?.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
          {giveaway?.tags?.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              +{giveaway?.tags?.length - 3} more
            </span>
          )}
        </div>

        {/* Stats and Dates */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="mr-1 h-4 w-4"
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
              {giveaway?.numVotes}
            </div>
            <div className="text-sm text-gray-600">
              {getDaysLeft()} days left
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>Ends {format(new Date(giveaway?.endDate), "MMM d, yyyy")}</div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/giveaways/${giveaway?._id}`}
          className={`mt-4 block w-full rounded-md bg-helpMe-500 px-4 py-2 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-helpMe-600 ${
            giveaway?.isEnded ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {giveaway?.isEnded ? "Giveaway Ended" : "View Details"}
        </Link>
      </div>
    </div>
  );
}
