import {
  ChevronDoubleRightIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/solid";
import RangeSlider from "../CurrentHelpRequests/RangeSlider";
import { IMedical } from "../../utils/types";

export default function CurrentHelpCard({ medical }: IMedical) {
  const { image, title, numberOfVotes, amount } = medical;
  let value = 0;

  function slideValue() {
    value = parseFloat(((numberOfVotes / amount) * 100 * 1100).toFixed(2));
  }

  slideValue();

  return (
    <div className="relative p-14">
      <span className="lg:text-md absolute z-20 mx-2 my-2 flex items-center space-x-3 rounded-full bg-pink-400 px-5 py-1 text-sm text-white xl:px-6 xl:py-2">
        <HandThumbUpIcon className="size-5" />
        <span>{numberOfVotes} Votes</span>
      </span>
      <div className="w-72 overflow-hidden rounded-lg bg-helpMe-200 pb-4 shadow">
        <div className="relative">
          <div className="absolute z-10 h-full w-full bg-black/75"></div>
          <img className="h-48 w-full object-cover" src={image} alt={title} />
        </div>

        <div className="px-3">
          <h2 className="text-md py-4 font-bold uppercase leading-5 text-helpMe-950">
            {title}
          </h2>
          <hr className="mb-2 h-[0.12rem] bg-white" />
          <p className="text-helpMe-700">
            Number of votes:{" "}
            <span className="font-bold text-helpMe-800">{numberOfVotes}</span>
          </p>

          {/* NOTE Range */}
          <div className="py-.5 w-full">
            <RangeSlider
              className="ml-[1px] w-full"
              sliderValue={value}
              onSliderValue={() => {}}
            />
          </div>

          <div className="py-2">
            <button className="flex transform items-center space-x-2 rounded-[5px] bg-helpMe-800 px-4 py-1.5 tracking-wide text-helpMe-100 transition-all duration-200 ease-in hover:bg-helpMe-950">
              <span>Learn More</span>
              <ChevronDoubleRightIcon className="size-6 text-pink-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
