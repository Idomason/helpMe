import { ArrowUpRight, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { INavbar } from "../../utils/types";
import NavProfile from "../profile/NavProfile";
import BrandLogo from "../BrandLogo/BrandLogo";
import { useAuthUser } from "../../hooks/useAuthUser";
import "./Navbar.css";

export default function Navbar({ openNavbar }: INavbar) {
  const [toggleProfile, setToggleProfile] = useState(false);
  const { data: authUser } = useAuthUser();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <BrandLogo />
        <nav className="site-desktop-nav" aria-label="Main navigation">
          <NavLink to="/all-help-requests">Explore requests</NavLink>
          <NavLink to="/giveaways">Giveaways</NavLink>
          <NavLink to="/giver-board">Givers-board</NavLink>
        </nav>
        <div className="site-header-actions">
          {authUser ? <>
            <Link className="site-header-cta" to="/dashboard?tab=create-request">Request help <ArrowUpRight size={15} /></Link>
            <button type="button" className="site-profile" aria-label="Open account menu" aria-expanded={toggleProfile} onClick={() => setToggleProfile(!toggleProfile)}><img src={authUser.profileImg?.url || "/images/profile.jpg"} alt="" /></button>
          </> : <>
            <Link className="site-login" to="/login">Log in</Link>
            <Link className="site-header-cta" to="/register">Join the community <ArrowUpRight size={15} /></Link>
          </>}
          <button type="button" className="site-menu-toggle" onClick={openNavbar} aria-label="Open navigation menu"><Menu size={23} /></button>
        </div>
      </div>
      {toggleProfile && <NavProfile user={authUser || undefined} status="text-[#05a365] bg-[#06ec92]/10" profileToggler={setToggleProfile} />}
    </header>
  );
}
