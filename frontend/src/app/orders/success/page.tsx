"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useStore();
  const [orderStatus, setOrderStatus] = useState<string>("LOADING");

  useEffect(() => {
    if (orderId) {
      const checkStatus = async () => {
        try {
          const order = await api.orders.get(orderId);
          setOrderStatus(order.status);
          if (order.status === "PAID") {
            clearCart();
          }
        } catch (error) {
           console.error("Failed to fetch order status", error);
           setOrderStatus("ERROR");
        }
      };
      checkStatus();
    } else {
      setOrderStatus("ERROR");
    }
  }, [orderId, clearCart]);

  if (orderStatus === "LOADING") {
    return <div className="flex min-h-[60vh] items-center justify-center">Checking payment status...</div>;
  }

  const isSuccess = orderStatus === "PAID";
  const isPending = orderStatus === "PENDING" || orderStatus === "CREATED";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center">
      {isSuccess ? (
        <CheckCircle2 className="mb-6 h-24 w-24 text-green-500" />
      ) : isPending ? (
        <Clock className="mb-6 h-24 w-24 text-yellow-500" />
      ) : (
        <XCircle className="mb-6 h-24 w-24 text-red-500" />
      )}
      
      <h1 className="mb-4 font-serif text-4xl font-medium text-primary">
        {isSuccess ? "Payment Successful!" : isPending ? "Payment Pending" : "Payment Incomplete"}
      </h1>
      <p className="mb-2 text-lg text-muted-foreground">
        {isSuccess 
          ? "Thank you for your purchase. Your order has been placed." 
          : isPending 
            ? "Your payment is currently processing. It may take a few minutes to confirm." 
            : "Your payment was not completed or failed. You can try again from the checkout or orders page."}
      </p>

      {orderId && (
        <p className="mb-8 text-sm text-muted-foreground">
          Order Reference: <span className="font-mono">{orderId}</span>
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row justify-center mt-6">
        <Link href="/orders">
          <Button size="lg" variant={isSuccess ? "default" : "outline"} className="w-full sm:w-auto">View My Orders</Button>
        </Link>
        {!isSuccess && (
           <Link href="/checkout">
              <Button size="lg" variant="default" className="w-full sm:w-auto">Return to Checkout</Button>
           </Link>
        )}
        <Link href="/products">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
