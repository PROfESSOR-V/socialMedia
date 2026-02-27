"use client";

import { useEffect, useState } from "react";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, Package, CheckCircle2, Factory, Truck, MapPin, XCircle, AlertCircle, RefreshCw, User as UserIcon, Phone, Mail } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  awb?: string;
  courier?: string;
  trackingStatus?: string;
  createdAt: string;
  items: OrderItem[];
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  addresses: any[];
}

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { token, user: authUser, _hasHydrated } = useStore();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderAndCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://socialmedia-0qzd.onrender.com";

      // 1. Fetch Order (admin endpoint equivalent)
      const orderRes = await fetch(`${baseUrl}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!orderRes.ok) {
        if (orderRes.status === 404) throw new Error("Order not found");
        throw new Error("Failed to fetch order details");
      }

      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to parse order data");
      }
      
      const fetchedOrder = orderData.data;
      setOrder(fetchedOrder);

    } catch (err: any) {
      console.error("Error fetching admin order:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetryShipment = async () => {
    if (!confirm("Are you sure you want to manually trigger the shipment push to Shipmozo?")) return;

    try {
      setRetrying(true);
      setError(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://socialmedia-0qzd.onrender.com";
      const res = await fetch(`${baseUrl}/api/orders/${id}/ship/retry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to retry shipment");
      }

      await fetchOrderAndCustomer(); // Refresh the data
      alert("Shipment pushed successfully!");
    } catch (err: any) {
      console.error("Retry Shipment Error:", err);
      alert(err.message || "An error occurred while retrying shipment");
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token || authUser?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    if (id) {
       fetchOrderAndCustomer();
    }
  }, [id, token, authUser, router, _hasHydrated]);

  if (error) {
    return (
      <div className="space-y-6">
        <Link 
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm w-fit mr-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md mx-auto mt-10">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load order</h3>
          <p className="text-red-600 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchOrderAndCustomer}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500 animate-pulse font-medium">Loading order details...</p>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED' || order.status === 'FAILED';

  // Dynamic tracking steps
  const steps = [];
  if (!isCancelled) {
    steps.push({ id: "placed", title: "Order Placed", description: "Terminal received order", icon: Package });

    if (order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'SHIPPED') {
      steps.push({ id: "processing", title: "Processing", description: "Order is being packed", icon: Factory });
    }

    const statusStr = order.trackingStatus ? order.trackingStatus.toUpperCase() : "";

    if (statusStr.includes('DISPATCHED') || statusStr.includes('SHIPPED') || order.status === 'SHIPPED') {
      steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
    }

    if (statusStr.includes('IN TRANSIT')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "transit", title: "In Transit", description: "Package is on the way", icon: Truck });
    }

    if (statusStr.includes('OUT FOR DELIVERY')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "out_for_delivery", title: "Out for Delivery", description: "Package will be delivered today", icon: MapPin });
    }

    if (order.status === 'DELIVERED' || statusStr.includes('DELIVERED') || statusStr.includes('COMPLETED')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "delivered", title: "Delivered", description: "Package arrived at destination", icon: CheckCircle2 });
    }
  }

  const customerName = order.userName || "Unknown User";
  const customerEmail = order.userEmail || "N/A";
  const customerPhone = order.userPhone || "Not Provided";

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/orders"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 pr-0.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-black tracking-tight">Order Details</h1>
            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
              <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600 flex items-center gap-1">
                ID: {String((order.id as any)?.timestamp || order.id)}
              </span>
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right bg-white px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-widest">Date Placed</p>
          <p className="text-sm font-medium text-black">
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Quick Info */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-14 h-14 bg-zinc-100 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0">
               <UserIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <h2 className="text-lg font-medium text-black">{customerName}</h2>
               <div className="flex items-center gap-4 mt-1">
                 <Link href={`/admin/users/${String((order.userId as any)?.timestamp || order.userId)}`} className="text-sm text-zinc-500 hover:text-black hover:underline transition-colors flex items-center gap-1.5">
                   <Mail className="w-3.5 h-3.5" /> {customerEmail}
                 </Link>
                 <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                   <Phone className="w-3.5 h-3.5" /> {customerPhone}
                 </span>
               </div>
            </div>
          </section>

          {/* Tracker */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-black">Tracking Progress</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                order.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 
                order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                order.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 
                order.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-700 border-zinc-300' :
                order.status === 'DELIVERED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-zinc-50 text-zinc-700 border-zinc-200'
              }`}>
                {order.status}
              </span>
            </div>

            {order.status === 'PAID' && !order.awb && (
              <div className="mb-6 rounded-xl bg-yellow-50 p-4 border border-yellow-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800">Shipment Not Pushed</h3>
                    <p className="mt-1 text-xs text-yellow-700">
                      The automated push to Shipmozo seems to have failed. AWB is missing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetryShipment}
                  disabled={retrying}
                  className="shrink-0 inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {retrying ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Retrying...</>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5" /> Retry Push</>
                  )}
                </button>
              </div>
            )}

            {order.awb && (
               <div className="mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm flex flex-col sm:flex-row sm:gap-6 gap-3">
                 <p><span className="text-zinc-500 mr-1 text-xs uppercase tracking-wider">AWB</span><br/><span className="font-medium tracking-wide text-black">{order.awb}</span></p>
                 <p><span className="text-zinc-500 mr-1 text-xs uppercase tracking-wider">Courier</span><br/><span className="font-medium text-black">{order.courier || "Pending Assignment"}</span></p>
                 <p className="sm:ml-auto"><span className="text-zinc-500 mr-1 text-xs uppercase tracking-wider">Status</span><br/><span className="font-semibold text-black">{order.trackingStatus}</span></p>
               </div>
            )}

            {isCancelled ? (
              <div className="rounded-xl bg-red-50 p-6 border border-red-100">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">Order Cancelled</h3>
                    <p className="mt-1 text-sm text-red-700">
                      This order was cancelled. No further tracking updates will be provided.
                    </p>
                  </div>
                </div>
              </div>
            ) : steps.length > 0 ? (
              <div className="relative pt-2 pb-6 px-2">
                <div className="space-y-8 relative">
                  {steps.map((step, index) => {
                    const isLastStep = index === steps.length - 1;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex gap-4 relative">
                        {/* Connecting Line active state */}
                        {!isLastStep && (
                          <div className="absolute left-[19px] top-8 bottom-[-2rem] w-0.5 bg-black z-0" />
                        )}
                        {/* Dotted pending line */}
                        {isLastStep && step.id !== "delivered" && (
                          <div className="absolute left-[19px] top-10 h-12 w-0.5 border-l-2 border-dashed border-zinc-300 z-0" />
                        )}
                        
                        <div className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-200 border-black",
                          isLastStep ? "bg-black text-white" : "text-black"
                        )}>
                          {!isLastStep ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center pt-0.5 pb-2">
                          <h4 className="text-sm font-semibold text-black">{step.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
                <p className="text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl text-center border border-zinc-100">Tracking information is unavailable for this order status.</p>
            )}
          </section>

          {/* Items List */}
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-black mb-6">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b border-zinc-100 last:border-0 last:pb-0 group">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-600">
                      {item.quantity}x
                    </span>
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-medium text-black hover:underline transition-all">
                        {item.productName || "Unknown Product"}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-0.5">{formatPrice(item.price)} per unit</p>
                    </div>
                  </div>
                  <span className="font-medium text-right ml-4 text-black">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          {/* Order Summary */}
          <section className="bg-zinc-900 border border-black rounded-2xl p-6 shadow-md text-white">
            <h2 className="text-lg font-medium text-white mb-6">Financial Summary</h2>
            
            <div className="space-y-4 border-b border-zinc-800 pb-5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-medium">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Shipping</span>
                <span className="font-medium text-zinc-300">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between font-medium text-xl">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
