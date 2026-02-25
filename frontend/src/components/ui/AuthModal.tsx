"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, X } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAuthModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:p-8"
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="mb-5 rounded-full bg-zinc-50 p-4 text-zinc-900 border border-zinc-100 shadow-sm">
                <UserCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-medium text-zinc-900">
                Sign In Required
              </h2>
              <p className="mb-8 text-sm text-zinc-500 max-w-xs leading-relaxed">
                Please log in or create an account to start shopping and adding items to your cart.
              </p>
              
              <div className="flex w-full flex-col gap-3">
                <Button
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 text-sm font-semibold shadow-md transition-all uppercase tracking-widest"
                  onClick={() => {
                    setAuthModalOpen(false);
                    router.push("/login");
                  }}
                >
                  Log In To Continue
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl h-12 text-sm font-semibold transition-all uppercase tracking-widest"
                  onClick={() => setAuthModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
