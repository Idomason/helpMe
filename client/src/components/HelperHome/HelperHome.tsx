import {
  ArrowLeftCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowRightCircleIcon,
  BellIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  FireIcon,
  FolderIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { SearchIcon, WalletIcon } from "lucide-react";
import NotificationIcon from "../NotificationIcon/NotificationIcon";
import { Link } from "react-router-dom";
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

const status = "text-[#05a365] bg-[#06ec92]/10";

export default function HelperHome() {
  const { openSideBar, sidebarToggler } = useContext(SidebarContext);

  return (
    <div className="min-h-screen bg-helpMe-200">
      <div className="pt-20">
        <div className="flex h-screen w-full justify-center">
          <aside
            className={`${openSideBar ? "block" : "hidden"} flex min-h-screen w-72 flex-col space-y-6 self-start rounded-l-md bg-[#fefffe] p-2 shadow md:justify-between`}
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
              <span onClick={() => sidebarToggler()}>
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
            {/* Dashboard Navbar */}
            <div className="sticky top-0 z-50 flex w-full flex-1 items-center bg-white px-4 py-2 sm:py-3 md:py-4">
              {/* Search Bar */}
              <MagnifyingGlassIcon className="mr-2 size-5 md:size-6 lg:size-10" />
              <input
                className="focus:bg-green-h00 w-full px-2 py-2 outline-none focus:border-b focus:border-helpMe-500"
                type="search"
                name="search"
                id="search"
                placeholder="Search something..."
              />

              {/* Notification Icons */}
              <div className="ml-2 flex w-64 items-center justify-end">
                <BellIcon className="mr-auto size-6 text-[#868686] md:size-8" />
                <div className="flex items-center space-x-2">
                  <p className="md:text-md text-xs font-semibold text-[#b1b5b3] sm:text-sm">
                    Status
                  </p>
                  <span
                    className={`md:text-md flex items-center justify-center rounded-full ${status} px-4 py-1.5 text-xs font-semibold sm:text-sm lg:py-2`}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="h-fit bg-[#F7F9FA]">
              <div className="sticky top-16 z-50 flex items-center justify-end border-t border-gray-300 bg-white py-8 md:py-10">
                <span
                  className={`${openSideBar ? "hidden" : "block"} mr-auto px-4`}
                >
                  <ArrowLeftCircleIcon
                    onClick={() => sidebarToggler()}
                    className="size-6 cursor-pointer rounded-full shadow-lg ring-2 ring-gray-500/25"
                  />
                </span>
                <span className="md:text-md mr-2 text-xs font-semibold text-[#b1b5b3] sm:text-sm">
                  Created on
                </span>
                <span className="md:text-md text-xs font-semibold text-[#3f3f3f] sm:text-sm">
                  August 20, 2024
                </span>

                <span className="ml-2 flex cursor-pointer items-center">
                  <EllipsisVerticalIcon className="inline-block size-4 md:size-5" />
                </span>
              </div>

              {/* Dashboard Stats */}
              <div className="grid w-full grid-cols-1 gap-4 px-4 py-3 lg:grid-cols-2">
                <div className="grid grid-cols-2 gap-x-4">
                  {/* All Items card */}
                  <div className="relative my-3 flex flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color={"#285de9"}
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <QuestionMarkCircleIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#b1b5b3]">
                        All help requests
                      </p>
                      <span className="text-2xl font-bold text-[#285de9]">
                        329{" "}
                      </span>
                    </div>
                  </div>
                  {/* Active request */}
                  <div className="relative my-3 flex flex-1 flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color="#05a365"
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <FireIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#b1b5b3]">
                        Active requests
                      </p>
                      <span className="text-2xl font-bold text-[#05a365]">
                        200{" "}
                      </span>
                    </div>
                  </div>
                  {/* All Giveaways */}
                  <div className="relative col-span-full my-3 flex flex-1 flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20 lg:col-span-1">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color="#f1d800"
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <GiftIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#b1b5b3]">
                        All Giveaways
                      </p>
                      <span className="text-2xl font-bold text-[#f1d800]">
                        200{" "}
                      </span>
                    </div>
                  </div>
                  {/* Active Giveaways */}
                  <div className="relative col-span-full my-3 flex flex-1 flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20 lg:col-span-1">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color="#f18400"
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <GiftIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-[#b1b5b3]">
                        Active Giveaways
                      </p>
                      <span className="text-2xl font-bold text-[#f18400]">
                        50{" "}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-full w-full self-center py-3 lg:pl-2">
                  <div className="relative h-full w-full overflow-hidden rounded-md shadow-xl">
                    <img
                      className="h-full w-full object-cover"
                      src="https://images.pexels.com/photos/9968379/pexels-photo-9968379.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt=""
                    />

                    {/* Blog Post */}
                    <div className="absolute bottom-0 left-0 flex flex-col justify-between bg-gradient-to-t from-helpMe-950 from-75% to-transparent p-4">
                      <p className="md:text-md text-ellipsis pb-3 text-xs text-white sm:text-sm">
                        Minourished route kids finds hope as Bill Gates donated
                        $10,000 and other social amenities to locals in Nigeria
                      </p>
                      <Link
                        className="md:text-md w-fit rounded-sm bg-helpMe-500 px-6 py-2 text-xs font-semibold tracking-wide text-helpMe-50 transition-colors duration-150 ease-in hover:bg-[#f18400] sm:text-sm"
                        to={"#"}
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="h-full w-full rounded-md px-4 py-3">
                  <div className="h-52 w-full rounded-md bg-white shadow-xl">
                    <div className="relative h-full w-full overflow-hidden rounded-md shadow-xl">
                      <img
                        className="h-full w-full object-cover"
                        src="https://images.pexels.com/photos/259526/pexels-photo-259526.jpeg?auto=compress&cs=tinysrgb&w=600"
                        alt=""
                      />

                      {/* Blog Post */}
                      <div className="absolute bottom-0 left-0 flex h-fit w-full flex-col justify-between bg-gradient-to-t from-helpMe-950 from-75% to-transparent p-4">
                        <p className="md:text-md text-ellipsis pb-3 text-xs text-white sm:text-sm">
                          The prides of Serengetti, from Tazania to Kenya.
                          Protect animals from poarching
                        </p>
                        <Link
                          className="md:text-md w-fit rounded-sm bg-helpMe-500 px-6 py-2 text-xs font-semibold tracking-wide text-helpMe-50 transition-colors duration-150 ease-in hover:bg-[#f18400] sm:text-sm"
                          to={"#"}
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                  </div>
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
