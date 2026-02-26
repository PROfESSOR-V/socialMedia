"use client";

import { useEffect, useState } from "react";
import { Search, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  addresses: any[];
}

interface CombinedOrder extends OrderData {
  userName: string;
  userEmail: string;
}

export default function AdminOrdersPage() {
  const { token, user, _hasHydrated } = useStore();
  const router = useRouter();
  
  const [orders, setOrders] = useState<CombinedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://socialmedia-0qzd.onrender.com";

      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/api/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${baseUrl}/api/user`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!ordersRes.ok || !usersRes.ok) throw new Error("Failed to fetch data");

      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      if (ordersData.success && usersData.success) {
        const usersMap = new Map<string, UserData>();
        
        usersData.data.forEach((u: UserData) => {
          const idString = String((u.id as any)?.timestamp || u.id || "");
          usersMap.set(idString, u);
        });

        const combined = ordersData.data.map((o: OrderData) => {
           let userName = "Unknown User";
           let userEmail = "N/A";
           
           const uIdStr = String((o.userId as any)?.timestamp || o.userId || "");
           const u = usersMap.get(uIdStr);
           if (u) {
             userName = (u.name && u.name !== "Unknown") ? u.name : (u.addresses && u.addresses.length > 0 ? u.addresses[0].name : "Unknown");
             userEmail = u.email || "N/A";
           }
           return { ...o, userName, userEmail };
        });

        // Sort by newest first
        combined.sort((a: CombinedOrder, b: CombinedOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(combined);
      } else {
        throw new Error("Failed to parse data");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token || user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    fetchData();
  }, [token, user, router, _hasHydrated]);

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    const idString = String((o.id as any)?.timestamp || o.id || "");
    return (
      idString.toLowerCase().includes(query) ||
      o.userName.toLowerCase().includes(query) ||
      o.userEmail.toLowerCase().includes(query) ||
      o.status.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING": 
      case "PENDING":
      case "PAID": return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
      case "FAILED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md mx-auto mt-10">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load orders</h3>
        <p className="text-red-600 mb-6 text-sm">{error}</p>
        <button
          onClick={fetchData}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Orders</h1>
          <p className="text-sm text-zinc-500 mt-1">View and manage customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by ID, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-shadow"
            />
          </div>
          <div className="text-sm text-zinc-500 font-medium bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
            Total Orders: {orders.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const idString = String((order.id as any)?.timestamp || order.id || "");
                  return (
                    <tr key={idString} className="hover:bg-zinc-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-zinc-900 border-r border-zinc-50">
                        ...{idString.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{order.userName}</p>
                        <p className="text-xs text-zinc-500">{order.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-900 font-medium">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/orders/${idString}`}
                          className="inline-flex p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 placeholder"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
