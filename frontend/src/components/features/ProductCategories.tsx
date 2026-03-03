"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import apiClient from "@/lib/apiClient";
import { Loader2 } from "lucide-react";

export default function ProductCategories({ initialProducts = [], initialCategories = ["All"] }: { initialProducts?: any[], initialCategories?: string[] }) {
  const { cachedProducts, cachedCategories, setCachedProducts, setCachedCategories } = useStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<any[]>(initialProducts.length > 0 ? initialProducts : (cachedProducts || []));
  const [categories, setCategories] = useState<string[]>(initialCategories.length > 1 ? initialCategories : (cachedCategories || ["All"]));
  const [loading, setLoading] = useState(products.length === 0);
  const [mobileCols, setMobileCols] = useState(1);

  useEffect(() => {
    // Fetch mobile layout setting
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get("/api/settings/mobileProductsPerRow");
        if (data && data.value) setMobileCols(parseInt(data.value.toString()));
      } catch (err) {
        // silently ignore - default to 1 col
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    // If we already have cached data, don't fetch again
    // If we already have cached data or Server Props, don't fetch again
    if ((cachedProducts && cachedCategories) || initialProducts.length > 0) {
      if (!initialProducts.length && cachedProducts) setProducts(cachedProducts);
      if (initialCategories.length <= 1 && cachedCategories) setCategories(cachedCategories);
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
    <section className="pt-8 pb-16 md:pt-12 md:pb-24">
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

        <motion.div layout className={`grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4 mx-auto ${mobileCols === 2 ? 'grid-cols-2 gap-x-3' : 'grid-cols-1 max-w-[340px] sm:max-w-none'}`}>
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
                    <div className="relative h-full bg-[#e8e8e1] overflow-hidden rounded-[20px] flex flex-col hover:shadow-md transition-shadow group">
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
                             {product.discountPercentage > 0 && (
                                <div className="absolute top-3 right-3 bg-zinc-900/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded z-30">
                                    {product.discountPercentage}% OFF
                                </div>
                             )}
                             <div className="absolute top-3 left-3 z-30">
                                 <button className="p-2 rounded-full bg-white/80 hover:bg-white text-zinc-900 transition-colors">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                 </button>
                             </div>
                        </div>

                        <div className="p-4 md:p-5 text-center mt-auto bg-[#e8e8e1] relative z-20">
                            <h3 className="font-serif text-base md:text-lg text-zinc-900 mb-1 group-hover:text-black/70 transition-colors leading-tight line-clamp-2">
                                {product.name}
                            </h3>
                             <div className="flex items-center justify-center gap-2 mb-2 font-medium">
                                {product.variants?.[0]?.actualPrice && product.variants?.[0]?.actualPrice > (product.variants?.[0]?.discountPrice || 0) && (
                                   <span className="text-sm text-zinc-400 line-through">
                                      Rs. {formatPrice(product.variants[0].actualPrice)}
                                   </span>
                                )}
                                <span className="text-sm md:text-sm text-zinc-900">
                                   Rs. {formatPrice(product.variants?.[0]?.discountPrice || product.price || 0)}
                                </span>
                             </div>
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
