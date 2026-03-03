"use client";

import { useEffect, useState } from "react";
import { Search, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

export default function AdminPaymentsPage() {
  const { token, user, _hasHydrated } = useStore();
  const router = useRouter();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiClient.get('/api/payments/admin/all');
      if (res.data?.success) {
        setPayments(res.data.data || []);
      } else {
        throw new Error("Failed to parse data");
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while fetching payments.");
    } finally {
      setLoading(false);
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

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.providerPaymentId && p.providerPaymentId.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query)) ||
      (p.orderId && p.orderId.toLowerCase().includes(query)) ||
      (p.userName && p.userName.toLowerCase().includes(query)) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(query)) ||
      (p.userPhone && p.userPhone.includes(query))
    );
  });

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md mx-auto mt-10">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load payments</h3>
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
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Payments</h1>
          <p className="text-sm text-zinc-500 mt-1">View all payment transactions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by ID, Customer, or Provider ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-shadow"
            />
          </div>
          <div className="text-sm text-zinc-500 font-medium bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
            Total Payments: {payments.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Provider ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-2" />
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No payments found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900">{payment.userName || "Unknown User"}</p>
                      <p className="text-xs text-zinc-500">{payment.userPhone || payment.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-medium whitespace-nowrap">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === "SUCCESS" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {payment.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {payment.provider}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                      {payment.providerPaymentId || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
