import {
  ArrowLeftCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowRightCircleIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  FolderIcon,
  FunnelIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { SearchIcon, WalletIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { giveawayData } from "../../constant/constant";
import GiveawayItem from "../GiveawayItem/GiveawayItem";
import { useContext } from "react";
import { SidebarContext } from "../../context/SidebarContext";

const sidebarData = [
  {
    name: "home",
    link: "/dashboard",
    icon: <Squares2X2Icon className="size-5" />,
  },
  {
    name: "request",
    link: "/dashboard-request",
    icon: <QuestionMarkCircleIcon className="size-5" />,
  },
  {
    name: "giveaways",
    link: "/dashboard-giveaways",
    icon: <GiftIcon className="size-5" />,
  },
  {
    name: "payments",
    link: "/dashboard-finance",
    icon: <WalletIcon className="size-5" />,
  },
  {
    name: "portfolio",
    link: "/dashboard-portfolio",
    icon: <FolderIcon className="size-5" />,
  },
];

const sidebarSecondaryData = [
  {
    name: "level",
    level: 0,
    icon: <ChartBarIcon className="size-5" />,
  },
  {
    name: "profile",
    icon: <UserCircleIcon className="size-5" />,
  },
];

export default function HelperDashboardGiveaway() {
  const { openSideBar, sidebarToggler } = useContext(SidebarContext);

  return (
    <div className="min-h-screen">
      <div className="pt-20">
        <div className="flex h-screen w-full justify-center">
          <aside
            className={`${openSideBar ? "block" : "hidden"} flex min-h-screen w-72 flex-col justify-between space-y-6 self-start rounded-l-md bg-[#fefffe] p-2 shadow`}
          >
            {/* Profile  */}
            <header className="flex items-center justify-between">
              <div className="rounded-md p-2 shadow-md ring-gray-500">
                <div className="relative flex items-center space-x-3">
                  <img
                    className="h-12 w-12 object-cover"
                    src="/images/profile-img.png"
                    alt="HelpersProfile Image"
                  />
                  <div>
                    <h4 className="text-sm font-semibold">Idoma Anche</h4>
                    <p className="text-xs text-gray-500">
                      idomaanche@gmail.com
                    </p>
                  </div>
                  <div className="absolute left-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-semibold text-white">
                    IA
                  </div>
                </div>
              </div>
              <span
                onClick={() => sidebarToggler()}
                className={`${openSideBar ? "block" : "hidden"} inline-block py-2`}
              >
                <ArrowRightCircleIcon className="size-6 cursor-pointer rounded-full shadow-lg ring-2 ring-gray-500/25" />
              </span>
            </header>

            {/* Search */}
            <div className="flex items-center rounded-md px-2 shadow ring-1 ring-gray-300">
              <SearchIcon className="size-6 shrink-0 text-[#b4b0b0]" />
              <input
                className="p-2 outline-none"
                type="search"
                name=""
                id=""
                placeholder="Search"
              />
            </div>

            {/* Dashboard links */}
            <ul>
              {sidebarData.length > 0 &&
                sidebarData.map((data) => (
                  <li
                    className="rounded-md px-2 transition-all duration-300 ease-in-out hover:bg-[#F0F2F4] hover:font-semibold hover:text-[#1e1e1e]"
                    key={data.name}
                  >
                    <Link
                      className="flex items-center gap-1.5 px-2 py-2 capitalize text-[#b1b5b3] transition-all duration-300 ease-in-out hover:bg-[#F0F2F4] hover:font-semibold hover:text-[#1e1e1e] md:text-lg"
                      to={data.link}
                    >
                      {data.icon}
                      {data.name}
                    </Link>
                  </li>
                ))}
            </ul>

            {/* Secondary Dashboard links */}
            <ul>
              {sidebarSecondaryData.length > 0 &&
                sidebarSecondaryData.map((data) => (
                  <li
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-2 capitalize text-[#b1b5b3] transition-all duration-300 ease-in-out hover:bg-[#F0F2F4] hover:font-semibold hover:text-[#1e1e1e] md:text-lg"
                    key={data.name}
                  >
                    {data.icon}
                    {data.name}
                  </li>
                ))}
              <li className="mt-2 flex cursor-pointer items-center space-x-1 rounded-md bg-red-500 px-4 py-2 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-red-700 hover:font-semibold">
                <ArrowLeftStartOnRectangleIcon className="size-5" />
                <button className="md:text-lg">Log Out</button>
              </li>
            </ul>
          </aside>
          <div className="h-full w-full flex-1 overflow-y-auto overflow-x-hidden rounded-md bg-white shadow md:rounded-l-none md:rounded-r-md">
            {/* Dashboard Search bar */}
            <div className="flex w-full flex-1 items-center bg-white px-4 py-2 sm:py-3 md:py-4">
              <MagnifyingGlassIcon className="mr-2 size-5 md:size-6 lg:size-10" />
              <input
                className="focus:bg-green-h00 w-full px-2 py-2 outline-none focus:border-b focus:border-helpMe-500"
                type="search"
                name="search"
                id="search"
                placeholder="Search something..."
              />
            </div>

            {/* Dashboard */}
            <div className="h-fit bg-[#F7F9FA] p-4">
              <span
                onClick={() => sidebarToggler()}
                className={`${openSideBar ? "hidden" : "block"} inline-block py-2`}
              >
                <ArrowLeftCircleIcon className="size-6 cursor-pointer rounded-full shadow-lg ring-2 ring-gray-500/25" />
              </span>
              <div className="py-2">
                <h2 className="font-bold md:text-lg md:font-semibold">
                  Giveaways
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  All active giveaways
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                {/* Dashboard filters */}
                <div className="sticky top-0 flex w-full flex-wrap items-center justify-between gap-x-4 rounded-t-md border-b border-b-gray-500/35 bg-white px-6 py-3 shadow-lg md:px-8 md:py-4">
                  <div className="flex flex-1 items-center rounded-md px-2 shadow ring-1 ring-gray-300">
                    <SearchIcon className="size-6 shrink-0 text-[#b4b0b0]" />
                    <input
                      className="p-2 outline-none"
                      type="search"
                      name=""
                      id=""
                      placeholder="Search"
                    />
                  </div>
                  <div className="flex flex-auto flex-wrap items-center justify-between gap-x-3 gap-y-4">
                    {/* Period */}
                    <div className="my-3 flex w-fit flex-1 items-center space-x-2 rounded-md px-2 py-2 ring-1 ring-gray-300">
                      <span className="text-[#b4b0b0]">Period:</span>
                      <select
                        className="text-[#666666] outline-none"
                        name="period"
                        id="period"
                      >
                        <option className="text-[#666666]" value="1">
                          This year
                        </option>
                        <option className="text-[#666666]" value="2">
                          Last year
                        </option>
                        <option className="text-[#666666]" value="3">
                          Last month
                        </option>
                        <option className="text-[#666666]" value="4">
                          This month
                        </option>
                      </select>
                    </div>

                    {/* Giveaways */}
                    <div className="my-3 flex w-fit flex-1 items-center space-x-2 rounded-md px-2 py-2 ring-1 ring-gray-300">
                      <span className="text-[#b4b0b0]">Giveaways:</span>
                      <select
                        className="text-[#666666] outline-none"
                        name="period"
                        id="period"
                      >
                        <option className="text-[#666666]" value="1">
                          All
                        </option>
                        <option className="text-[#666666]" value="2">
                          First 10
                        </option>
                        <option className="text-[#666666]" value="3">
                          First 20
                        </option>
                        <option className="text-[#666666]" value="4">
                          Last 10
                        </option>
                      </select>
                    </div>

                    {/* Filter Icon */}
                    <div className="cursor-pointer rounded-md p-2.5 ring-1 ring-gray-300 hover:text-orange-500">
                      <FunnelIcon className="size-4 md:size-5" />
                    </div>
                  </div>
                </div>
                {/* Headings */}
                <div className="w-full px-6 py-3 md:px-8 md:py-4">
                  <div className="md:text-md mx-auto hidden items-center justify-around py-2 text-xs font-bold uppercase text-[#666666] sm:text-sm lg:flex">
                    <h4 className="flex items-center space-x-2">
                      <span>giveaway name</span>
                      <ArrowsUpDownIcon className="size-4 md:size-5" />{" "}
                    </h4>
                    <h4 className="flex items-center space-x-2">
                      <span>status</span>{" "}
                      <ArrowsUpDownIcon className="size-4 md:size-5" />
                    </h4>
                    <h4 className="flex items-center space-x-2">
                      <span>category</span>{" "}
                      <ArrowsUpDownIcon className="size-4 md:size-5" />
                    </h4>
                    <h4 className="flex items-center space-x-2">
                      <span>timeline</span>{" "}
                      <ArrowsUpDownIcon className="size-4 md:size-5" />
                    </h4>
                  </div>
                </div>

                {/* Dashboard Items */}
                <div className="w-full">
                  {giveawayData && giveawayData?.length > 0 ? (
                    giveawayData.map((giveaway) => (
                      <GiveawayItem key={giveaway.id} giveaway={giveaway} />
                    ))
                  ) : (
                    <h2 className="py-10 font-semibold capitalize text-orange-500">
                      No giveaway yet, please add some requests
                    </h2>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-10">
                  <div className="flex cursor-pointer items-center">
                    <span>
                      <ArrowLongLeftIcon className="size-4 md:size-5" />
                    </span>
                    <p className="md:text-md ml-2 hidden text-sm transition-all duration-200 ease-in hover:font-semibold md:block lg:text-lg">
                      Previous
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 px-6 md:px-8">
                    <button className="h-6 w-6 rounded-full bg-black font-semibold text-white transition-all duration-200 ease-in hover:bg-helpMe-500 md:h-8 md:w-8">
                      1
                    </button>
                    <button className="h-6 w-6 rounded-full bg-black font-semibold text-white transition-all duration-200 ease-in hover:bg-helpMe-500 md:h-8 md:w-8">
                      2
                    </button>
                    <button className="h-6 w-6 rounded-full bg-black font-semibold text-white transition-all duration-200 ease-in hover:bg-helpMe-500 md:h-8 md:w-8">
                      3
                    </button>
                    <button className="h-6 w-6 rounded-full bg-black font-semibold text-white transition-all duration-200 ease-in hover:bg-helpMe-500 md:h-8 md:w-8">
                      4
                    </button>
                    <button className="h-6 w-6 rounded-full bg-black font-semibold text-white transition-all duration-200 ease-in hover:bg-helpMe-500 md:h-8 md:w-8">
                      5
                    </button>
                  </div>
                  <div className="flex cursor-pointer items-center">
                    <p className="md:text-md mr-2 hidden text-sm transition-all duration-200 ease-in hover:font-semibold md:block lg:text-lg">
                      Next
                    </p>
                    <span>
                      <ArrowLongRightIcon className="size-4 md:size-5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
