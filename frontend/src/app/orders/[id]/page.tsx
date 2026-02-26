"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Package, CheckCircle2, Factory, Truck, MapPin, XCircle } from "lucide-react";
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
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Dynamic tracking steps
  const steps = [];
  if (!isCancelled) {
    steps.push({ id: "placed", title: "Order Placed", description: "Terminal received your order", icon: Package });

    if (order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'SHIPPED') {
      steps.push({ id: "processing", title: "Processing", description: "Order is being packed at the warehouse", icon: Factory });
    }

    const statusStr = order.trackingStatus ? order.trackingStatus.toUpperCase() : "";

    if (statusStr.includes('DISPATCHED') || statusStr.includes('SHIPPED') || order.status === 'SHIPPED') {
      steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
    }

    if (statusStr.includes('IN TRANSIT')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "transit", title: "In Transit", description: "Your package is on the way", icon: Truck });
    }

    if (statusStr.includes('OUT FOR DELIVERY')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "out_for_delivery", title: "Out for Delivery", description: "Your package will be delivered today", icon: MapPin });
    }

    if (order.status === 'DELIVERED' || statusStr.includes('DELIVERED') || statusStr.includes('COMPLETED')) {
      if (!steps.find(s => s.id === "shipped")) {
        steps.push({ id: "shipped", title: "Dispatched", description: "Handed over to delivery partner", icon: Truck });
      }
      steps.push({ id: "delivered", title: "Delivered", description: "Package arrived at destination", icon: CheckCircle2 });
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
            order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
            order.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
            order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            Status: {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Tracker */}
          <section className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-primary">Tracking</h2>
            </div>

            {order.awb && (
               <div className="mb-6 p-4 bg-secondary/10 rounded-md border border-secondary text-sm flex flex-col sm:flex-row sm:gap-6 gap-2">
                 <p><span className="text-muted-foreground mr-1">AWB:</span> <span className="font-medium tracking-wide">{order.awb}</span></p>
                 <p><span className="text-muted-foreground mr-1">Courier:</span> <span className="font-medium">{order.courier || "Pending Assignment"}</span></p>
                 <p className="sm:ml-auto"><span className="text-muted-foreground mr-1">Status:</span> <span className="font-semibold text-primary">{order.trackingStatus}</span></p>
               </div>
            )}

            {isCancelled ? (
              <div className="rounded-md bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Order Delivery Cancelled</h3>
                    <p className="mt-2 text-sm text-red-700">
                      This order was cancelled and will not be shipped. If a payment was made, a refund has been initiated.
                    </p>
                  </div>
                </div>
              </div>
            ) : steps.length > 0 ? (
              <div className="relative pt-4 pb-8">
                <div className="space-y-8 relative">
                  {steps.map((step, index) => {
                    const isLastStep = index === steps.length - 1;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="flex gap-4 relative">
                        {/* Connecting Line active state */}
                        {!isLastStep && (
                          <div className="absolute left-[21px] top-8 bottom-[-2rem] w-0.5 bg-primary z-0" />
                        )}
                        {/* Dotted pending line */}
                        {isLastStep && step.id !== "delivered" && (
                          <div className="absolute left-[21px] top-11 h-12 w-0.5 border-l-2 border-dashed border-zinc-300 z-0" />
                        )}
                        
                        <div className={cn(
                          "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors duration-200 border-primary",
                          isLastStep ? "bg-primary text-primary-foreground" : "text-primary"
                        )}>
                          {!isLastStep ? (
                            <CheckCircle2 className="h-6 w-6" />
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
            ) : (
                <p className="text-sm text-muted-foreground">Tracking information is unavailable for this order status.</p>
            )}
          </section>

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
