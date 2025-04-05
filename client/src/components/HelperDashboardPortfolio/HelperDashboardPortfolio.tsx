import {
  BellIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  FireIcon,
  FolderIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { WalletIcon } from "lucide-react";
import NotificationIcon from "../NotificationIcon/NotificationIcon";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { SidebarContext } from "../../context/SidebarContext";
import Profile from "../profile/Profile";
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
    link: "#",
  },
  {
    name: "profile",
    icon: <UserCircleIcon className="size-5" />,
    link: "#",
  },
];

// FIXME
const status = "text-[#05a365] bg-[#06ec92]/10";

export default function HelpeeDashboardRequest() {
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
              {openProfile && <Profile status={status} logout={() => {}} />}

              <header className="flex items-center justify-between">
                <div
                  onClick={() => onOpenProfile(!openProfile)}
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
              {/* Search Bar */}
              <div className="flex items-center">
                <MagnifyingGlassIcon className="mr-1 size-5 md:size-6 lg:size-7" />
                {!windowWidth && (
                  <input
                    className="w-48 px-2 py-2 outline-none focus:border-b focus:border-helpMe-500 md:w-80"
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
            <div className="min-h-full bg-[#F7F9FA] p-8">
              {/* Dashboard Stats */}
              <div className="grid w-full grid-cols-1 gap-8 px-4 py-3 lg:grid-cols-2">
                <div className="grid gap-x-4 sm:grid-cols-2">
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
                      <p className="py-2 font-semibold capitalize text-[#b1b5b3]">
                        Total help requests
                      </p>
                      <span className="text-2xl font-bold text-[#285de9]">
                        459{" "}
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
                      <p className="py-2 font-semibold capitalize text-[#b1b5b3]">
                        Active requests
                      </p>
                      <span className="text-2xl font-bold text-[#05a365]">
                        100{" "}
                      </span>
                    </div>
                  </div>
                  {/* All Giveaways */}
                  <div className="relative my-3 flex flex-1 flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20 lg:col-span-1">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color="#f1d800"
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <GiftIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="py-2 font-semibold capitalize text-[#b1b5b3]">
                        Total Giveaways
                      </p>
                      <span className="text-2xl font-bold text-[#f1d800]">
                        220{" "}
                      </span>
                    </div>
                  </div>
                  {/* Active Giveaways */}
                  <div className="relative my-3 flex flex-1 flex-col items-center justify-center space-x-4 rounded-md border border-gray-500/20 bg-white px-6 py-3 shadow-md shadow-slate-600/20 lg:col-span-1">
                    <NotificationIcon
                      className="absolute -top-[70px] right-0 translate-x-6"
                      color="#f18400"
                    />
                    <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                      <GiftIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <p className="py-2 font-semibold capitalize text-[#b1b5b3]">
                        Active giveaways
                      </p>
                      <span className="text-2xl font-bold text-[#f18400]">
                        10{" "}
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
                    <div className="absolute bottom-0 left-0 flex w-full flex-col justify-between bg-gradient-to-t from-helpMe-950 from-75% to-transparent p-4">
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
              </div>{" "}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
