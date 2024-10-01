import { useState } from "react";
import RangeSlider from "./RangeSlider";
import { ShieldPlus } from "lucide-react";
import CurrentHelpRequestCard from "../CurrentHelpRequestCard/CurrentHelpRequestCard";

export default function CurrentHelpRequests() {
  const [sliderValue, setSliderValue] = useState(60);

  return (
    <div className="h-full w-full py-24">
      <div className="mx-auto w-full px-4 md:w-11/12">
        <div className="pb-12">
          <h2 className="max-w-max rounded-e-full bg-gradient-to-r from-helpMe-100 to-helpMe-950 px-8 py-2 font-medium text-white lg:px-12 lg:py-3">
            Current Helps Requests
          </h2>
        </div>
        <div className="mx-auto w-full bg-helpMe-50/40 p-4">
          {/* NOTE Sliding Rule */}
          <div className="flex items-center justify-between">
            {/* NOTE Category */}
            <span className="inline-flex items-center space-x-1 bg-helpMe-200 px-4 py-2">
              <ShieldPlus className="text-helpMe-950" />
              <p className="font-medium uppercase tracking-wider text-helpMe-950 xl:text-lg xl:font-semibold">
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
            <span className="my-2 inline-block rounded-full bg-pink-400 px-5 py-1 text-sm font-medium uppercase tracking-widest text-white xl:text-lg xl:font-semibold">
              Completion {sliderValue}%
            </span>
          </div>

          {/* NOTE Sliding Category Cards */}
          <div className="mx-auto my-2 py-4">
            <CurrentHelpRequestCard />
          </div>
        </div>
      </div>
    </div>
  );
}
