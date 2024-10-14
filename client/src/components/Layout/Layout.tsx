import Footer from "../Footer/Footer";
import { Outlet } from "react-router-dom";
import ResponsiveNav from "../Navbar/responsiveNav";

export default function Layout() {
  return (
    <>
      <ResponsiveNav />
      <Outlet />
      <Footer />
    </>
  );
}
