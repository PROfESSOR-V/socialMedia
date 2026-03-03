"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, User, Heart, Globe, Menu, Package, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import MobileMenu from "./MobileMenu";
import apiClient from "@/lib/apiClient";

export default function Header() {
  const { toggleCart, cart, user } = useStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  // Random 2 products for the menu
  const [randomProducts, setRandomProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Scroll Logic
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get("/api/products");
        const productList = Array.isArray(data) ? data : data?.data || data?.products || [];
        const shuffled = [...productList].sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 2));
      } catch (err) {
        console.error("Failed to fetch products for header", err);
      }
    };
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get("/api/categories");
        const catList = Array.isArray(data) ? data : data?.data || [];
        setCategories(catList.map((c: any) => c.name).filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch categories for header", err);
      }
    };
    fetchProducts();
    fetchCategories();

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < 10) {
            setIsVisible(true);
        } else if (currentScrollY > lastScrollY) {
            setIsVisible(false); // Scrolling down
        } else {
            setIsVisible(true); // Scrolling up
        }
        
        setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div 
        className={cn(
            "fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4 sm:px-8 transition-transform duration-500",
            isVisible ? "translate-y-0" : "-translate-y-[150%]"
        )}
    >
      <header
        className="w-full h-16 md:h-20 bg-white rounded-2xl shadow-sm border border-black/5 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 relative z-50"
      >
        {/* Left Nav */}
        <nav className="hidden lg:flex items-center gap-6 h-full">
          <div className="relative group h-full flex items-center">
            <button className="text-sm font-medium text-foreground hover:text-black/70 transition-colors flex items-center gap-1 py-4 cursor-default">
              Shop <span className="text-[10px]">+</span>
            </button>
            
            {/* Hover Menu - Refined Layout */}
            <div className="absolute top-full left-0 pt-3 z-50 pointer-events-none group-hover:pointer-events-auto">
              <div className="w-[800px] bg-white rounded-xl shadow-xl border border-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden flex p-8 gap-8">
                
                {/* Left Sidebar */}
                <div className="w-1/4 flex flex-col pt-2 border-r border-zinc-100 pr-6">
                    <h4 className="font-serif text-2xl italic mb-6 text-zinc-900">Shop</h4>
                    <nav className="flex flex-col space-y-4">
                         <Link href="/products" className="text-[15px] font-medium text-zinc-600 hover:text-black transition-colors block">
                             All Products
                         </Link>
                         <Link href="/products?category=Face Serum" className="text-[15px] font-medium text-zinc-600 hover:text-black transition-colors block">
                             Face Serum
                         </Link>
                         <Link href="/products?category=Cream" className="text-[15px] font-medium text-zinc-600 hover:text-black transition-colors block">
                             Cream
                         </Link>
                         <Link href="/products?category=Body Lotion" className="text-[15px] font-medium text-zinc-600 hover:text-black transition-colors block">
                             Body Lotion
                         </Link>
                    </nav>
                </div>

                {/* Right Product Grid */}
                <div className="w-3/4 grid grid-cols-2 gap-6 bg-zinc-50/50 p-6 rounded-lg">
                    {randomProducts.map((product) => (
                        <Link key={product.id} href={`/products/${product.id}`} className="group block relative">
                            <div className="bg-[#f2f2ef] rounded-xl overflow-hidden aspect-[3/4] mb-3 relative">
                                <div className="absolute top-3 right-3 bg-zinc-800 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm z-10">
                                    50% OFF
                                </div>
                                <div className="absolute top-3 left-3 text-zinc-400 group-hover:text-red-500 transition-colors z-10">
                                     <Heart className="w-4 h-4" />
                                </div>
                                <Image 
                                    src={product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png"} 
                                    alt={product.name}
                                    fill
                                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="text-center">
                                <h5 className="font-serif text-md text-zinc-900 mb-1 truncate px-2">{product.name}</h5>
                                <p className="text-xs text-zinc-500 font-medium">
                                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Collections Dropdown */}
          <div className="relative group h-full flex items-center">
            <button className="text-sm font-medium text-foreground hover:text-black/70 transition-colors flex items-center gap-1 py-4 cursor-default">
              Collections <span className="text-[10px]">+</span>
            </button>
            
            <div className="absolute top-full left-0 pt-3 z-50 pointer-events-none group-hover:pointer-events-auto">
              <div className="w-[240px] bg-white rounded-xl shadow-xl border border-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden p-6">
                <h4 className="font-serif text-xl italic mb-4 text-zinc-900">Collections</h4>
                <nav className="flex flex-col space-y-3">
                  {categories.map((cat) => (
                    <Link 
                      key={cat} 
                      href={`/products?category=${encodeURIComponent(cat)}`} 
                      className="text-[15px] font-medium text-zinc-600 hover:text-black transition-colors block"
                    >
                      {cat}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <Link href="#" className="text-sm font-medium text-foreground hover:text-black/70 transition-colors">
            About
          </Link>
          <Link href="#" className="text-sm font-medium text-foreground hover:text-black/70 transition-colors">
            Blog
          </Link>
          <Link href="#" className="text-sm font-medium text-foreground hover:text-black/70 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Center Logo (Desktop) / Left Logo (Mobile) */}
        <Link 
          href="/" 
          className="lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 font-serif text-xl md:text-2xl font-medium tracking-tight text-black"
        >
          AÚRELYÑ
        </Link>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 text-black/80">
          <button className="hover:text-black transition-colors rounded-sm overflow-hidden hidden sm:block">
            {/* India Flag SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 150" className="w-[18px] h-auto shadow-sm">
              <rect width="225" height="150" fill="#f93"/>
              <rect width="225" height="50" y="50" fill="#fff"/>
              <rect width="225" height="50" y="100" fill="#128807"/>
              <g transform="translate(112.5,75)">
                <circle r="20" fill="#008"/>
                <circle r="17.5" fill="#fff"/>
                <circle r="3.5" fill="#008"/>
                <g id="spokes">
                  <path d="M0,0 L0,-17.5 L1,-17.5 Z" fill="#008" />
                  <g id="s4">
                    <use href="#spokes" transform="rotate(15)" />
                    <use href="#spokes" transform="rotate(30)" />
                    <use href="#spokes" transform="rotate(45)" />
                    <use href="#spokes" transform="rotate(60)" />
                    <use href="#spokes" transform="rotate(75)" />
                  </g>
                  <use href="#s4" transform="rotate(90)" />
                  <use href="#s4" transform="rotate(180)" />
                  <use href="#s4" transform="rotate(270)" />
                </g>
              </g>
            </svg>
          </button>
          
          <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/profile") : "/login"} className="hover:text-black transition-colors">
            <User className="h-5 w-5" />
          </Link>
          
          <button className="hover:text-black transition-colors">
            <Search className="h-5 w-5" />
          </button>

          <button className="hover:text-black transition-colors lg:hidden">
            <Heart className="h-5 w-5" />
          </button>
          
          <Link href="/orders" className="hover:text-black transition-colors">
            <Package className="h-5 w-5" />
          </Link>

          <button onClick={toggleCart} className="relative hover:text-black transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[9px] text-white font-medium"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Mobile Menu Toggle Icon */}
          <div className="lg:hidden flex items-center ml-1">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 bg-zinc-50 border border-black/5 rounded text-zinc-800 hover:text-black hover:bg-zinc-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Place MobileMenu outside header so it can absolute-position beneath it */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
}
