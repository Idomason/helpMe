import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CurrentHelpCard from "./CurrentHelpCard";
import { currentHelpData } from "../../constant/constant";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
    slidesToSlide: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 2, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};

export default function CurrentHelpRequestCards() {
  return (
    <Carousel
      additionalTransfrom={0}
      responsive={responsive}
      autoPlay={true}
      arrows={false}
      swipeable={true}
      autoPlaySpeed={4000}
      centerMode={false}
      removeArrowOnDeviceType={["tablet", "mobile"]}
      ssr={true}
      showDots={true}
      infinite
    >
      {currentHelpData.category.medical.map((medical) => (
        <div
          className="mx-auto flex w-11/12 flex-wrap items-center justify-center"
          key={medical.id}
        >
          <CurrentHelpCard medical={medical} />
        </div>
      ))}
    </Carousel>
  );
}
