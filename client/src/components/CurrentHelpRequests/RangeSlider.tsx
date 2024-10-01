import { IRangeSliderProp } from "../../utils/types";

export default function RangeSlider({
  className,
  sliderValue,
  // onSliderValue,
}: IRangeSliderProp) {
  const gradient = `linear-gradient(to right, #f472b6 ${sliderValue}%, #1010 0%)`;

  return (
    <>
      <input
        style={sliderValue ? { backgroundImage: gradient ?? 0 } : {}}
        className={`${className} ml-1 mr-2 flex-auto appearance-none rounded-r-full to-black/5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/5 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-r-full [&::-webkit-slider-thumb]:bg-transparent`}
        type="range"
        name="category"
        id="category"
        min={0}
        max={100}
        readOnly
        value={sliderValue}
        // onChange={onSliderValue}
      />
    </>
  );
}
