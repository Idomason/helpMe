import ShortHeader from "../ShortHeader/ShortHeader";
import LatestRequests from "./LatestRequests";

export default function FeaturedHelps() {
  return (
    <div className="h-full w-full bg-helpMe-50 py-24">
      <div className="mx-auto w-full md:w-11/12 xl:w-full xl:px-5">
        {/* Heading */}
        <ShortHeader heading="Featured Helps" />

        {/* Sliders */}
        <LatestRequests />
      </div>
    </div>
  );
}
