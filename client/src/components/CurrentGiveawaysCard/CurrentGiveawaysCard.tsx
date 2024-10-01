import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import GiveawaysCard from "./GiveawaysCard";
import { currentHelpData } from "../../constant/constant";

const responsive = {
  desktop: {
    breakpoint: { max: 1280, min: 1024 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};

export default function CurrentGiveawaysCard() {
  return (
    <Carousel
      responsive={responsive}
      autoPlay={true}
      arrows={false}
      swipeable={true}
      autoPlaySpeed={2000}
      centerMode={false}
      removeArrowOnDeviceType={["tablet", "mobile"]}
      ssr={true}
      showDots={true}
      infinite
      itemClass="item"
      containerClass="container"
    >
      {currentHelpData.category.disaster.map((disaster) => (
        <div className="mx-auto w-full" key={disaster.id}>
          <GiveawaysCard disaster={disaster} />
        </div>
      ))}
    </Carousel>
  );
}
