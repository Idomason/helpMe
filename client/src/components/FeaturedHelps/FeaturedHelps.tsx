import Slider from "./Slider";

export default function FeaturedHelps() {
  return (
    <div className="h-full w-full bg-helpMe-50 py-12">
      <div className="mx-auto w-full px-4 md:w-11/12">
        <div className="flex items-center justify-center">
          <div className="w-72 overflow-hidden rounded-lg bg-[#f5f5f6]">
            {/* Slider */}
            <Slider />
          </div>
        </div>
      </div>
    </div>
  );
}
