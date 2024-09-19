import { ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { ISliderCard } from "../../utils/types";
import { Link } from "react-router-dom";

export default function SliderCard({ image, title, link }: ISliderCard) {
  return (
    <div className="flex w-72 flex-col space-y-3 rounded-lg border border-helpMe-200 shadow-lg">
      <div>
        <img
          className="h-52 w-72 transform object-cover transition-all duration-300 ease-in-out hover:scale-110"
          src={image}
          width={350}
          height={350}
          alt={title}
        />
      </div>
      <div className="flex w-full flex-col space-y-3 p-4">
        <h4 className="w-full font-semibold">{title}</h4>
        <hr />
        <Link
          className="flex items-center text-sm font-semibold uppercase text-helpMe-800 hover:font-semibold hover:text-helpMe-950"
          to={link}
        >
          Learn More
          <ArrowRightCircleIcon className="h-8 w-8" />
        </Link>
      </div>
    </div>
  );
}
