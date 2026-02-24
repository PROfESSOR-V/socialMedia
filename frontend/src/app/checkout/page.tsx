"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import { ChevronLeft, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. Create order from cart && Get Cashfree Session
      const orderResponse = await api.orders.createFromCart();
      const orderId = orderResponse?.id || orderResponse?._id;
      
      // 2. Create Payment Intent (Cashfree Order)
      if (orderId) {
        const paymentRes = await api.payments.createIntent(orderId, "CASHFREE");
        
        // Extract payment_session_id from the backend map response
        // Expected from Backend: { message, data: { payment_session_id: "...", order_id: "..." } }
        const paymentSessionId = paymentRes?.payment_session_id || paymentRes?.data?.payment_session_id;

        if (paymentSessionId) {
             // 3. Open Cashfree Checkout Overlay
             // @ts-ignore
             const cashfree = Cashfree({
                 mode: "production" // Change to production later
             });
             
             cashfree.checkout({
                 paymentSessionId: paymentSessionId
             });
             
             // Note: Upon success/failure, the merchant's redirect URL or webhook will be triggered.
             // We do NOT clear cart locally here anymore, wait for webhook or redirect state.
             return;
        } else {
            throw new Error("Could not retrieve payment session ID from backend.");
        }
      }

    } catch (error: any) {
      console.error(error);
      const resData = error?.response?.data;
      const errorMsg = typeof resData === 'string' ? resData : (resData?.message || resData?.error || error.message);
      alert(errorMsg || "Failed to place order. Check network.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="mb-4 font-serif text-3xl font-medium">Your cart is empty</h1>
        <p className="mb-8 text-muted-foreground">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
    <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 xl:pr-24"
      >
        <div className="mb-8">
          <Link
            href="/products"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Return to shop
          </Link>
        </div>

        <h1 className="mb-8 font-serif text-3xl font-medium text-primary">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-medium">Contact Information</h2>
            <Input type="email" placeholder="Email address" required />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="First name" required />
              <Input placeholder="Last name" required />
              <Input className="sm:col-span-2" placeholder="Address" required />
              <Input placeholder="City" required />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="State" required />
                <Input placeholder="ZIP code" required />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">Payment Details</h2>
            <div className="rounded-md border p-4 text-sm text-muted-foreground bg-secondary/20">
              <Lock className="mb-2 h-4 w-4" />
              You will be redirected securely to Cashfree Payments.
            </div>
            {/* Mock Stripe Element placeholder removed */}
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : `Pay ${formatPrice(total)}`}
          </Button>
        </form>
      </motion.div>

      {/* Right Column: Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden bg-secondary/30 px-4 py-12 sm:px-6 lg:block lg:px-8 xl:pl-24"
      >
        <div className="sticky top-24">
          <h2 className="mb-8 font-serif text-2xl font-medium text-primary">
            Order Summary
          </h2>
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-white">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t pt-8">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-primary">Free</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-lg font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
