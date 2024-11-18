import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { IGiveaway } from "../../utils/types";

export default function GiveawayItem({ giveaway }: IGiveaway) {
  const status =
    giveaway?.status === "active"
      ? `text-[#05a365] bg-[#06ec92]/10`
      : giveaway?.status === "expired"
        ? `text-[#f42400] bg-[#f42400]/25`
        : `text-[#f1b400] bg-[#f7f5bc]`;

  return (
    <div className="h-full w-full cursor-pointer bg-white px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#666666]/5 md:px-8 md:py-4">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center lg:gap-0">
        {/* giveaway Details */}
        <div className="py-1">
          <h5 className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm lg:w-48 lg:truncate">
            {giveaway?.item?.heading}
          </h5>
          <p className="md:text-md text-xs text-[#b1b5b3] sm:text-sm lg:w-48 lg:truncate">
            {giveaway?.item?.detail}
          </p>
        </div>

        {/* giveaway Status */}
        <div className="w-fit">
          <span
            className={`md:text-md flex items-center justify-center rounded-full ${status} px-4 py-1.5 text-xs font-semibold capitalize sm:text-sm lg:py-2`}
          >
            {giveaway?.status}
          </span>
        </div>

        {/* giveaway Category */}
        <div>
          <h5 className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            Finance
          </h5>
        </div>

        {/* giveaway Timeline */}
        <div className="flex items-center space-x-2">
          <span className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            Aug 20, '24
          </span>
          <ArrowLongRightIcon className="size-5" />
          <span className="md:text-md mb-1 text-xs font-bold text-[#666666] sm:text-sm">
            Sep 10, '24
          </span>
        </div>
      </div>
    </div>
  );
}
