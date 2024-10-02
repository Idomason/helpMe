import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";
import { IQuestions } from "../../utils/types";

export default function Questions({ question }: IQuestions) {
  return (
    <div className="my-3 flex cursor-pointer items-center justify-between space-x-5 rounded-sm bg-helpMe-950 px-4 py-2 shadow">
      <div className="flex items-center space-x-4">
        <span className="rounded-full bg-pink-400 px-3.5 py-1.5 font-medium text-white">
          {question.id}
        </span>
        <p className="md:text-md text-sm tracking-wider text-white">
          {question.question}
        </p>
      </div>
      <ChevronDoubleDownIcon className="size-6 cursor-pointer justify-items-end text-pink-400" />
    </div>
  );
}
