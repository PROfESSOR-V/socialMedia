"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Search, ShoppingBag, User, Heart, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuVariants = {
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: "0%",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const linkVariants = {
  closed: { x: -20, opacity: 0 },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    },
  }),
};

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useStore();
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Shop", href: "/products" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm lg:hidden"
          />

          {/* Menu Drawer */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <span className="font-serif text-2xl font-medium tracking-tight">AÚRELYÑ</span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-zinc-500 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-4">
                {links.map((link, i) => (
                  <motion.div
                    key={link.name}
                    custom={i}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between text-lg font-medium text-zinc-800 py-2 border-b border-transparent hover:border-zinc-100 transition-colors"
                    >
                      {link.name}
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Link 
                  href={user ? (user.role === "ADMIN" ? "/admin" : "/profile") : "/login"}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-zinc-100 text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  <User className="w-4 h-4" /> {user ? "Account" : "Sign In"}
                </Link>
                <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-zinc-100 text-sm font-medium hover:bg-zinc-200 transition-colors">
                  <Heart className="w-4 h-4" /> Wishlist
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50">
              <p className="text-xs text-zinc-400 text-center">
                © 2024 AÚRELYÑ. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
