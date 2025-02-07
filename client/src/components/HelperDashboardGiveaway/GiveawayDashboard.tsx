import {
  ArrowLeftCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowRightCircleIcon,
  ArrowsUpDownIcon,
  BellIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  FolderIcon,
  FunnelIcon,
  GiftIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { SearchIcon, WalletIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { SidebarContext } from "../../context/SidebarContext";
import Profile from "../profile/Profile";
import GiveawayItem from "../GiveawayItem/GiveawayItem";
import { giveawayData } from "../../constant/constant";
import useWindowSize from "../../hooks/useWindowSize";
import DashboardSidebar from "../DashBoardSidebar/DashboardSidebar";

const sidebarData = [
  {
    name: "home",
    link: "/dashboard-helpee",
    icon: <Squares2X2Icon className="size-5" />,
  },
  {
    name: "request",
    link: "/dashboard-helpee-request",
    icon: <QuestionMarkCircleIcon className="size-5" />,
  },
  {
    name: "giveaways",
    link: "/dashboard-helpee-giveaways",
    icon: <GiftIcon className="size-5" />,
  },
  {
    name: "payments",
    link: "/dashboard-helpee-finance",
    icon: <WalletIcon className="size-5" />,
  },
  {
    name: "portfolio",
    link: "/dashboard-helpee-portfolio",
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

// FIXME
const status = "text-[#05a365] bg-[#06ec92]/10";

export default function HelperDashboardGiveaway() {
  const [mouseEnter, setMouseEnter] = useState(false);

  const { openSideBar, sidebarToggler } = useContext(SidebarContext);
  const { openProfile, onOpenProfile } = useContext(SidebarContext);

  const sideData = [...sidebarData, ...sidebarSecondaryData];
  const { windowWidth } = useWindowSize();

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="flex h-screen w-full justify-center">
          <DashboardSidebar
            openSideBar={openSideBar}
            setMouseEnter={setMouseEnter}
            sideData={sideData}
            sidebarToggler={sidebarToggler}
            mouseEnter={mouseEnter}
          />
          <div className="relative ml-16 h-full w-full flex-1 overflow-auto rounded-md bg-white shadow">
            <div className="sticky top-0 z-[9] flex items-center justify-between border-b border-gray-300 bg-white px-4 py-1">
              {/* Profile */}
              {openProfile && <Profile />}

              <header className="flex items-center justify-between">
                <div
                  onClick={() => onOpenProfile()}
                  className="cursor-pointer rounded-full p-1 shadow ring-gray-500"
                >
                  <div className="relative flex items-center space-x-3">
                    <img
                      className="h-9 w-9 rounded-full object-cover"
                      src="/images/profile-img.png"
                      alt="HelpersProfile Image"
                    />
                    <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-semibold text-white">
                      IA
                    </div>
                  </div>
                </div>
              </header>

              {/* Dashboard Search bar */}
              <div className="flex items-center">
                <MagnifyingGlassIcon className="mr-2 size-5 md:size-6 lg:size-7" />
                {!windowWidth && (
                  <input
                    className="focus:bg-green-h00 w-48 px-2 py-2 outline-none focus:border-b focus:border-helpMe-500 md:w-80"
                    type="search"
                    name="search"
                    id="search"
                    placeholder="Search something..."
                  />
                )}
              </div>

              {/* Notification Icons */}
              <div className="flex items-center space-x-2">
                <ChatBubbleOvalLeftEllipsisIcon className="mr-auto size-6 text-[#868686] md:size-8" />
                <BellIcon className="mr-auto size-6 text-[#868686] md:size-8" />
              </div>
            </div>

            {/* Dashboard */}
            <div className="h-fit bg-[#F7F9FA] p-4">
              <div className="flex flex-col items-center justify-center p-8">
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
