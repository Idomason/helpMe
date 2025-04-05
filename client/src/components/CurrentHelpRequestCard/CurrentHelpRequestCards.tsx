import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CurrentHelpCard from "./CurrentHelpCard";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { IRequest } from "../../utils/types";

interface RequestResponse {
  data: {
    requests: IRequest[];
  };
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

export default function CurrentHelpRequestCards() {
  const {
    data: requestData,
    isLoading,
    error,
  } = useQuery<RequestResponse>({
    queryKey: ["requests"],
    queryFn: async () => {
      const response = await fetch("/api/v1/requests");
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-4">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center py-4">
        <p className="text-red-500">Error loading requests</p>
      </div>
    );
  }

  if (!requestData?.data?.requests || requestData.data.requests.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center py-4">
        <p>No requests found</p>
      </div>
    );
  }

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
      {requestData.data.requests.map((request) => (
        <div
          className="mx-auto flex w-11/12 flex-wrap items-center justify-center"
          key={request._id}
        >
          <CurrentHelpCard {...request} />
        </div>
      ))}
    </Carousel>
  );
}
