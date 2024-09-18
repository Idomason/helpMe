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
      className={`mx-auto w-full ${navbarBg ? "bg-helpMe-600" : "fixed"} fixed z-[10000] bg-helpMe-950 py-5`}
    >
      <div className="mx-auto flex items-center justify-center px-4 text-helpMe-50 sm:px-6 md:px-10">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <h4 className="cursor-pointer text-lg font-semibold text-helpMe-200 lg:text-xl">
            HELP ME
          </h4>

          <div className="flex items-center space-x-10">
            {/* Nav-Links */}
            <ul className="hidden items-center space-x-6 md:flex">
              {navLinks &&
                navLinks.length > 0 &&
                navLinks.map((navItem: INavLinks) => (
                  <li key={navItem.id}>
                    <Link
                      className="nav__link lg:text-md text-sm font-medium capitalize text-helpMe-200"
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
                className="transform cursor-pointer rounded-lg bg-pink-400 px-8 py-2 capitalize text-helpMe-50 transition-all duration-300 ease-in-out hover:bg-pink-600"
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
