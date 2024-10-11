import Cta from "../CTA/Cta";
import Hero from "../Hero/Hero";
import Footer from "../Footer/Footer";
import Feature from "../Feature/Feature";
import ResponsiveNav from "../Navbar/responsiveNav";
import FeaturedHelps from "../FeaturedHelps/FeaturedHelps";
import CurrentGiveaways from "../CurrentGiveaways/CurrentGiveaways";
import CurrentHelpRequests from "../CurrentHelpRequests/CurrentHelpRequests";

export default function Home() {
  return (
    <>
      <ResponsiveNav />
      <Hero />
      <Feature />
      <FeaturedHelps />
      <CurrentHelpRequests />
      <CurrentGiveaways />
      <Cta />
      <Footer />
    </>
  );
}
