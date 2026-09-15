import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, CheckCircle2, LoaderCircle } from "lucide-react";
import { useAdminUsers } from "../../hooks/useAdmin";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const { data: users, isLoading } = useAdminUsers(q, role);

  const action = useMutation({
    mutationFn: async ({ id, kind, value }: { id: string; kind: "role" | "active"; value: any }) => {
      const res = await fetch(`/api/v1/admin/users/${id}/${kind}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(kind === "role" ? { role: value } : { active: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      return data;
    },
    onSuccess: (d) => {
      toast.success(d.message);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-helpMe-500 focus:bg-white focus:ring-2 focus:ring-helpMe-500/20"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-helpMe-500 focus:bg-white"
        >
          <option value="">All roles</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><LoaderCircle className="h-5 w-5 animate-spin text-helpMe-500" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u._id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-medium text-gray-900">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={u.role}
                      onChange={(e) => action.mutate({ id: u._id, kind: "role", value: e.target.value })}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs capitalize"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {u.active ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="py-3">
                    {u.active ? (
                      <button
                        onClick={() => action.mutate({ id: u._id, kind: "active", value: false })}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Ban className="h-3.5 w-3.5" /> Ban
                      </button>
                    ) : (
                      <button
                        onClick={() => action.mutate({ id: u._id, kind: "active", value: true })}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.length === 0) && <p className="py-8 text-center text-sm text-gray-400">No users found.</p>}
        </div>
      )}
    </div>
  );
}
