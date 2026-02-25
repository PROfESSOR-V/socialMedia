"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

export default function ProductCategories() {
  const { cachedProducts, cachedCategories, setCachedProducts, setCachedCategories } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<any[]>(cachedProducts || []);
  const [categories, setCategories] = useState<string[]>(cachedCategories || ["All"]);
  const [loading, setLoading] = useState(!cachedProducts || !cachedCategories);

  useEffect(() => {
    // If we already have cached data, don't fetch again
    if (cachedProducts && cachedCategories) {
      setProducts(cachedProducts);
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.get("/api/products"),
          apiClient.get("/api/categories")
        ]);
        
        const productsList = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.data || [];
        setProducts(productsList);
        setCachedProducts(productsList);

        const categoriesList = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data || [];
        const catNames = categoriesList.map((c: any) => c.name);
        // Ensure "All" is only present once and at the beginning
        const uniqueCatNames = ["All", ...Array.from(new Set<string>(catNames)).filter(name => name !== "All")];
        setCategories(uniqueCatNames);
        setCachedCategories(uniqueCatNames);
      } catch (err) {
        console.error("Failed to load products/categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cachedProducts, cachedCategories, setCachedProducts, setCachedCategories]);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category?.name === activeCategory || p.categoryId === activeCategory || p.category === activeCategory);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="flex flex-col items-center mb-12"
         >
           <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors hover:text-black",
                  activeCategory === category
                    ? "bg-black text-white rounded-md"
                    : "bg-zinc-100 text-zinc-600 rounded-md hover:bg-zinc-200"
                )}
              >
                {category}
              </button>
            ))}
           </div>
         </motion.div>

        <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="col-span-full py-20 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
               </div>
            ) : filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group cursor-pointer"
              >
                <Link href={`/products/${product.id}`} className="block h-full">
                    <div className="relative h-full bg-[#e8e8e1] overflow-hidden rounded-xl flex flex-col hover:shadow-md transition-shadow group">
                        <div className="relative aspect-[4/5] w-full bg-[#e8e8e1]">
                            {/* Main Image */}
                            <img
                            src={product.mainImage || "https://placehold.co/400x500/e8e8e1/a0a096?text=Image+Not+Found"}
                            alt={product.name}
                            className="w-full h-full object-contain p-6 transition-opacity duration-500 group-hover:opacity-0"
                            />
                            
                            {/* Hover Image - Full Coverage in Image Area */}
                            {product.hoverImage && (
                              <img
                              src={product.hoverImage}
                              alt={`${product.name} hover`}
                              className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              />
                            )}

                             {/* Sale Badge */}
                            <div className="absolute top-3 right-3 bg-zinc-900/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-30">
                                {Math.round(((product.price + 100 - product.price) / (product.price + 100)) * 100)}% OFF
                            </div>
                             <div className="absolute top-3 left-3 z-30">
                                 <button className="p-2 rounded-full bg-white/80 hover:bg-white text-zinc-900 transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                 </button>
                             </div>
                        </div>

                        <div className="p-4 text-center mt-auto bg-[#e8e8e1] relative z-20">
                            <h3 className="font-serif text-lg text-zinc-900 mb-1 group-hover:text-black/70 transition-colors">
                                {product.name}
                            </h3>
                             <p className="text-sm text-zinc-600 mb-2 font-medium">
                                Rs. {formatPrice(product.price)}
                             </p>
                        </div>
                    </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
