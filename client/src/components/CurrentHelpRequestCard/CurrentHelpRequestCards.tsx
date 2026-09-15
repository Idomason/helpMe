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
    <div className="w-full py-2">
      <Carousel
        additionalTransfrom={0}
        responsive={responsive}
        autoPlay={false}
        arrows={true}
        swipeable={true}
        centerMode={false}
        removeArrowOnDeviceType={["mobile"]}
        ssr={true}
        showDots={false}
        infinite={requestData.data.requests.length > 4}
        containerClass="home-carousel"
        itemClass="home-carousel__item"
      >
        {requestData.data.requests.map((request) => (
          <div className="h-full w-full px-2 py-3" key={request._id}>
            <CurrentHelpCard {...request} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
