"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Package, CheckCircle2, Factory, Truck, MapPin, XCircle, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  awb?: string;
  courier?: string;
  trackingStatus?: string;
  trackingData?: any;
  paymentStatus?: string;
  shipmentStatus?: string;
  refundReferenceId?: string;
  refundRequestedAt?: string;
  refundCompletedAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.orders.get(id);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleRefreshTracking = async () => {
    try {
      setRefreshing(true);
      const data = await api.orders.refreshTracking(id);
      if (data) setOrder(data);
    } catch (error) {
      console.error("Failed to refresh tracking:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshRefund = async () => {
    try {
      setRefreshing(true);
      const data = await api.orders.refreshRefund(id);
      if (data) setOrder(data);
    } catch (error) {
      console.error("Failed to refresh refund:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <XCircle className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h1 className="mb-4 font-serif text-3xl font-medium">Order Not Found</h1>
        <p className="mb-8 text-muted-foreground">We couldn't find the requested order.</p>
        <Link href="/orders">
          <Button size="lg">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED' || order.status === 'FAILED';

  const sStatus = order.shipmentStatus || "NOT_CREATED";
  const statusStr = order.trackingStatus ? order.trackingStatus.toUpperCase() : "";

  const isProcessing = order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'SHIPPED' || sStatus !== 'NOT_CREATED';
  const isPickupPending = sStatus === 'MANIFESTED' || sStatus === 'PICKED_UP' || sStatus === 'IN_TRANSIT' || sStatus === 'DELIVERED';
  const isPickupComplete = sStatus === 'PICKED_UP' || sStatus === 'IN_TRANSIT' || sStatus === 'DELIVERED';
  const isInTransit = sStatus === 'IN_TRANSIT' || sStatus === 'DELIVERED';
  const isOutForDelivery = statusStr.includes('OUT FOR DELIVERY') || sStatus === 'DELIVERED';
  const isDelivered = sStatus === 'DELIVERED' || statusStr.includes('DELIVERED') || statusStr.includes('COMPLETED');

  const allSteps = [
    { id: "created", title: "Order Created", description: "Terminal received your order", icon: Package, completed: true, current: !isProcessing },
    { id: "processing", title: "Processing", description: "Order is being packed at the warehouse", icon: Factory, completed: isProcessing, current: isProcessing && !isPickupPending },
    { id: "pickup_pending", title: "Pickup Pending", description: "Awaiting courier pickup", icon: Truck, completed: isPickupPending, current: isPickupPending && !isPickupComplete },
    { id: "pickup_complete", title: "Pickup Complete", description: "Handed over to delivery partner", icon: Truck, completed: isPickupComplete, current: isPickupComplete && !isInTransit },
    { id: "transit", title: "In Transit", description: "Your package is on the way", icon: Truck, completed: isInTransit, current: isInTransit && !isOutForDelivery },
    { id: "out_for_delivery", title: "Out for Delivery", description: "Your package will be delivered today", icon: MapPin, completed: isOutForDelivery, current: isOutForDelivery && !isDelivered },
    { id: "delivered", title: "Delivered", description: "Package arrived at destination", icon: CheckCircle2, completed: isDelivered, current: isDelivered }
  ];

  const getTrackingHistory = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.tracking_data && Array.isArray(data.tracking_data.track_status)) return data.tracking_data.track_status;
    if (data.tracking_data && Array.isArray(data.tracking_data)) return data.tracking_data;
    if (data.scans && Array.isArray(data.scans)) return data.scans;
    if (data.history && Array.isArray(data.history)) return data.history;
    
    for (const key in data) {
       if (Array.isArray(data[key]) && data[key].length > 0 && typeof data[key][0] === 'object') {
           return data[key];
       }
    }
    return [];
  };

  const trackingHistories = getTrackingHistory(order.trackingData);

  const isRefundInitiated = order.paymentStatus === 'REFUND_INITIATED';
  const isRefunded = order.paymentStatus === 'REFUNDED';
  const isRefundFlow = isRefundInitiated || isRefunded;

  const refundSteps = [];
  if (isRefundFlow) {
    refundSteps.push({ id: "refund_requested", title: "Refund Requested", description: "Your cancellation request has been received.", icon: Package });
    if (isRefundInitiated) {
      refundSteps.push({ id: "refund_processing", title: "Processing Refund", description: "Refund is being processed by the merchant.", icon: Factory });
    }
    if (isRefunded) {
      refundSteps.push({ id: "refund_processing", title: "Refund Processed", description: "Refund has been processed by the merchant.", icon: Factory });
      refundSteps.push({ id: "refund_completed", title: "Refund Completed", description: "Refund successfully credited back to original payment method.", icon: CheckCircle2 });
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link
          href="/orders"
          className="flex items-center text-sm text-muted-foreground hover:text-primary w-fit"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-primary mb-2">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm mb-1">
            Placed on <span className="font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}</span>
          </p>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            order.paymentStatus === 'REFUND_INITIATED' ? 'bg-purple-100 text-purple-800' :
            order.paymentStatus === 'REFUNDED' ? 'bg-gray-100 text-gray-800' :
            order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
            order.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
            order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Status: {order.paymentStatus === 'REFUND_INITIATED' ? 'REFUND INITIATED' : order.paymentStatus === 'REFUNDED' ? 'REFUNDED' : order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Tracker */}
          <section className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">
                {isRefundFlow ? "Refund Tracking" : "Tracking"}
              </h2>
              {isRefundFlow ? (
                <Button variant="outline" size="sm" onClick={handleRefreshRefund} disabled={refreshing}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                  Refresh
                </Button>
              ) : (!isCancelled && order.awb) ? (
                <Button variant="outline" size="sm" onClick={handleRefreshTracking} disabled={refreshing}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                  Refresh
                </Button>
              ) : null}
            </div>

            {order.awb && !isRefundFlow && !isCancelled && (
               <div className="mb-6 p-4 bg-secondary/10 rounded-md border border-secondary text-sm flex flex-col sm:flex-row sm:gap-6 gap-2">
                 <p><span className="text-muted-foreground mr-1">AWB:</span> <span className="font-medium tracking-wide">{order.awb}</span></p>
                 <p><span className="text-muted-foreground mr-1">Courier:</span> <span className="font-medium">{order.courier || "Pending Assignment"}</span></p>
                 <p className="sm:ml-auto"><span className="text-muted-foreground mr-1">Status:</span> <span className="font-semibold text-primary">{order.trackingStatus}</span></p>
               </div>
            )}

            {isRefundFlow ? (
              <div className="relative pt-4 pb-8">
                {isRefunded && order.refundReferenceId && (
                  <div className="mb-6 p-4 bg-green-50 rounded-md border border-green-200 text-sm flex flex-col sm:flex-row sm:gap-6 gap-2 text-green-800">
                    <p><span className="font-semibold">Refund Successful</span></p>
                    <p><span className="font-medium">Ref ID:</span> <span className="tracking-wide">{order.refundReferenceId}</span></p>
                  </div>
                )}
                {isRefundInitiated && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-md border border-purple-200 text-sm flex flex-col sm:flex-row sm:gap-6 gap-2 text-purple-800">
                    <p><span className="font-semibold">Refund Initiated</span></p>
                    <p>It usually takes 5-7 business days for the refund to reflect in your original payment method.</p>
                  </div>
                )}
                <div className="space-y-8 relative">
                  {refundSteps.map((step, index) => {
                    const isLastStep = index === refundSteps.length - 1;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex gap-4 relative">
                        {/* Connecting Line active state */}
                        {!isLastStep && (
                          <div className="absolute left-[21px] top-8 bottom-[-2rem] w-0.5 bg-primary z-0" />
                        )}
                        {/* Dotted pending line */}
                        {isLastStep && step.id !== "refund_completed" && (
                          <div className="absolute left-[21px] top-11 h-12 w-0.5 border-l-2 border-dashed border-zinc-300 z-0" />
                        )}
                        
                        <div className={cn(
                          "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-200 border-primary",
                          isLastStep && step.id === 'refund_completed' ? "bg-primary text-primary-foreground" : "text-primary"
                        )}>
                          {(isLastStep && step.id !== 'refund_completed') ? (
                             <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                          ) : (
                             <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center pt-1 pb-2">
                          <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : isCancelled ? (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Order Cancelled</h3>
                    <p className="mt-2 text-sm text-red-700">
                      This order was cancelled. If a payment was made but not refunded, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            ) : allSteps.length > 0 ? (
              <div className="relative pt-4 pb-8">
                <div className="space-y-8 relative">
                  {allSteps.map((step, index) => {
                    const isLastItem = index === allSteps.length - 1;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex gap-4 relative">
                        {!isLastItem && step.completed && !step.current && (
                          <div className="absolute left-[21px] top-8 bottom-[-2rem] w-0.5 bg-primary z-0" />
                        )}
                        {!isLastItem && step.current && (
                          <div className="absolute left-[21px] top-11 h-12 w-0.5 border-l-2 border-dashed border-zinc-300 z-0" />
                        )}
                        {!isLastItem && !step.completed && (
                          <div className="absolute left-[21px] top-8 bottom-[-2rem] w-0.5 bg-zinc-200 z-0" />
                        )}
                        
                        <div className={cn(
                          "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                          step.completed && !step.current ? "bg-white border-primary text-primary" : 
                          step.current ? "bg-primary border-primary text-primary-foreground" : 
                          "bg-zinc-50 border-zinc-200 text-zinc-400"
                        )}>
                          {step.completed && !step.current ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className={cn("flex flex-col justify-center pt-1 pb-2", !step.completed && "opacity-50")}>
                          <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground">Tracking information is unavailable for this order status.</p>
            )}
          </section>

          {/* Detailed Tracking History Card */}
          {(!isRefundFlow && !isCancelled && trackingHistories.length > 0) && (
            <section className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium text-primary mb-6">Tracking Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-50 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-4 py-3 border-b">Date Time</th>
                      <th className="px-4 py-3 border-b">Location</th>
                      <th className="px-4 py-3 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                     {trackingHistories.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-4 py-4 text-zinc-600">
                            {row.date || row.Date || row.date_time || row.time || row.timestamp || "-"}
                          </td>
                          <td className="px-4 py-4 text-zinc-800">
                            {row.location || row.Location || row.city || "-"}
                          </td>
                          <td className="px-4 py-4 text-zinc-900 font-medium">
                            {row.status || row.Status || row.activity || row.message || "-"}
                          </td>
                        </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Items List */}
          <section className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium text-primary mb-6">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-medium">
                      {item.quantity}x
                    </span>
                    <div>
                      <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary transition-colors">
                        {item.productName || "Unknown Product"}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)} per unit</p>
                    </div>
                  </div>
                  <span className="font-medium text-right ml-4">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Order Summary */}
          <section className="bg-card border rounded-lg p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-medium text-primary mb-6">Summary</h2>
            
            <div className="space-y-4 border-b pb-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-primary">Free</span>
              </div>
            </div>
            
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
