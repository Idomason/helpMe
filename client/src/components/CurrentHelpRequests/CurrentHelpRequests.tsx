import { useState } from "react";
import RangeSlider from "./RangeSlider";
import { ShieldPlus } from "lucide-react";
import ShortHeader from "../ShortHeader/ShortHeader";
import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import CurrentHelpRequestCard from "../CurrentHelpRequestCard/CurrentHelpRequestCard";

export default function CurrentHelpRequests() {
  const [sliderValue, setSliderValue] = useState(60);

  return (
    <div className="py-24 pb-0">
      <div className="mx-auto px-4 md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="current help requests" />
        <div className="mx-auto w-full bg-helpMe-50/40 p-4">
          <div className="flex items-center justify-between">
            {/* NOTE Category */}
            <span className="inline-flex items-center space-x-1 bg-helpMe-200 px-4 py-2">
              <ShieldPlus className="text-helpMe-950" />
              <p className="text-xs font-medium uppercase tracking-wider text-helpMe-950 sm:text-sm xl:text-lg xl:font-semibold">
                Medical
              </p>
            </span>

            {/* NOTE Slider */}
            <RangeSlider
              className="hidden sm:block"
              sliderValue={sliderValue}
              onSliderValue={() => setSliderValue}
            />

            {/* NOTE Progress */}
            <span className="my-2 inline-block rounded-full bg-pink-400 px-5 py-1 text-xs font-medium uppercase tracking-widest text-white sm:text-sm xl:text-lg xl:font-semibold">
              Completion {sliderValue}%
            </span>
          </div>

          {/* NOTE Sliding Category Cards */}
          <div className="mx-auto">
            <CurrentHelpRequestCard />
          </div>
          <div className="flex w-full justify-end pb-10">
            <button className="mx-auto flex items-center space-x-4 bg-helpMe-200 px-5 py-1.5 capitalize text-helpMe-700 hover:bg-helpMe-700 hover:text-white md:mr-20 xl:mr-32 xl:px-6 xl:py-2">
              View all helps
              <ArrowLongRightIcon className="ml-2 size-6 text-pink-400 xl:size-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
