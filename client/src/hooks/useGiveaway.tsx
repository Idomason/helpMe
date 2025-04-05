import { useMutation, useQuery } from "@tanstack/react-query";
import { useGiveawayStore, Giveaway } from "../store";
import { toast } from "react-hot-toast";

interface CreateGiveawayResponse {
  success: boolean;
  message: string;
  giveaway?: Giveaway;
}

interface UpdateGiveawayResponse {
  success: boolean;
  message: string;
  giveaway?: Giveaway;
}

interface DeleteGiveawayResponse {
  success: boolean;
  message: string;
}

interface FetchGiveawayResponse {
  success: boolean;
  message: string;
  giveaway?: Giveaway;
}

export const useGiveaway = () => {
  const { createGiveaway, updateGiveaway, deleteGiveaway, fetchGiveaway } =
    useGiveawayStore();

  // Create a new giveaway
  const createGiveawayMutation = useMutation<
    CreateGiveawayResponse,
    Error,
    Giveaway
  >({
    mutationFn: async (newGiveaway) => {
      const response = await createGiveaway(newGiveaway);
      return response as CreateGiveawayResponse;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Giveaway created successfully");
      } else {
        toast.error(response.message || "Failed to create giveaway");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create giveaway");
    },
  });

  // Update an existing giveaway
  const updateGiveawayMutation = useMutation<
    UpdateGiveawayResponse,
    Error,
    { giveawayId: string; updatedGiveaway: Giveaway }
  >({
    mutationFn: async ({ giveawayId, updatedGiveaway }) => {
      const response = await updateGiveaway(giveawayId, updatedGiveaway);
      return response as UpdateGiveawayResponse;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Giveaway updated successfully");
      } else {
        toast.error(response.message || "Failed to update giveaway");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update giveaway");
    },
  });

  // Delete a giveaway
  const deleteGiveawayMutation = useMutation<
    DeleteGiveawayResponse,
    Error,
    string
  >({
    mutationFn: async (giveawayId) => {
      const response = await deleteGiveaway(giveawayId);
      return response as DeleteGiveawayResponse;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Giveaway deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete giveaway");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete giveaway");
    },
  });

  // Fetch a single giveaway
  const fetchGiveawayQuery = useQuery<FetchGiveawayResponse, Error>({
    queryKey: ["giveaway"],
    queryFn: async () => {
      const response = await fetchGiveaway("");
      return response as FetchGiveawayResponse;
    },
    enabled: false, // Disable automatic fetching
  });

  return {
    createGiveaway: createGiveawayMutation.mutate,
    updateGiveaway: updateGiveawayMutation.mutate,
    deleteGiveaway: deleteGiveawayMutation.mutate,
    fetchGiveaway: fetchGiveawayQuery.data,
    isLoading:
      createGiveawayMutation.isLoading ||
      updateGiveawayMutation.isLoading ||
      deleteGiveawayMutation.isLoading,
    isError:
      createGiveawayMutation.isError ||
      updateGiveawayMutation.isError ||
      deleteGiveawayMutation.isError,
    error:
      createGiveawayMutation.error ||
      updateGiveawayMutation.error ||
      deleteGiveawayMutation.error,
  };
};
