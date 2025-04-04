import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { navLinks } from "../../constant/constant";
import { IMobileNavProp } from "../../utils/types";

export default function MobileNav({ closeNavbar, isOpen }: IMobileNavProp) {
  const openNav = isOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <div className="relative">
      {/* Overlay */}
      <div
        className={`fixed ${openNav} bottom-0 left-0 top-0 z-[10000] h-[100vh] w-full transform bg-black/70 transition-all duration-500`}
      >
        {/* Navlinks */}
        <ul
          className={`${openNav} fixed z-[100006] flex h-full w-4/5 transform flex-col items-center space-y-6 bg-helpMe-900 pt-20 text-helpMe-100 transition-all delay-300 duration-300 sm:w-[60%]`}
        >
          {navLinks &&
            navLinks.length > 0 &&
            navLinks.map((navItem) => (
              <li key={navItem.id} onClick={closeNavbar}>
                <Link
                  className="nav__link lg:text-md text-sm font-medium capitalize text-helpMe-200"
                  to={navItem.link}
                >
                  {navItem.label}
                </Link>
              </li>
            ))}

          {/* Close Icon */}
          <X
            onClick={closeNavbar}
            className="absolute right-[1.4rem] top-[0.7rem] h-6 w-6 cursor-pointer text-helpMe-100 sm:h-8 sm:w-8"
          />
        </ul>
      </div>
    </div>
  );
}
