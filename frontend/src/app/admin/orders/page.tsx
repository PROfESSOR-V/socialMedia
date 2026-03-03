"use client";

import { useEffect, useState } from "react";
import { Search, Eye, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

interface OrderData {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  shipmentStatus?: string;
  shipmozoMsg?: string;
  shipment?: {
    awb?: string;
    courier?: string;
  };
  refundReferenceId?: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export default function AdminOrdersPage() {
  const { token, user, _hasHydrated } = useStore();
  const router = useRouter();
  
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingAwbId, setFetchingAwbId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ordersRes = await apiClient.get('/api/orders/admin/all');
      const ordersData = ordersRes.data;

      if (ordersData.success) {
        const orderList = ordersData.data || [];
        // Sort by newest first
        orderList.sort((a: OrderData, b: OrderData) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(orderList);
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

  const handlePushRetry = async (orderId: string) => {
    try {
      await apiClient.post(`/api/orders/${orderId}/ship/retry`);
      await fetchData(); 
    } catch(err: any) {
      alert("Failed to retry push: " + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleFetchAwb = async (orderId: string) => {
    try {
      setFetchingAwbId(orderId);
      const res = await apiClient.post(`/api/orders/${orderId}/fetch-awb`);
      if (res.data?.success && res.data?.data) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      } else {
        await fetchData(); 
      }
    } catch(err: any) {
      alert(err.response?.data?.message || err.message || "Failed to fetch AWB. Please ensure you assigned a courier & pickup location on Shipmozo dashboard.");
      console.error(err);
    } finally {
      setFetchingAwbId(null);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user || user?.role !== "ADMIN") {
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
      (o.userName && o.userName.toLowerCase().includes(query)) ||
      (o.userPhone && o.userPhone.includes(query)) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(query)) ||
      o.status.toLowerCase().includes(query) ||
      (o.paymentStatus && o.paymentStatus.toLowerCase().includes(query))
    );
  });

  const getStatusColor = (status: string, paymentStatus?: string) => {
    if (paymentStatus === "REFUND_INITIATED") return "bg-purple-50 text-purple-700 border-purple-200";
    if (paymentStatus === "REFUNDED") return "bg-gray-50 text-gray-700 border-gray-200";

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

  const getDisplayStatus = (order: OrderData) => {
    if (order.paymentStatus === "REFUND_INITIATED") return "REFUND PENDING";
    if (order.paymentStatus === "REFUNDED") return "REFUNDED";
    return order.status;
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
              placeholder="Search by ID, name, or mobile..."
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
                <th className="px-6 py-3">Shipmozo</th>
                <th className="px-6 py-3">AWB</th>
                <th className="px-6 py-3">Cashfree Ref ID</th>
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
                        <p className="font-medium text-zinc-900">{order.userName || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{order.userPhone || order.userEmail || "N/A"}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status, order.paymentStatus)}`}>
                          {getDisplayStatus(order)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.shipmozoMsg === "Success" ? (
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                             Success
                           </span>
                        ) : order.paymentStatus === "PAID" && (order.status !== "CANCELLED") ? (
                           <div className="flex flex-col gap-1 items-start">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                               Failed
                             </span>
                             <button onClick={() => handlePushRetry(order.id as string)} className="text-[10px] hover:underline text-blue-600 font-medium flex items-center gap-1">
                               <RefreshCw className="w-3 h-3" /> Push Again
                             </button>
                           </div>
                        ) : (
                           <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {order.shipment?.awb ? (
                           <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                             ✓ {order.shipment.awb}
                           </span>
                        ) : order.shipmozoMsg === "Success" ? (
                           <button 
                             onClick={() => handleFetchAwb(order.id as string)} 
                             disabled={fetchingAwbId === order.id}
                             className="text-[10px] hover:bg-zinc-100 px-2 py-1 rounded border border-zinc-200 font-medium flex items-center gap-1 text-zinc-700 disabled:opacity-50"
                           >
                               {fetchingAwbId === order.id ? (
                                 <><Loader2 className="w-3 h-3 animate-spin"/> Fetching...</>
                               ) : "Get AWB"}
                           </button>
                        ) : (
                           <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {order.refundReferenceId || "-"}
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
