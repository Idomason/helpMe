import Footer from "../Footer/Footer";
import ResponsiveNav from "../Navbar/responsiveNav";

export default function Layout({ children }) {
  return (
    <>
      <ResponsiveNav />
      {children}
      <Footer />
    </>
  );
}
