import { Link } from "react-router-dom";
import { ISliderCard } from "../../utils/types";
import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";

export default function SliderCard({ image, title, link }: ISliderCard) {
  return (
    <div className="relative flex w-72 flex-col space-y-3 overflow-hidden rounded-lg border border-helpMe-200 shadow-lg">
      <div className="relative h-52">
        <div className="absolute z-10 h-full w-full bg-black/75"></div>
        <span className="md:text-md absolute z-40 mx-4 my-2 rounded-full bg-pink-400 px-5 py-1 text-sm font-medium uppercase tracking-widest text-white xl:px-6 xl:py-2 xl:font-semibold">
          Featured
        </span>
        <img
          className="h-52 w-72 transform object-cover transition-all duration-300 ease-in-out"
          src={image}
          width={350}
          height={350}
          alt={title}
        />
      </div>
      <div className="flex w-full flex-col space-y-3 p-4">
        <h4 className="w-full pb-2 font-bold text-black/75">{title}</h4>
        <hr />
        <Link
          className="flex items-center text-sm font-semibold uppercase text-helpMe-800 transition-colors duration-300 ease-in-out hover:font-semibold hover:text-helpMe-950"
          to={link}
        >
          Learn More
          <ArrowRightCircleIcon className="h-8 w-8" />
        </Link>
      </div>
    </div>
  );
}
