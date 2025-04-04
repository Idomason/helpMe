import Cta from "../CTA/Cta";
import Hero from "../Hero/Hero";
import Feature from "../Feature/Feature";
import FeaturedHelps from "../FeaturedHelps/FeaturedHelps";
import CurrentGiveaways from "../CurrentGiveaways/CurrentGiveaways";
import CurrentHelpRequests from "../CurrentHelpRequests/CurrentHelpRequests";
import FAQ from "../FAQ/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Feature />
      <FeaturedHelps />
      <CurrentHelpRequests />
      <CurrentGiveaways />
      <Cta />
      <FAQ />
    </>
  );
}
