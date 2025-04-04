import { create } from "zustand";
import { HelpRequest, RequestStoreState } from ".";

export const useRequestStore = create<RequestStoreState>((set) => ({
  requests: [],
  setRequests: (requests: HelpRequest[]) => set({ requests }),

  // Create Request
  createRequest: async (newRequest: HelpRequest) => {
    if (
      !newRequest.requestDescription ||
      !newRequest.specificDetails.deadline ||
      !newRequest.specificDetails.amount ||
      !newRequest.category ||
      !newRequest.city ||
      !newRequest.state ||
      !newRequest.country ||
      !newRequest.name ||
      !newRequest.image ||
      !newRequest.status
    )
      return { success: false, message: "Please fill in all fields" };

    const response = await fetch("/api/v1/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest),
    });

    const data = await response.json();

    if (response.ok) {
      set((state: RequestStoreState) => ({
        requests: [...state.requests, data.data],
      }));
      return {
        success: true,
        message: data?.message || "Request created successfully",
      };
    } else {
      return { success: true, message: data?.message };
    }
  },

  //   Fetch Requests
  fetchRequests: async () => {
    try {
      const response = await fetch("/api/v1/requests");
      const data = await response.json();

      if (response.ok) {
        set({ requests: data.data });
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return {
        success: false,
        message: "Failed to fetch requests, please try again",
      };
    }
  },

  //   Fetch Single Request
  fetchRequest: async (requestId: string) => {
    try {
      const response = await fetch(`/api/v1/requests/${requestId}`);
      const data = await response.json();

      if (response.ok) {
        set({ requests: data.data });
        return { success: true, message: "" };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to fetch request" };
    }
  },

  //   Update Request
  updateRequest: async (requestId: string, updatedRequest: HelpRequest) => {
    try {
      const response = await fetch(`/api/v1/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequest),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the UI immediately without needing to refresh
        set((state: RequestStoreState) => ({
          requests: state.requests.map((req: HelpRequest) =>
            req._id === requestId ? data.data : req,
          ),
        }));

        return {
          success: true,
          message: data.message || "Request updated successfully",
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to update request" };
    }
  },

  //   Delete Request
  deleteRequest: async (requestId: string) => {
    try {
      const response = await fetch(`/api/v1/requests/${requestId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        set((state: RequestStoreState) => ({
          requests: state.requests.filter(
            (req: HelpRequest) => req._id !== requestId,
          ),
        }));

        return {
          success: true,
          message: data.message || "Request deleted successfully",
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to delete request" };
    }
  },
}));
