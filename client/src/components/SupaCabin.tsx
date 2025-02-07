import toast from "react-hot-toast";
import { deleteCabin } from "../services/apiCabins";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SupaCabin({ cabin }) {
  const {
    id: cabinId,
    image,
    maxCapacity,
    name,
    regularPrice,
    description,
    discount,
  } = cabin;

  const queryClient = useQueryClient();

  const { isLoading, mutate, error } = useMutation({
    mutationFn: deleteCabin,
    onSuccess: () => {
      toast.success("Cabin deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["cabins"],
      });
    },
    onError: (err) => toast.error(err.message),
  });

  if (error) return <h2>An error occurred!</h2>;

  return (
    <div className="my-3 rounded-md bg-emerald-400 py-4 shadow">
      <div className="flex items-center justify-between px-4 font-semibold text-emerald-950">
        <div>{image}</div>
        <div>{name}</div>
        <div>{regularPrice}</div>
        <div>{discount}</div>
        <div>{maxCapacity}</div>
        <div>{description}</div>

        <button
          disabled={isLoading}
          onClick={() => mutate(cabinId)}
          className="cursor-pointer bg-red-500 px-6 py-1.5 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
