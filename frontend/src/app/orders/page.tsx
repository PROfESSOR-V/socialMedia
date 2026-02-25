"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ChevronLeft, XCircle } from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { showMessageModal } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.list();
        // sort orders by date descending
        const sorted = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sorted);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCanceling(orderId);
      const updatedOrder = await api.orders.cancel(orderId);
      
      setOrders(current => current.map(o => o.id === orderId ? { ...o, status: updatedOrder.status } : o));
      showMessageModal(
        "Order Cancelled", 
        "Your order has been successfully cancelled. If you already paid, the refund will be processed within 5-7 business days."
      );
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      showMessageModal(
        "Cancellation Failed", 
        error?.response?.data?.message || "There was a problem cancelling your order. Please try again.", 
        true
      );
    } finally {
      setCanceling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h1 className="mb-4 font-serif text-3xl font-medium">No Orders Yet</h1>
        <p className="mb-8 text-muted-foreground max-w-md">
          You haven't placed any orders. Start shopping to see your purchase history here.
        </p>
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <Link
          href="/products"
          className="flex items-center text-sm text-muted-foreground hover:text-primary w-fit"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Return to shop
        </Link>
      </div>
      
      <h1 className="mb-8 font-serif text-3xl font-medium text-primary">Your Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border bg-card p-6 shadow-sm overflow-hidden">
            <div className="mb-4 flex flex-col justify-between border-b pb-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Order #{order.id}</p>
                <p className="text-sm">
                  Placed on <span className="font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}</span>
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between sm:mt-0 sm:justify-end gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  order.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium mb-3">Items</h3>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-secondary/20 p-3 rounded-md">
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {item.quantity}
                    </span> 
                    <Link href={`/products/${item.productId}`} className="font-medium hover:underline hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground mr-2">{formatPrice(item.price)} each</span>
                    <span className="text-muted-foreground font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel Order Section */}
            {(order.status === 'PENDING' || order.status === 'PAID') && (
              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={canceling === order.id}
                  className="flex items-center gap-2"
                >
                  {canceling === order.id ? (
                    <span className="animate-pulse">Cancelling...</span>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" /> Cancel Order
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
