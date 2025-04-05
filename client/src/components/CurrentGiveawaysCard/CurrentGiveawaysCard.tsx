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

export default function CurrentGiveawaysCard() {
  const { data: giveaways, isLoading } = useQuery<GiveawaysResponse>({
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
    >
      {giveaways?.data?.map((giveaway) => (
        <div
          key={giveaway._id}
          className="flex items-center justify-center py-10"
        >
          <GiftCard giveaway={giveaway} />
        </div>
      ))}
    </Carousel>
  );
}
