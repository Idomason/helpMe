import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { IRequest } from "../../utils/types";
import { format } from "date-fns";

export default function RequestItem({ ...request }: IRequest) {
  const getDeadlineStatus = (deadline: string) => {
    if (Date.now() > new Date(deadline).getTime()) {
      return "Expired";
    }
    return request?.status;
  };

  const status =
    getDeadlineStatus(request?.specificDetails?.deadline) === "Expired"
      ? `text-[#f00000] bg-[#f00000]/10`
      : request?.status === "active"
        ? `text-[#05a365] bg-[#06ec92]/10`
        : request?.status === "approved"
          ? `text-[#285de9] bg-[#ccd8fa]`
          : `text-[#f1b400] bg-[#f7f5bc]`;

  return (
    <div className="h-full w-full cursor-pointer bg-white px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#666666]/5 md:px-8 md:py-4">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-0">
        {/* Request Details */}
        <div className="py-1">
          <h5 className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm lg:w-48 lg:truncate">
            {request?.name}
          </h5>
          <p className="md:text-md text-xs text-[#b1b5b3] sm:text-sm lg:w-48 lg:truncate">
            {request?.requestDescription}
          </p>
        </div>

        {/* Request Status */}
        <div className="w-fit">
          <span
            className={`md:text-md flex items-center justify-center rounded-full ${status} px-4 py-1.5 text-xs font-semibold capitalize sm:text-sm lg:py-2`}
          >
            {getDeadlineStatus(request?.specificDetails?.deadline)}
          </span>
        </div>

        {/* Request Category */}
        <div>
          <h5 className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            {request?.category?.charAt(0).toUpperCase() +
              request?.category?.slice(1)}
          </h5>
        </div>

        {/* Request Timeline */}
        <div className="flex items-center space-x-2">
          <span className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            {request?.createdAt
              ? format(new Date(request.createdAt), "MMM d, yy")
              : "N/A"}
          </span>
          <ArrowLongRightIcon className="size-5" />
          <span className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            {request?.specificDetails?.deadline
              ? format(new Date(request.specificDetails.deadline), "MMM d, yy")
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
