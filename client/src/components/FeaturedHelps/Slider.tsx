import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import SliderCard from "./SliderCard";
import { sliderCardData } from "../../constant/constant";

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

export default function Slider() {
  return (
    <Carousel
      additionalTransfrom={0}
      arrows={true}
      autoPlay={true}
      autoPlaySpeed={4000}
      centerMode={false}
      infinite
      responsive={responsive}
    >
      {sliderCardData && sliderCardData.length > 0
        ? sliderCardData.map((cardData) => (
            <div
              className="mx-auto flex w-11/12 flex-wrap items-center justify-center"
              // className="cardHeightEqual auto-cols-auto items-center justify-center"
              key={cardData.id}
            >
              <SliderCard
                key={cardData.id}
                image={cardData.image}
                title={cardData.title}
                link={cardData.link}
              />
            </div>
          ))
        : null}
    </Carousel>
  );
}
