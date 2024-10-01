import { GiftIcon } from "@heroicons/react/24/solid";
import ShortHeader from "../ShortHeader/ShortHeader";
import RangeSlider from "../CurrentHelpRequests/RangeSlider";

export default function CurrentGiveaways() {
  return (
    <div className="py-24">
      <div className="mx-auto px-4 md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="current giveaways" />
        <div className="mx-auto bg-black/95 p-4 md:w-11/12">
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
        </div>
      </div>
    </div>
  );
}
