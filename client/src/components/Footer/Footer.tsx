import {
  Facebook,
  Instagram,
  SendHorizontal,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="mt-24 overflow-hidden bg-black/90">
      <div className="mx-auto grid h-full grid-cols-2 px-5 py-16 sm:grid-cols-3 md:w-11/12">
        {/* COLUMN 1 */}
        <div className="col-span-3 mb-6 sm:col-span-1 sm:mb-0">
          <h1 className="font-bold tracking-widest text-white md:text-lg xl:text-2xl">
            HELP ME
          </h1>
          <div className="flex space-x-4 py-6">
            <Link to={"/"}>
              <Facebook className="cursor-pointer text-white/75 transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Twitter className="cursor-pointer text-white/75 transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Instagram className="cursor-pointer text-white/75 transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Youtube className="cursor-pointer text-white/75 transition-colors duration-300 hover:text-pink-400" />
            </Link>
          </div>
          <Link
            className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
            to={"/philanthropists"}
          >
            philanthropists
          </Link>
        </div>

        {/* COLUMN 2 span 3 */}
        <div className="col-span-2 grid gap-y-16">
          {/* COL 2 SEC 1 */}
          <div className="flex justify-between justify-items-center sm:justify-between">
            <div>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/helpers"}
              >
                helpers
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/helpees"}
              >
                helpees
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/giveaways"}
              >
                giveaways
              </Link>
            </div>
            <div>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/givers"}
              >
                givers
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/company"}
              >
                company
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/security"}
              >
                security
              </Link>
            </div>
            <div>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/policy"}
              >
                policy
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/safety"}
              >
                safety
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/jobs"}
              >
                jobs
              </Link>
            </div>
          </div>

          {/* COL 2 SEC 2 */}
          <div className="grid grid-cols-3 items-center justify-between md:gap-10">
            <div className="">
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/requests"}
              >
                requests
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/allRequests"}
              >
                all requests
              </Link>
              <Link
                className="block py-1 text-sm capitalize text-gray-500 transition-colors duration-300 ease-in hover:text-white lg:text-lg"
                to={"/contacts"}
              >
                Contacts
              </Link>
            </div>
            <div className="col-span-2 place-items-start md:place-items-end">
              <p className="lg:text-md py-2 text-sm text-white/80">
                Subscribe to our newsletter for updates
              </p>
              <div className="inline-flex">
                <input
                  className="lg:text-md w-[9rem] rounded-l-sm border-none p-1.5 text-center text-sm text-helpMe-950 outline-none focus:ring-1 focus:ring-inset focus:ring-pink-400 sm:w-full sm:p-2 xl:w-56"
                  type="email"
                  name="subscribe"
                  id="subscribe"
                  placeholder="your_email@mail.com"
                />
                <button className="lg:text-md rounded-r-sm bg-pink-400 from-pink-600 to-rose-900 px-2 py-1.5 text-sm text-white transition-colors duration-300 ease-in-out hover:bg-gradient-to-br sm:px-5 sm:py-2">
                  <SendHorizontal />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-auto w-[90%]" />
      <p className="mx-auto w-[90%] py-4 text-center capitalize text-gray-600">
        All rights reserved @ Help me 2024
      </p>
    </div>
  );
}
