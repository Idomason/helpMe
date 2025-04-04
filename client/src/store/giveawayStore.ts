import { create } from "zustand";
import { Giveaway, GiveawayStoreState } from ".";

export const useGiveawayStore = create<GiveawayStoreState>((set) => ({
  giveaways: [],
  setGiveaways: (giveaways: Giveaway[]) => set({ giveaways }),

  createGiveaway: async (newGiveaway: Giveaway) => {
    try {
      const response = await fetch("/api/v1/giveaways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGiveaway),
      });

      const data = await response.json();

      if (response.ok) {
        set((state) => ({
          giveaways: [...state.giveaways, data.data],
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to create giveaway" };
    }
  },

  fetchGiveaway: async (giveawayId: string) => {
    try {
      const response = await fetch(`/api/v1/giveaways/${giveawayId}`);
      const data = await response.json();

      if (response.ok) {
        set((state) => ({
          giveaways: [...state.giveaways, data.data],
        }));
        return { success: true, message: "" };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to fetch giveaway" };
    }
  },

  updateGiveaway: async (giveawayId: string, updatedGiveaway: Giveaway) => {
    try {
      const response = await fetch(`/api/v1/giveaways/${giveawayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGiveaway),
      });

      const data = await response.json();

      if (response.ok) {
        set((state) => ({
          giveaways: state.giveaways.map((giveaway) =>
            giveaway._id === giveawayId ? data.data : giveaway,
          ),
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to update giveaway" };
    }
  },

  deleteGiveaway: async (giveawayId: string) => {
    try {
      const response = await fetch(`/api/v1/giveaways/${giveawayId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        set((state) => ({
          giveaways: state.giveaways.filter(
            (giveaway) => giveaway._id !== giveawayId,
          ),
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to delete giveaway" };
    }
  },
}));
