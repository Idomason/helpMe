import {
  ArrowLeftCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function DashboardSidebar({
  openSideBar,
  sidebarToggler,
  setMouseEnter,
  mouseEnter,
  sideData,
}) {
  return (
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
              to=""
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
            className={`mt-2 flex w-fit cursor-pointer ${(mouseEnter || openSideBar) && "pl-11"} items-center space-x-2 rounded-r-md bg-red-500 px-2 py-2 pl-4 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-red-700 hover:font-semibold`}
          >
            <ArrowLeftStartOnRectangleIcon className="size-5" />
            {(mouseEnter || openSideBar) && (
              <button className="md:text-lg">Log Out</button>
            )}
          </li>
        </ul>
      </div>
    </aside>
  );
}
