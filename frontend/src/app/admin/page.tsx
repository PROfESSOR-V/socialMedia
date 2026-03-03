"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, Users, ArrowUpRight } from "lucide-react";
import apiClient from "@/lib/apiClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0,
    recentActivity: [] as any[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await apiClient.get("/api/admin/dashboard");
        if (data && data.data) {
          const metrics = data.data;
          setStats({
            products: metrics.totalProducts || 0,
            orders: metrics.totalOrders || 0,
            revenue: metrics.totalRevenue || 0,
            customers: metrics.totalCustomers || 0,
            recentActivity: metrics.recentActivity || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%" },
    { name: "Total Orders", value: stats.orders.toString(), icon: ShoppingCart, trend: "+8.2%" },
    { name: "Total Products", value: stats.products.toString(), icon: Package, trend: "+2.4%" },
    { name: "Active Customers", value: stats.customers.toString(), icon: Users, trend: "+5.1%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Here's a summary of your store's performance.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
              <div key={index} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  {/* Keep trend hidden or hardcoded until historical data is tracked */}
                </div>
                <h3 className="text-zinc-500 text-sm font-medium">{stat.name}</h3>
                <p className="text-2xl font-semibold text-zinc-900 mt-1">{stat.value}</p>
              </div>
          );
        })}
      </div>

      {/* Charts / Data Section Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-base font-medium text-zinc-900 mb-6">Revenue Over Time</h3>
          <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-600 font-medium">Chart visualization pending</p>
              <p className="text-xs text-zinc-400">Add a library like Recharts in Phase 2</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Placeholder */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-h-[400px]">
          <h3 className="text-base font-medium text-zinc-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingCart className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      New order from {activity.customer} (${activity.amount})
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(activity.date).toLocaleString()} • {activity.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
