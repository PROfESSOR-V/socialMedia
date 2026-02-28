"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Search, AlertCircle, RefreshCw } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface Address {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  addresses: Address[];
  createdAt: string;
}

export default function AdminUsersPage() {
  const { token, user, _hasHydrated } = useStore();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/user');
      const data = response.data;

      if (data.success) {
        setUsers(data.data);
      } else {
        throw new Error(data.message || "Failed to parse users data");
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user || user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    fetchUsers();
  }, [token, user, router, _hasHydrated]);

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const idString = String((u.id as any)?.timestamp || u.id || "");
    const userName = (u.name && u.name !== "Unknown") ? u.name : (u.addresses && u.addresses.length > 0 ? u.addresses[0].name : "Unknown");
    return (
      userName.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      idString.toLowerCase().includes(query) ||
      u.mobileNumber?.includes(query)
    );
  });

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md mx-auto mt-10">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load users</h3>
        <p className="text-red-600 mb-6 text-sm">{error}</p>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-black tracking-tight">Users</h1>
          <p className="text-zinc-500 text-sm mt-1">View and manage all registered users.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition-all"
            />
          </div>
          <div className="text-sm text-zinc-500 font-medium bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
            Total Users: {users.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-200">
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User ID</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mobile Number</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Country</th>
                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {isLoading ? (
                // Loading Skeletons
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 whitespace-nowrap"><div className="h-4 bg-zinc-200 rounded w-24"></div></td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 bg-zinc-200 rounded w-32"></div>
                        <div className="h-3 bg-zinc-200 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap"><div className="h-4 bg-zinc-200 rounded w-24"></div></td>
                    <td className="p-4 whitespace-nowrap"><div className="h-4 bg-zinc-200 rounded w-20"></div></td>
                    <td className="p-4 whitespace-nowrap text-right"><div className="h-8 bg-zinc-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-zinc-300 mb-3" />
                      <p className="text-sm text-zinc-600">No users found matching your search.</p>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-black text-sm font-medium hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const country = u.addresses && u.addresses.length > 0 ? u.addresses[0].country : "N/A";
                  const userName = (u.name && u.name !== "Unknown") ? u.name : (u.addresses && u.addresses.length > 0 ? u.addresses[0].name : "Unknown");
                  const idString = String((u.id as any)?.timestamp || u.id || "");
                  return (
                    <tr key={idString} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="p-4 whitespace-nowrap text-sm font-medium text-zinc-900 border-r border-zinc-100/50">
                        {idString.substring(0, 10)}...
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900">{userName}</span>
                          <span className="text-xs text-zinc-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-zinc-600">
                        {u.mobileNumber || "N/A"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-zinc-600">
                        {country}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right">
                        <Link 
                          href={`/admin/users/${idString}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 placeholder"
                          aria-label={`View details for ${u.name || u.email}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
