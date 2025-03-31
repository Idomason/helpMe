import { GiftIcon } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
import RangeSlider from "../CurrentHelpRequests/RangeSlider";
import CurrentGiveawaysCard from "../CurrentGiveawaysCard/CurrentGiveawaysCard";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function CurrentGiveaways() {
  return (
    <div className="py-24">
      <div className="mx-auto md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="current giveaways" />
        <div className="mx-auto bg-gradient-to-bl from-helpMe-200 to-helpMe-900 p-4">
          {/* Sliding Details */}
          <div className="flex items-center justify-between">
            {/* Category */}
            <span className="inline-flex items-center space-x-1 bg-helpMe-200 px-4 py-2">
              <GiftIcon className="text-helpMe-950" />
              <p className="text-xs font-medium uppercase tracking-wider text-helpMe-950 sm:text-sm xl:text-lg xl:font-semibold">
                Giveaways
              </p>
            </span>

            {/* Slider */}
            <RangeSlider
              className="hidden sm:block"
              sliderValue={40}
              onSliderValue={() => {}}
            />

            {/* Progress */}
            <span className="my-2 inline-block rounded-full bg-pink-400 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white sm:text-sm xl:text-lg xl:font-semibold">
              Completion {40}%
            </span>
          </div>
          <div className="mx-auto">
            <CurrentGiveawaysCard />
          </div>
          <div className="flex w-full justify-end pb-10">
            <Link
              href="/giveaways"
              className="mx-auto flex items-center space-x-4 bg-helpMe-200 px-5 py-1.5 capitalize text-helpMe-700 hover:bg-helpMe-700 hover:text-white md:mr-20 xl:mr-32 xl:px-6 xl:py-2"
            >
              View all giveaways
              <ArrowLongRightIcon className="ml-2 size-6 text-pink-400 xl:size-7" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
