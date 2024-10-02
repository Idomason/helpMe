import { ChevronDoubleDownIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { IQuestions } from "../../utils/types";
import { useState } from "react";

export default function Questions({ question }: IQuestions) {
  const [show, setShow] = useState(false);

  console.log(show);

  return (
    <>
      <div className="my-3 flex cursor-pointer items-center justify-between space-x-5 rounded-sm bg-helpMe-950 px-4 py-2 shadow">
        <div className="flex items-center space-x-4">
          <span className="rounded-full bg-pink-400 px-3.5 py-1.5 font-medium text-white">
            {question.id}
          </span>
          <p className="md:text-md text-sm tracking-wider text-white">
            {question.question}
          </p>
        </div>
        {!show && (
          <ChevronDoubleDownIcon
            className="size-6 cursor-pointer justify-items-end text-pink-400"
            onClick={() => setShow(true)}
          />
        )}
      </div>
      <div
        className={`mx-auto -mt-3 ${show ? "block" : "hidden"} w-4/5 bg-helpMe-950 px-4 py-4`}
      >
        <div className="flex space-x-10">
          <p className="md:text-md text-sm leading-relaxed text-helpMe-200/85">
            {question.answer}
          </p>
          <XCircleIcon
            className="size-20 cursor-pointer pb-14 text-pink-400"
            onClick={() => setShow(false)}
          />
        </div>
      </div>
    </>
  );
}
