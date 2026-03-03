"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/apiClient";

const fallbackProduct = {
  id: "fallback-serum",
  name: "Vitamin C Face Serum",
  category: "Face Serum",
  price: 599,
  mainImage: "/assets/1000334016.png",
};

export default function TestimonialProduct() {
  const [product, setProduct] = useState<any>(fallbackProduct);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await apiClient.get("/api/products");
        const productList = Array.isArray(data) ? data : data?.data || data?.products || [];
        // Try to find a serum, or just take the first product
        const serum = productList.find((p: any) => p.category?.toLowerCase().includes('serum') || p.categoryId === 'Face Serum') || productList[0];
        if (serum) {
            setProduct(serum);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };
    fetchProduct();
  }, []);

  return (
    <section className="py-24 bg-[#f2f2ef] overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Separated Cards (Centered Top) */}
        <div className="flex justify-center gap-6 mb-16 relative h-24 items-center">
            {/* First Card: Vitamin C Serum */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-2 shadow-sm rounded-xl transform rotate-[-6deg]"
            >
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden">
                    <Image 
                        src="/assets/1000334016.png" 
                        alt="Vitamin C Serum" 
                        fill 
                        className="object-cover"
                    />
                </div>
            </motion.div>

            {/* Second Card: Decorative/Texture */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-2 shadow-md rounded-xl transform rotate-[6deg]"
            >
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden">
                    <Image 
                        src="/assets/1000334136.png" 
                        alt="Texture" 
                        fill 
                        className="object-cover"
                    />
                </div>
            </motion.div>
        </div>

        {/* Testimonial Text */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl text-zinc-900 leading-normal mb-8 tracking-wide"
          >
            It feels <span className="italic">healthier, smoother & more radiant</span> than ever. 
            I love knowing I’m using something natural and effective!
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-1 text-zinc-900">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>
            <p className="font-serif text-lg font-medium text-zinc-900">Vipul Agarwal</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Verified Buyer</p>
          </motion.div>
        </div>

        {/* Product Showcase */}
        <div className="relative max-w-5xl mx-auto flex flex-col items-center">
             {/* Main Product Image */}
             <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-2xl flex flex-col lg:block items-center"
             >
                <div className="relative aspect-[4/3] w-full max-h-[600px] z-10">
                    <Image 
                        src="/assets/1000334011.png" 
                        alt="Featured Product Collection" 
                        fill 
                        className="object-contain"
                    />
                </div>

                {/* Specific Shadow below the image (not a box shadow) */}
                 <div className="absolute bottom-[20%] lg:bottom-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[10%] bg-black/20 blur-3xl rounded-[100%] scale-x-125 z-0" />

                {/* Hotspot / Product Card - Mobile (Static Below) & Desktop (Floating) */}
                <div className="relative lg:absolute lg:top-[50%] lg:left-[30%] z-30 mt-8 lg:mt-0">
                     <div className="relative group">
                        {/* Black Dot (Desktop Only) */}
                        <div className="hidden lg:block w-3 h-3 bg-zinc-900 rounded-full cursor-pointer shadow-lg ring-2 ring-white animate-pulse group-hover:animate-none transition-all" />
                        
                        {/* Product Card Tooltip */}
                        <div className="lg:absolute lg:bottom-full lg:left-1/2 lg:-translate-x-1/2 lg:mb-4 w-64 bg-white p-3 rounded-lg shadow-xl lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible transition-all duration-300 transform lg:translate-y-2 lg:group-hover:translate-y-0 z-50">
                            <div className="flex gap-3 items-start">
                                <div className="relative w-12 h-16 bg-zinc-50 rounded-sm overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png"}
                                        alt={product.name}
                                        fill
                                        className="object-contain p-1"
                                     />
                                     <div className="absolute top-0.5 left-0.5 bg-zinc-900 text-white text-[6px] px-1 rounded-sm font-bold">
                                        50% OFF
                                     </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] text-zinc-500 font-medium uppercase mb-0.5">{product.category || 'Product'}</p>
                                    <h4 className="font-serif text-xs text-zinc-900 leading-tight mb-1">{product.name}</h4>
                                    <p className="text-[10px] font-medium text-zinc-900 mb-1">
                                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
                                    </p>
                                    <Link href={`/products/${product.id}`} className="flex items-center text-[9px] font-bold uppercase tracking-wider text-black hover:underline">
                                        View Product <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
             </motion.div>
        </div>

      </div>
    </section>
  );
}
