import Hero from "./components/Hero/Hero";
import Feature from "./components/Feature/Feature";
import ResponsiveNav from "./components/Navbar/responsiveNav";
import FeaturedHelps from "./components/FeaturedHelps/FeaturedHelps";

function App() {
  return (
    <>
      <ResponsiveNav />
      <Hero />
      <Feature />
      <FeaturedHelps />
    </>
  );
}

export default App;
