import { create } from "zustand";
import { User } from ".";

interface UserStoreState {
  user: User | null;
  users: User[];
  setUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  loginUser: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  registerUser: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  getUser: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getAllUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<void>;
  getUserByEmail: (email: string) => Promise<void>;
  getUserByRole: (role: string) => Promise<void>;
  getUserByStatus: (status: string) => Promise<void>;
  getUserByCity: (city: string) => Promise<void>;
  getUserByState: (state: string) => Promise<void>;
  getUserByCountry: (country: string) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  users: [],
  setUser: (user: User) => set({ user }),
  setUsers: (users: User[]) => set({ users }),

  //   Login User
  loginUser: async (email: string, password: string) => {
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        set({ user: data.user });
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to login user" };
    }
  },

  //   Logout User
  logoutUser: async () => {
    set({ user: null });
  },

  //   Register User
  registerUser: async (email: string, password: string) => {
    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        set({ user: data.user });
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error(error.message);
      return { success: false, message: "Failed to register user" };
    }
  },

  //   Get User
  getUser: async () => {
    const response = await fetch("/api/v1/auth/me");
    const data = await response.json();
    set({ user: data.user });
  },

  //   Update User
  updateUser: async (user: User) => {
    const response = await fetch("/api/v1/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    set({ user: data.user });
  },

  //   Delete User
  deleteUser: async (userId: string) => {
    const response = await fetch(`/api/v1/auth/users/${userId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get All Users
  getAllUsers: async () => {
    const response = await fetch("/api/v1/auth/users");
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get User by ID
  getUserById: async (id: string) => {
    const response = await fetch(`/api/v1/auth/users/${id}`);
    const data = await response.json();
    set({ user: data.user });
  },

  //   Get User by Email
  getUserByEmail: async (email: string) => {
    const response = await fetch(`/api/v1/auth/users/email/${email}`);
    const data = await response.json();
    set({ user: data.user });
  },

  //   Get User by Role
  getUserByRole: async (role: string) => {
    const response = await fetch(`/api/v1/auth/users/role/${role}`);
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get User by Status
  getUserByStatus: async (status: string) => {
    const response = await fetch(`/api/v1/auth/users/status/${status}`);
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get User by City
  getUserByCity: async (city: string) => {
    const response = await fetch(`/api/v1/auth/users/city/${city}`);
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get User by State
  getUserByState: async (state: string) => {
    const response = await fetch(`/api/v1/auth/users/state/${state}`);
    const data = await response.json();
    set({ users: data.users });
  },

  //   Get User by Country
  getUserByCountry: async (country: string) => {
    const response = await fetch(`/api/v1/auth/users/country/${country}`);
    const data = await response.json();
    set({ users: data.users });
  },
}));
