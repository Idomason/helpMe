export * from "./requestStore";
export * from "./giveawayStore";
export * from "./userStore";

// Common types
export interface BaseEntity {
  _id: string;
  name: string;
  image: { url: string; public_id: string };
  city: string;
  state: string;
  country: string;
  category: string;
  status: string;
  specificDetails: {
    amount: number;
    deadline: string;
  };
  createdAt: string;
}

export interface HelpRequest extends BaseEntity {
  requestDescription: string;
}

export interface Giveaway {
  _id: string;
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
  };
  numVotes: number;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isEnded: boolean;
  requirements: string;
  prizes: string;
  rules: string;
  giveawayDescription: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImg?: { url: string; public_id: string };
  helpRequests?: HelpRequest[];
  helpsRendered?: HelpRequest[];
  giveaways?: Giveaway[];
  role: "user" | "admin";
  createdAt: string;
}

export interface RequestStoreState {
  requests: HelpRequest[];
  setRequests: (requests: HelpRequest[]) => void;
  createRequest: (
    newRequest: HelpRequest,
  ) => Promise<{ success: boolean; message: string }>;
  fetchRequests: () => Promise<{ success: boolean; message: string }>;
  fetchRequest: (
    requestId: string,
  ) => Promise<{ success: boolean; message: string }>;
  updateRequest: (
    requestId: string,
    updatedRequest: HelpRequest,
  ) => Promise<{ success: boolean; message: string }>;
  deleteRequest: (
    requestId: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export interface GiveawayStoreState {
  giveaways: Giveaway[];
  setGiveaways: (giveaways: Giveaway[]) => void;
  createGiveaway: (
    newGiveaway: Giveaway,
  ) => Promise<{ success: boolean; message: string }>;
  fetchGiveaway: (
    giveawayId: string,
  ) => Promise<{ success: boolean; message: string }>;
  updateGiveaway: (
    giveawayId: string,
    updatedGiveaway: Giveaway,
  ) => Promise<{ success: boolean; message: string }>;
  deleteGiveaway: (
    giveawayId: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export interface UserStoreState {
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
