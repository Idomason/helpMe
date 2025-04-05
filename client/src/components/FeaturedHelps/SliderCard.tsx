import { Link } from "react-router-dom";
import {
  ArrowRightCircleIcon,
  MapPinIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { format } from "date-fns";

export default function SliderCard({ ...request }) {
  const getStatusColor = () => {
    if (request.status === "active") return "bg-green-500";
    if (request.status === "pending") return "bg-yellow-500";
    if (request.status === "completed") return "bg-blue-500";
    return "bg-gray-500";
  };

  return (
    <div className="relative flex w-full flex-col space-y-3 overflow-hidden rounded-lg border border-helpMe-200 shadow-lg sm:w-80">
      <div className="relative h-52">
        <div className="absolute z-10 h-full w-full bg-black/75"></div>
        <span
          className={`md:text-md absolute z-40 mx-4 my-2 rounded-full ${getStatusColor()} px-5 py-1 text-sm font-medium uppercase tracking-widest text-white xl:px-6 xl:py-2 xl:font-semibold`}
        >
          {request?.status}
        </span>
        <img
          className="h-52 w-full transform object-cover transition-all duration-300 ease-in-out sm:w-80"
          src={request.image.url}
          width={350}
          height={350}
          alt={request?.name}
        />
      </div>
      <div className="flex w-full flex-col space-y-3 p-4">
        <h4 className="w-full pb-2 font-bold text-black/75">{request?.name}</h4>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4" />
          <span>
            {request?.city}, {request?.state}, {request?.country}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>
            Deadline:{" "}
            {format(new Date(request.specificDetails.deadline), "MMM d, yyyy")}
          </span>
        </div>

        <div className="text-sm font-semibold text-pink-500">
          ₦{request.specificDetails.amount}
        </div>

        <hr />

        <Link
          className="flex items-center text-sm font-semibold uppercase text-helpMe-800 transition-colors duration-300 ease-in-out hover:font-semibold hover:text-helpMe-950"
          to={`/requests/${request._id}`}
        >
          View Details
          <ArrowRightCircleIcon className="h-8 w-8" />
        </Link>
      </div>
    </div>
  );
}
