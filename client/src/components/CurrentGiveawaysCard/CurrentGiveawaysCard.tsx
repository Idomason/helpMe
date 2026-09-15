import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
// import GiveawaysCard from "./GiveawaysCard";
import GiftCard from "./GiftCard";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../Spinner/Spinner";
import { Giveaway } from "../../store";

interface GiveawaysResponse {
  data: Giveaway[];
  message: string;
  success: boolean;
}

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

export default function CurrentGiveawaysCard() {
  const {
    data: giveaways,
    isLoading,
    error,
  } = useQuery<GiveawaysResponse>({
    queryKey: ["giveaways"],
    queryFn: async () => {
      const response = await fetch("/api/v1/giveaways");
      if (!response.ok) throw new Error("Failed to fetch giveaways");
      return response.json();
    },
  });

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center gap-6">
        <Spinner />
      </div>
    );

  if (error) {
    return (
      <div className="flex min-h-40 w-full items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-500">
          Giveaways are temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const items = Array.isArray(giveaways?.data) ? giveaways.data : [];

  if (items.length === 0) {
    return (
      <div className="flex min-h-40 w-full items-center justify-center py-8 text-center">
        <p className="text-sm text-gray-500">No giveaways are available yet.</p>
      </div>
    );
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
        infinite={items.length > 3}
        containerClass="home-carousel"
        itemClass="home-carousel__item"
      >
        {items.map((giveaway) => (
          <div
            key={giveaway._id}
            className="h-full w-full px-2 py-3"
          >
            <GiftCard giveaway={giveaway} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
