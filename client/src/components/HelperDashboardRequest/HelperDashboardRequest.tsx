import {
  ArrowLeftCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowRightCircleIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  FireIcon,
  FolderIcon,
  FunnelIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  UserCircleIcon,
  HomeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import {
  ListCheckIcon,
  LoaderCircle,
  SearchIcon,
  WalletIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import RequestItem from "../RequestItem/RequestItem";
import { requestData } from "../../constant/constant";
import NotificationIcon from "../NotificationIcon/NotificationIcon";
import { useContext, useState } from "react";
import { SidebarContext } from "../../context/SidebarContext";
import Profile from "../profile/Profile";
import useWindowSize from "../../hooks/useWindowSize";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { userInitials } from "../../utils/userInitials";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";

const sidebarData = [
  {
    name: "home",
    link: "/dashboard",
    icon: <Squares2X2Icon className="size-5" />,
  },
  {
    name: "request",
    link: "dashboard-request",
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
    link: "/account",
  },
];

const status = "text-[#05a365] bg-[#06ec92]/10";

export default function HelperDashboardRequest() {
  const [mouseEnter, setMouseEnter] = useState(false);
  const { openSideBar, sidebarToggler } = useContext(SidebarContext);
  const { openProfile, onOpenProfile } = useContext(SidebarContext);
  const sideData = [...sidebarData, ...sidebarSecondaryData];
  const { windowWidth, windowHeight } = useWindowSize();
  const queryClient = useQueryClient();

  const logout = async () => {
    const response = await fetch("/api/v1/users/logout", { method: "POST" });
    if (!response.ok) throw new Error("Failed to log user out, try again");
    const data = await response.json();
    return data;
  };

  const { mutate: authUserLogout }: UseMutationResult<void> = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logout successful");
      onOpenProfile(false);
    },
    onError: (error) =>
      toast.error(error.message || "Failed to log out! Please try again"),
  });

  const {
    data: user,
    isLoading,
    error,
  }: UseQueryResult<any> = useQuery({ queryKey: ["authUser"] });

  if (isLoading)
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black/75 backdrop-blur">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  if (error) return <h1>An error occurred! Please try again</h1>;

  return (
    <div className="min-h-screen">
      <div className="">
        <div className="flex h-screen w-full justify-center">
          <aside
            className={`absolute bottom-0 left-0 top-0 ${(mouseEnter || openSideBar) && "w-52"} z-10 min-h-screen bg-[#fefffe] bg-black/75 shadow`}
          >
            {/* Dashboard links */}
            <div
              className={`flex h-full w-fit flex-col items-center space-y-6 self-start ${!mouseEnter && !openSideBar && "border-1 border-r border-gray-300"}`}
            >
              <div className="mt-3 flex flex-col space-y-8 px-5">
                <span onClick={() => sidebarToggler()}>
                  {openSideBar ? (
                    <ArrowLeftCircleIcon className="size-6 cursor-pointer rounded-full text-white shadow-lg ring-2 ring-gray-500/25" />
                  ) : (
                    <ArrowRightCircleIcon className="size-6 cursor-pointer rounded-full text-white shadow-lg ring-2 ring-gray-500/25" />
                  )}
                </span>
              </div>

              <ul
                onMouseEnter={() => setMouseEnter(true)}
                onMouseLeave={() => setMouseEnter(false)}
              >
                <div
                  className={`flex flex-col py-5 transition-all duration-300 ease-in-out ${(mouseEnter || openSideBar) && "pl-11"} space-y-8 px-5`}
                >
                  <Link
                    className="flex items-center space-x-3 font-bold text-white"
                    to="/"
                  >
                    <HomeIcon className="size-6" />
                    {(mouseEnter || openSideBar) && <span>Help Me</span>}
                  </Link>
                </div>

                {sideData.length > 0 &&
                  sideData.map((data) => (
                    <li
                      className={`my-2 w-fit rounded-md ${(mouseEnter || openSideBar) && "pl-6"} transition-all duration-300 ease-in-out hover:bg-[#F0F2F4] hover:font-semibold`}
                      key={data.name}
                    >
                      <Link
                        className="ml-3 inline-flex w-fit items-center space-x-3 rounded-md px-2 py-2 capitalize text-[#b1b5b3] transition-all duration-300 ease-in-out hover:font-semibold hover:text-[#1e1e1e] md:text-lg"
                        to={data.link}
                      >
                        <span>{data.icon}</span>
                        <span>{(mouseEnter || openSideBar) && data.name}</span>
                      </Link>
                    </li>
                  ))}
                <li
                  className={`mt-2 flex w-fit cursor-pointer ${(mouseEnter || openSideBar) && "pl-12"} items-center space-x-2 rounded-r-md bg-red-500 px-2 py-2 pl-4 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-red-700 hover:font-semibold`}
                  onClick={() => authUserLogout()}
                >
                  <ArrowLeftStartOnRectangleIcon className="size-5" />
                  {(mouseEnter || openSideBar) && (
                    <button className="md:text-lg">Log Out</button>
                  )}
                </li>
              </ul>
            </div>
          </aside>

          <div className="relative ml-16 h-full w-full flex-1 overflow-auto rounded-md bg-white shadow">
            <div className="sticky top-0 z-[9] flex items-center justify-between border-b border-gray-300 bg-white px-4 py-1">
              {/* Profile */}
              {openProfile && (
                <Profile user={user} status={status} logout={authUserLogout} />
              )}

              <header className="flex items-center justify-between">
                <div
                  onClick={() => onOpenProfile()}
                  className="cursor-pointer rounded-full p-1 shadow ring-gray-500"
                >
                  <div className="relative flex items-center space-x-3">
                    <img
                      className="h-9 w-9 rounded-full object-cover"
                      src={user?.profileImg?.url}
                      alt="HelpersProfile Image"
                    />
                    <div className="absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-black text-xs font-semibold text-white">
                      {userInitials(user?.name)}
                    </div>
                  </div>
                </div>
              </header>

              {/* Dashboard Search bar */}
              <div className="flex items-center">
                <MagnifyingGlassIcon className="mr-1 size-5 md:size-6 lg:size-7" />
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
                <h2
                  className={`${status} hidden rounded px-4 py-1 font-light sm:block`}
                >
                  <span>Welcome &ensp;</span>
                  <span className="font-semibold">
                    {capitalizeFirstLetter(user?.name)}!
                  </span>
                </h2>
                <ChatBubbleOvalLeftEllipsisIcon className="mr-auto size-6 text-[#868686] md:size-8" />
                <BellIcon className="mr-auto size-6 text-[#868686] md:size-8" />
              </div>
            </div>
            {/* Dashboard */}
            <div className="h-fit bg-[#F7F9FA] p-8">
              {/* Dashboard Stats */}
              <div className="mb-8 grid w-full grid-cols-1 flex-wrap place-content-center gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* All Help Rendered card */}
                <div className="relative my-5 flex items-center justify-center space-x-4 rounded-md border border-gray-500/20 px-6 py-3 shadow-md shadow-slate-600/20">
                  <NotificationIcon
                    className="absolute -top-[70px] right-0 translate-x-6"
                    color={"#285de9"}
                  />
                  <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                    <QuestionMarkCircleIcon className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#b1b5b3]">
                      All help rendered
                    </p>
                    <span className="text-2xl font-bold text-[#285de9]">
                      {user?.helpsRendered.length}
                    </span>
                  </div>
                </div>
                {/* Active request */}
                <div className="relative my-5 flex flex-1 items-center justify-center space-x-4 rounded-md border border-gray-500/20 px-6 py-3 shadow-md shadow-slate-600/20">
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
                {/* My Tasks */}
                <div className="relative col-span-full my-5 flex flex-1 items-center justify-center space-x-4 rounded-md border border-gray-500/20 px-6 py-3 shadow-md shadow-slate-600/20 lg:col-span-1">
                  <NotificationIcon
                    className="absolute -top-[70px] right-0 translate-x-6"
                    color="#f1d800"
                  />
                  <div className="max-w-max rounded-full bg-[#b1b2b5]/15 p-3">
                    <ListCheckIcon className="size-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#b1b5b3]">My Tasks</p>
                    <span className="text-2xl font-bold text-[#f1d800]">
                      200{" "}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                {/* Dashboard filters */}
                <div
                  className={` ${windowHeight && "sticky top-0"} flex w-full flex-wrap items-center justify-between gap-x-4 rounded-t-md border-b border-b-gray-500/35 bg-white px-6 py-3 shadow-lg md:px-8 md:py-4`}
                >
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

                    {/* Requests */}
                    <div className="my-3 flex w-fit flex-1 items-center space-x-2 rounded-md px-2 py-2 ring-1 ring-gray-300">
                      <span className="text-[#b4b0b0]">Request:</span>
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
                      <span>request name</span>
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
                  {requestData && requestData?.length > 0 ? (
                    requestData.map((request) => (
                      <RequestItem key={request.id} request={request} />
                    ))
                  ) : (
                    <h2 className="py-10 font-semibold capitalize text-orange-500">
                      No request yet, please add some requests
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
