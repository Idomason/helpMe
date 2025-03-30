import { useQuery } from "@tanstack/react-query";
import GiftCard from "./GiftCard";
import Spinner from "../Spinner/Spinner";

export default function GiveawayGrid() {
  const { data: giveaways, isLoading } = useQuery({
    queryKey: ["giveaways"],
    queryFn: async () => {
      const response = await fetch("/api/v1/giveaways");
      if (!response.ok) throw new Error("Failed to fetch giveaways");
      return response.json();
    },
  });

  if (isLoading)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 p-6 py-24 pt-32 sm:grid-cols-2 lg:grid-cols-3">
      {giveaways.data?.map((giveaway: any) => (
        <GiftCard key={giveaway._id} giveaway={giveaway} />
      ))}
    </div>
  );
}
