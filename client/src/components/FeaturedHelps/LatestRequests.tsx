import { useQuery } from "@tanstack/react-query";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./Carousel.css";
import SliderCard from "./SliderCard";
import Spinner from "../Spinner/Spinner";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
    slidesToSlide: 2,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export default function LatestRequests() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["latest-requests"],
    queryFn: async () => {
      const response = await fetch("/api/v1/requests?sort=-createdAt&limit=10");
      if (!response.ok) throw new Error("Failed to fetch latest requests");
      return response.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="w-full py-4">
      <Carousel
        responsive={responsive}
        autoPlay={true}
        arrows={true}
        swipeable={true}
        autoPlaySpeed={3000}
        centerMode={false}
        removeArrowOnDeviceType={["tablet", "mobile"]}
        ssr={true}
        showDots={true}
        infinite
        containerClass="carousel-container"
        itemClass="carousel-item-padding-40-px"
      >
        {requests.data.requests.map((request: any) => (
          <div key={request._id} className="px-2">
            <SliderCard {...request} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
