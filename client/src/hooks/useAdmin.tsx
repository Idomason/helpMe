import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  totalUsers: number;
  totalMembers: number;
  verifiedMembers: number;
  totalRequests: number;
  activeRequests: number;
  totalGiveaways: number;
  pendingVerifications: number;
  openDisputes: number;
  openReports: number;
  heldEscrows: number;
  heldVolume: number;
  releasedVolume: number;
}

const getJSON = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Request failed");
  const data = await res.json();
  return data.data;
};

export const useAdminStats = () =>
  useQuery<AdminStats>({ queryKey: ["adminStats"], queryFn: () => getJSON("/api/v1/admin/stats") });

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export const useAdminUsers = (q = "", role = "") =>
  useQuery<AdminUser[]>({
    queryKey: ["adminUsers", q, role],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      return getJSON(`/api/v1/admin/users?${params.toString()}`);
    },
  });

export const useAdminVerifications = () =>
  useQuery<any[]>({
    queryKey: ["adminVerifications"],
    queryFn: () => getJSON("/api/v1/verification?status=pending"),
  });

export const useAdminDisputes = () =>
  useQuery<any[]>({
    queryKey: ["adminDisputes"],
    queryFn: () => getJSON("/api/v1/escrow/disputes?status=open"),
  });

export const useAdminReports = () =>
  useQuery<any[]>({
    queryKey: ["adminReports"],
    queryFn: () => getJSON("/api/v1/admin/reports?status=open"),
  });
