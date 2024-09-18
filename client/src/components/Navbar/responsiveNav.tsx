import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import { useState } from "react";

export default function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false);

  const showNavbar = () => setIsOpen(true);
  const hideNavbar = () => setIsOpen(false);

  return (
    <>
      <Navbar openNavbar={showNavbar} />
      <MobileNav isOpen={isOpen} closeNavbar={hideNavbar} />
    </>
  );
}
