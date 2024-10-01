import ShortHeader from "../ShortHeader/ShortHeader";
import Slider from "./Slider";

export default function FeaturedHelps() {
  return (
    <div className="h-full w-full bg-helpMe-50 py-24">
      <div className="mx-auto w-full px-4 md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="Featured Helps" />
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="w-72 overflow-hidden rounded-lg">
            {/* Slider */}
            <Slider />
          </div>
          <div className="w-72 overflow-hidden rounded-lg">
            {/* Slider */}
            <Slider />
          </div>
          <div className="w-72 overflow-hidden rounded-lg">
            {/* Slider */}
            <Slider />
          </div>
        </div>
      </div>
    </div>
  );
}
