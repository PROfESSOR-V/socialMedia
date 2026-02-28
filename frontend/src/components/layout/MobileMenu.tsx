"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useStore();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={menuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="absolute top-[84px] left-0 right-0 bg-white rounded-xl shadow-xl border border-black/5 z-40 overflow-hidden lg:hidden"
        >
          <div className="flex flex-col py-2">
            <Link 
              href="/" 
              onClick={onClose}
              className="px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors border-b border-zinc-50"
            >
              Home
            </Link>
            
            <Link 
              href="/about" 
              onClick={onClose}
              className="px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors border-b border-zinc-50"
            >
              About
            </Link>

            {/* Shop Accordion */}
            <div className="border-b border-zinc-50">
              <button 
                onClick={() => toggleSection('shop')}
                className="w-full flex items-center justify-between px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Shop
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection === 'shop' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSection === 'shop' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-zinc-50/50"
                  >
                    <div className="flex flex-col py-2 px-8">
                      <Link href="/products" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">All Products</Link>
                      <Link href="/products?category=Face Serum" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Face Serum</Link>
                      <Link href="/products?category=Cream" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Cream</Link>
                      <Link href="/products?category=Body Lotion" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Body Lotion</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account Accordion */}
            <div className="border-b border-zinc-50">
              <button 
                onClick={() => toggleSection('account')}
                className="w-full flex items-center justify-between px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Account
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection === 'account' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSection === 'account' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-zinc-50/50"
                  >
                    <div className="flex flex-col py-2 px-8">
                      {user ? (
                        <>
                          <Link href={user.role === "ADMIN" ? "/admin" : "/profile"} onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Profile</Link>
                          <Link href="/orders" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Orders</Link>
                        </>
                      ) : (
                        <>
                          <Link href="/login" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Login</Link>
                          <Link href="/signup" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">Sign Up</Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Support Accordion */}
            <div className="border-b border-zinc-50">
              <button 
                onClick={() => toggleSection('support')}
                className="w-full flex items-center justify-between px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Support
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openSection === 'support' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openSection === 'support' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-zinc-50/50"
                  >
                    <div className="flex flex-col py-2 px-8">
                      <button 
                        onClick={() => {
                          onClose();
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }} 
                        className="py-3 text-sm text-zinc-600 text-left border-b border-zinc-100 last:border-0 hover:text-black"
                      >
                        Contact
                      </button>
                      <Link href="/faq" onClick={onClose} className="py-3 text-sm text-zinc-600 border-b border-zinc-100 last:border-0 hover:text-black">FAQ</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              href="/blog" 
              onClick={onClose}
              className="px-6 py-4 text-[15px] font-medium text-zinc-800 hover:bg-zinc-50 transition-colors"
            >
              Blog
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
