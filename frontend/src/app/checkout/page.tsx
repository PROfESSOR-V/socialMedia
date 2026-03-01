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
  const { cart, clearCart, showMessageModal } = useStore();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    name: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.user.profile.get();
        if (data) {
          setProfile(data);
          if (data.mobileNumber) setMobileNumber(data.mobileNumber);
          if (!data.addresses || data.addresses.length === 0) {
            setIsAddingNewAddress(true);
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 0. Update Profile if needed
      if ((mobileNumber && mobileNumber !== profile?.mobileNumber) || isAddingNewAddress) {
        let updatedAddresses = profile?.addresses || [];
        if (isAddingNewAddress) {
          updatedAddresses = [...updatedAddresses, newAddress];
        }
        await api.user.profile.update({
          mobileNumber,
          addresses: updatedAddresses
        });
      }
      // 1. Create order from cart && Get Cashfree Session
      const orderResponse = await api.orders.createFromCart();
      const orderId = orderResponse?.id || orderResponse?._id;
      
      // 2. Create Payment Intent (Cashfree Order)
      if (orderId) {
        const returnUrl = window.location.origin + "/orders/success";
        const paymentRes = await api.payments.createIntent(orderId, "CASHFREE", returnUrl);
        
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
      showMessageModal("Payment Failed", errorMsg || "Failed to place order. Check your network or try again.", true);
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
    <div className="flex flex-col-reverse lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* Left Column: Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center px-4 py-8 lg:py-12 sm:px-6 lg:px-8 xl:pr-24"
      >
        <div className="mb-6 lg:mb-8 hidden lg:block">
          <Link
            href="/products"
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Return to shop
          </Link>
        </div>

        <h1 className="mb-6 lg:mb-8 font-serif text-3xl font-medium text-primary hidden lg:block">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-medium">Contact Information</h2>
            <div className="space-y-4">
              <Input type="tel" value={profile?.mobileNumber || mobileNumber} disabled placeholder="Mobile Number" />
              <Input 
                type="email" 
                placeholder="Email (Optional)" 
                value={profile?.email || ""}
                disabled
              />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-medium">Shipping Address</h2>
               {profile?.addresses?.length > 0 && (
                 <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}>
                   {isAddingNewAddress ? "Cancel" : "Add New +"}
                 </Button>
               )}
            </div>

            {profile?.addresses?.length > 0 && !isAddingNewAddress ? (
              <div className="space-y-3">
                {profile.addresses.map((addr: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${selectedAddressIndex === idx ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => setSelectedAddressIndex(idx)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{addr.name}</span>
                      <span className="text-sm text-muted-foreground">{addr.phoneNumber}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}</p>
                    <p className="text-sm text-muted-foreground">{addr.state} - {addr.zip}, {addr.country}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input name="name" value={newAddress.name} onChange={handleAddressChange} className="sm:col-span-2" placeholder="Full name" required />
                <Input name="phoneNumber" value={newAddress.phoneNumber} onChange={handleAddressChange} className="sm:col-span-2" placeholder="Phone Number" required />
                <Input name="street" value={newAddress.street} onChange={handleAddressChange} className="sm:col-span-2" placeholder="Street Address" required />
                <Input name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="City" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="State" required />
                  <Input name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="ZIP code" required />
                </div>
                <Input name="country" value={newAddress.country} onChange={handleAddressChange} className="sm:col-span-2" placeholder="Country" required />
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium">Payment Details</h2>
            <div className="rounded-md border p-4 text-sm text-muted-foreground bg-secondary/20">
              <Lock className="mb-2 h-4 w-4" />
              You will be redirected securely to Cashfree Payments.
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full" disabled={isProcessing || loadingProfile}>
            {isProcessing ? "Processing..." : `Pay ${formatPrice(total)}`}
          </Button>
        </form>
      </motion.div>

      {/* Right Column: Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-secondary/30 px-4 pt-24 pb-12 lg:py-12 sm:px-6 lg:px-8 xl:pl-24"
      >
        <div className="lg:sticky lg:top-24">
          {/* Added mobile "Return to shop" header block in Summary so it rests cleanly at the top above the breakdown */}
          <div className="mb-6 block lg:hidden">
            <Link
              href="/products"
              className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Return to shop
            </Link>
            <h1 className="font-serif text-3xl font-medium text-primary">Checkout</h1>
          </div>

          <h2 className="mb-6 lg:mb-8 font-serif text-2xl font-medium text-primary">
            Order Summary
          </h2>
          <div className="space-y-4 lg:space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-zinc-100 items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#e8e8e1]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white shadow-md z-10">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <h3 className="text-sm font-semibold text-zinc-900 leading-tight mb-1">
                    {item.name} {item.variantName && <span className="text-zinc-500 font-normal text-xs ml-1">({item.variantName})</span>}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-2">
                    {formatPrice(item.price)} each
                  </p>
                </div>
                <div className="text-right flex flex-col justify-center shrink-0">
                  <p className="font-medium text-zinc-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t pt-8 border-black/10">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-primary">Free</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-4 text-lg font-medium">
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
