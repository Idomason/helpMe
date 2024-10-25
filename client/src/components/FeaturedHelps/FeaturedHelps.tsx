import ShortHeader from "../ShortHeader/ShortHeader";
import Slider from "./Slider";

export default function FeaturedHelps() {
  return (
    <div className="h-full w-full bg-helpMe-50 py-24">
      <div className="mx-auto md:w-11/12">
        {/* Heading */}
        <ShortHeader heading="Featured Helps" />

        {/* Sliders */}
        <Slider />
      </div>
    </div>
  );
}
