import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { navLinks } from "../../constant/constant";
import { INavbar, INavLinks } from "../../utils/types";

export default function Navbar({ openNavbar }: INavbar) {
  const [navbarBg, setNavbarBg] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY >= 90) setNavbarBg(true);

      if (window.scrollY < 90) setNavbarBg(false);
    };

    window.addEventListener("scroll", handler);

    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className={`mx-auto w-full ${navbarBg ? "bg-black bg-opacity-80 backdrop-blur-md" : "fixed"} fixed z-[10000] bg-helpMe-950 py-5`}
    >
      <div className="mx-auto flex items-center justify-center px-4 text-helpMe-50 sm:px-6 md:px-10">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <Link
            to={"/"}
            className="cursor-pointer text-lg font-semibold text-white lg:text-xl xl:text-3xl"
          >
            HELP ME
            {/* <img className="h-7" src="/images/logo.png" alt="Logo" /> */}
          </Link>

          <div className="flex items-center space-x-10">
            {/* Nav-Links */}
            <ul className="hidden items-center space-x-6 md:flex">
              {navLinks &&
                navLinks.length > 0 &&
                navLinks.map((navItem: INavLinks) => (
                  <li key={navItem.id}>
                    <Link
                      className="nav__link lg:text-md text-sm font-medium capitalize text-white xl:text-lg"
                      to={navItem.link}
                    >
                      {navItem.label}
                    </Link>
                  </li>
                ))}
            </ul>

            {/* Profile */}
            <div className="flex items-center space-x-6">
              {/* <p className="cursor-pointer">PROFILE ICON</p> */}
              <Link
                to={"/request"}
                className="text-md transform cursor-pointer rounded-lg bg-pink-400 px-8 py-2 capitalize text-helpMe-50 transition-all duration-300 ease-in-out hover:bg-pink-600 lg:text-lg xl:px-10 xl:py-3.5"
              >
                post a request
              </Link>

              <Menu
                onClick={openNavbar}
                className="cursor-pointer text-helpMe-200 md:hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
