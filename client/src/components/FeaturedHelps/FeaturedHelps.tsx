import Slider from "./Slider";

export default function FeaturedHelps() {
  return (
    <div className="h-full w-full bg-helpMe-50 py-24">
      <div className="mx-auto w-full px-4 md:w-11/12">
        <div className="pb-12">
          <h2 className="max-w-max rounded-e-full bg-gradient-to-r from-helpMe-100 to-helpMe-950 px-8 py-2 font-medium text-white lg:px-12 lg:py-3">
            Featured Helps
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
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
