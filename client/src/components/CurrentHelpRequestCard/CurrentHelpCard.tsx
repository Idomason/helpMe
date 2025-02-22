import {
  ChevronDoubleRightIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/solid";
import RangeSlider from "../CurrentHelpRequests/RangeSlider";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatDate } from "../../utils/formattedDate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
// import { IMedical } from "../../utils/types";

export default function CurrentHelpCard({ request }) {
  const {
    _id,
    image,
    requestDescription,
    votes,
    specificDetails,
    comments,
    category,
  } = request;
  const totalVotes = votes.length;
  const totalComments = comments.length;
  const value = totalVotes
    ? ((specificDetails?.amount / totalVotes) * 100).toFixed()
    : 0;
  const queryClient = useQueryClient();

  // Date format Helper function
  const formattedDate = formatDate(specificDetails?.deadline);

  const { mutate: vote } = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(`/api/v1/requests/${_id}/vote`, {
          method: "POST",
        });

        const data = await response.json();

        if (data.status === "fail") {
          throw new Error(
            data.message || "Failed to vote request, please try again",
          );
        }

        return data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success(data.message);
    },
    onError: (error: any) =>
      toast.error(error.message || "Failed to vote, please try again"),
  });

  return (
    <div className="relative p-14">
      <span className="lg:text-md absolute z-20 mx-2 my-2 flex items-center space-x-3 rounded-full bg-pink-400 px-5 py-1 text-sm text-white xl:px-6 xl:py-2">
        <HandThumbUpIcon className="size-5" />
        <span>{votes.length} Votes</span>
      </span>
      <div className="w-72 overflow-hidden rounded-lg bg-helpMe-200 pb-4 shadow">
        <div className="relative">
          <div className="absolute z-10 h-full w-full bg-black/75"></div>
          <img
            className="h-48 w-full object-cover"
            src={image.url}
            alt={"Request Image"}
          />
        </div>

        <div className="px-3">
          <p className="py-4 text-sm font-light leading-5 text-helpMe-950">
            {requestDescription}
          </p>
          <hr className="mb-2 h-[0.12rem] bg-white" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-thin text-helpMe-700">
              Category:{" "}
              <span className="font-bold capitalize text-helpMe-800">
                {category}
              </span>
            </p>{" "}
            <p className="text-xs font-thin text-helpMe-700">
              Deadline:{" "}
              <span className="font-bold text-helpMe-800">{formattedDate}</span>
            </p>
          </div>

          {/* NOTE Range */}
          <div className="py-.5 w-full">
            <RangeSlider
              className="ml-[1px] w-full"
              sliderValue={value}
              onSliderValue={() => {}}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 py-2">
            <button className="flex transform items-center space-x-2 rounded-[5px] bg-helpMe-800 px-4 py-1.5 text-xs font-semibold tracking-wide text-helpMe-100 transition-all duration-200 ease-in hover:bg-helpMe-950">
              <Link to={`/requests/${_id}`}>Learn More</Link>
              <ChevronDoubleRightIcon className="size-6 text-pink-400" />
            </button>
            <div
              className="flex cursor-pointer flex-col items-center justify-center"
              onClick={() => vote()}
            >
              <HandThumbUpIcon className="size-5 text-pink-400 transition-colors duration-300 hover:text-pink-600" />
              <span className="text-[10px] text-helpMe-950">
                <strong className="font-semibold">{totalVotes} </strong>votes
              </span>
            </div>
            <div className="flex cursor-pointer flex-col items-center justify-center">
              <MessageCircle className="size-5 text-pink-400 transition-colors duration-300 hover:text-pink-600" />
              <span className="text-[10px] font-light text-helpMe-950">
                <strong className="font-semibold">{totalComments}</strong>{" "}
                comments
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
