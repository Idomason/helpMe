import { useQuery } from "@tanstack/react-query";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./Carousel.css";
import SliderCard from "./SliderCard";
import Spinner from "../Spinner/Spinner";

const responsive = {
  desktop: {
    breakpoint: { max: 4000, min: 1280 },
    items: 4,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1280, min: 640 },
    items: 3,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export default function LatestRequests() {
  const { data: requests, isLoading, error } = useQuery({
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

  if (error) {
    return <p className="py-8 text-center text-sm text-gray-500">Featured requests are temporarily unavailable.</p>;
  }

  const items = Array.isArray(requests?.data?.requests) ? requests.data.requests : [];

  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No featured requests yet.</p>;
  }

  return (
    <div className="w-full py-2">
      <Carousel
        responsive={responsive}
        autoPlay={false}
        arrows={true}
        swipeable={true}
        centerMode={false}
        removeArrowOnDeviceType={["mobile"]}
        ssr={true}
        showDots={false}
        infinite={items.length > 4}
        containerClass="home-carousel"
        itemClass="home-carousel__item"
      >
        {items.map((request: any) => (
          <div key={request._id} className="h-full w-full px-2 py-3">
            <SliderCard {...request} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
