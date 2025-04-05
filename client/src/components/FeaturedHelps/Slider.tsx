import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import SliderCard from "./SliderCard";
import { useQuery } from "@tanstack/react-query";

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

interface SliderCardData {
  id: number;
  image: string;
  title: string;
  link: string;
}

export default function Slider() {
  const { data: requests } = useQuery<{ data: SliderCardData[] }>({
    queryKey: ["requests"],
  });

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
      {requests?.data && requests.data.length > 0
        ? requests.data.map((cardData: SliderCardData) => (
            <div
              className="mx-auto flex w-11/12 flex-wrap items-center justify-center"
              key={cardData.id}
            >
              <SliderCard key={cardData.id} {...cardData} />
            </div>
          ))
        : null}
    </Carousel>
  );
}
