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
    <div className="mx-auto flex w-11/12 flex-wrap items-center justify-center">
      {giveaways.data?.map((giveaway: any) => (
        <GiftCard key={giveaway._id} giveaway={giveaway} />
      ))}
    </div>
  );
}
