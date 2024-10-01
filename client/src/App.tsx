import Hero from "./components/Hero/Hero";
import Feature from "./components/Feature/Feature";
import ResponsiveNav from "./components/Navbar/responsiveNav";
import FeaturedHelps from "./components/FeaturedHelps/FeaturedHelps";
import CurrentHelpRequests from "./components/CurrentHelpRequests/CurrentHelpRequests";
import CurrentGiveaways from "./components/CurrentGiveaways/CurrentGiveaways";
import Cta from "./components/CTA/Cta";

function App() {
  return (
    <>
      <ResponsiveNav />
      <Hero />
      <Feature />
      <FeaturedHelps />
      <CurrentHelpRequests />
      <CurrentGiveaways />
      <Cta />
    </>
  );
}

export default App;
