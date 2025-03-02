import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { navLinks } from "../../constant/constant";
import { INavbar, INavLinks, IUser } from "../../utils/types";
import { useQuery } from "@tanstack/react-query";
import NavProfile from "../profile/NavProfile";

export default function Navbar({ openNavbar }: INavbar) {
  const [navbarBg, setNavbarBg] = useState(false);
  const [toggleProfile, setToggleProfile] = useState(false);
  const { data: authUser } = useQuery<IUser>({
    queryKey: ["authUser"],
  });

  // TODO
  // Create a user profile link on the Navbar

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
      {toggleProfile && (
        <NavProfile
          user={authUser}
          status={"text-[#05a365] bg-[#06ec92]/10"}
          profileToggler={setToggleProfile}
        />
      )}
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
            {authUser && (
              <ul className="showLinks hidden items-center space-x-4">
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
            )}

            {/* Profile */}
            <div className="flex items-center space-x-4">
              {authUser && (
                // If authenticated, show the profile image
                <div className="rounded-full bg-pink-400 p-0.5 transition-all duration-300 ease-in-out hover:bg-pink-600">
                  <div
                    className="h-10 w-10 transform cursor-pointer overflow-hidden rounded-full"
                    onClick={() => setToggleProfile((prev) => !prev)}
                  >
                    <img
                      className="h-full w-full object-cover"
                      src={authUser?.profileImg?.url || "/images/profile.jpg"}
                      alt="Profile Image"
                    />
                  </div>
                </div>
              )}

              {!authUser && (
                // If not authenticated, show CTA button
                <button className="rounded bg-pink-400 px-6 py-3 font-medium tracking-wide text-white shadow transition-all duration-300 ease-in hover:bg-pink-600 hover:font-semibold md:px-8">
                  <Link to={"/register"}>Sign up today</Link>
                </button>
              )}

              <Menu
                onClick={openNavbar}
                className="showMenuBtn hidden cursor-pointer text-helpMe-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
