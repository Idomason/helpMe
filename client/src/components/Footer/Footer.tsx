import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="mt-24 bg-black/90">
      <div className="mx-auto grid h-full grid-cols-2 px-4 py-10 sm:grid-cols-3 md:w-11/12">
        {/* COLUMN 1 */}
        <div className="col-span-1 mb-6 flex justify-between gap-10 sm:mb-0 sm:flex-col sm:gap-6">
          <h1 className="font-bold tracking-widest text-white md:text-lg xl:text-2xl">
            HELP ME
          </h1>
          <div className="flex space-x-4">
            <Link to={"/"}>
              <Facebook className="cursor-pointer text-white transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Twitter className="cursor-pointer text-white transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Instagram className="cursor-pointer text-white transition-colors duration-300 hover:text-pink-400" />
            </Link>
            <Link to={"/"}>
              <Youtube className="cursor-pointer text-white transition-colors duration-300 hover:text-pink-400" />
            </Link>
          </div>
          <Link className="capitalize text-white" to={"/philanthropists"}>
            philanthropists
          </Link>
        </div>

        {/* COLUMN 2 span 3 */}
        <div className="col-span-2 grid gap-y-16">
          <div className="flex justify-between">
            <div>
              <Link className="block capitalize text-white" to={"/helpers"}>
                helpers
              </Link>
              <Link className="block capitalize text-white" to={"/helpees"}>
                helpees
              </Link>
            </div>
            <div>
              <Link className="block capitalize text-white" to={"/helpers"}>
                helpers
              </Link>
              <Link className="block capitalize text-white" to={"/helpees"}>
                helpees
              </Link>
            </div>
            <div>
              <Link
                className="block py-1 capitalize text-white"
                to={"/helpers"}
              >
                helpers
              </Link>
              <Link
                className="block py-1 capitalize text-white"
                to={"/helpees"}
              >
                helpees
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center justify-between gap-10">
            <div>
              <Link
                className="block py-1 capitalize text-white"
                to={"/requests"}
              >
                requests
              </Link>
              <Link
                className="block py-1 capitalize text-white"
                to={"/allRequests"}
              >
                all requests
              </Link>
            </div>
            <div className="col-span-2 place-items-center">
              <p className="lg:text-md py-2 text-sm text-white">
                Subscribe to our newsletter for updates
              </p>
              <div className="inline-flex">
                <input
                  className="rounded-l-sm border-none p-2 text-center text-helpMe-950 outline-none focus:ring-1 focus:ring-inset focus:ring-pink-400 xl:w-56"
                  type="email"
                  name="subscribe"
                  id="subscribe"
                  placeholder="your_email@mail.com"
                />
                <button className="rounded-r-sm bg-pink-400 from-pink-600 to-rose-900 px-5 py-2 text-white transition-colors duration-300 ease-in-out hover:bg-gradient-to-br">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
