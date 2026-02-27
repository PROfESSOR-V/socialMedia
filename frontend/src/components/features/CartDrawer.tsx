"use client";

import { useStore } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } =
    useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background p-6 shadow-xl sm:w-[400px]"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-serif text-2xl font-medium">Your Bag</h2>
                <Button variant="ghost" size="icon" onClick={toggleCart}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-6">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                    <p>Your bag is empty.</p>
                    <Button variant="link" onClick={toggleCart}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-secondary/50">
                          {/* Use a placeholder if image fails or is missing */}
                          <Image
                            src={item.image || "/placeholder.png"} 
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-primary">
                              {item.name} {item.variantName && <span className="text-muted-foreground font-normal text-sm block">{item.variantName}</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-md border p-1">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-1 hover:text-primary disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-4 text-center text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1 hover:text-primary"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto px-2 text-xs text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="mb-4 flex items-center justify-between text-lg font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Link href="/checkout" onClick={toggleCart}>
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
