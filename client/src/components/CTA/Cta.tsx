import { Link } from "react-router-dom";
import Questions from "../Questions/Questions";
import { questionsData } from "../../constant/constant";

export default function Cta() {
  return (
    <div className="">
      <div className="mx-auto px-4 md:w-4/5">
        {/* CTA Buttons */}
        <div className="mx-auto flex items-center space-x-4 py-12">
          <Link
            className="transform rounded-md bg-helpMe-950 px-5 py-2 text-helpMe-200 transition-all duration-200 ease-in hover:skew-x-6 hover:font-semibold hover:text-white xl:px-8 xl:py-3"
            to={"/request"}
          >
            Need help ?
          </Link>
          <Link
            className="transform rounded-md bg-pink-400 px-5 py-2 text-helpMe-50 transition-all duration-200 ease-in hover:skew-x-6 hover:font-semibold hover:text-white xl:px-8 xl:py-3"
            to={"/renderHelp"}
          >
            Render help
          </Link>
        </div>

        {/* Frequently Asked Questions (FAQs) */}
        <div className="flex flex-wrap py-6">
          <div className="w-full rounded-l-md bg-helpMe-950 p-8 xl:max-h-fit xl:flex-1">
            <div className="flex h-[250px] flex-col justify-between lg:h-[230px]">
              <div className="relative mx-auto mt-3">
                <h2 className="font-semibold capitalize text-white md:text-lg xl:text-xl">
                  Frequently Asked Questions
                </h2>

                <p className="py-6 leading-relaxed text-helpMe-200 sm:w-4/5 lg:mt-3 lg:w-full lg:py-2.5">
                  Check if your question have already been answered before
                  contacting the support team{" "}
                </p>
                <div className="my-10 lg:absolute">
                  <Link
                    className="rounded-sm bg-pink-400 px-6 py-2.5 text-lg font-semibold capitalize tracking-wider text-helpMe-50 hover:bg-pink-600 sm:px-8 sm:py-2.5 xl:font-bold"
                    to={"/request"}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full rounded-r-md bg-helpMe-800 px-4 py-8 xl:w-[70%]">
            {questionsData.map((question) => (
              <Questions key={question.id} question={question} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
