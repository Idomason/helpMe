import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import SliderCard from "./SliderCard";

const responsive = {
  //   superLargeDesktop: {
  //     // the naming can be any, depends on you.
  //     breakpoint: { max: 4000, min: 3000 },
  //     items: 3,
  //     slidesToSlide: 3,
  //   },
  //   desktop: {
  //     breakpoint: { max: 3000, min: 1024 },
  //     items: 2,
  //     slidesToSlide: 2, // optional, default to 1.
  //   },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
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
      itemClass="item"
    >
      <SliderCard
        image="/images/pic2.png"
        title="TechExperts in Agro Revelutionary Seminars in Africaand beyound"
        link="/learn-more"
      />
      <SliderCard
        image="/images/pic3.png"
        title="TechExperts in Agro Revelutionary Seminars in Africaand beyound"
        link="/learn-more"
      />
      <SliderCard
        image="/images/pic1.png"
        title="TechExperts in Agro Revelutionary Seminars in Africaand beyound"
        link="/learn-more"
      />
      <SliderCard
        image="/images/pic4.png"
        title="TechExperts in Agro Revelutionary Seminars in Africaand beyound"
        link="/learn-more"
      />
    </Carousel>
  );
}
