"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Specific products as requested
export const productData = [
  {
    id: "fp1",
    name: "Vitamin C Niacinamide Face Serum 30ml",
    price: 399,
    image: "/assets/1000334017.png", 
    imageHover: "/assets/1000334105.png",
    description: "Brightening serum for radiant skin.",
  },
  {
    id: "fp2",
    name: "Retinol Night Cream 50gm",
    price: 349,
    image: "/assets/1000334107.png", 
    imageHover: "/assets/1000334111.png",
    description: "Anti-aging overnight treatment.",
  },
  {
    id: "fp3",
    name: "Hyaluronic Niacinamide Serum 30ml",
    price: 399,
    image: "/assets/1000334019.png", 
    imageHover: "/assets/1000334136.png",
    description: "Deep hydration and pore refining.",
  },
  {
    id: "fp4",
    name: "Honey & Almond Body Lotion 200ml",
    price: 299,
    image: "/assets/1000334083.png", 
    imageHover: "/assets/1000334117.png",
    description: "Nourishing body lotion.",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header removed as it will be handled by parent or ProductCategories title */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {productData.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-zinc-100"
            >
              <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden p-6"> 
                {/* 
                   Added padding (p-6) to container and object-contain to image 
                   to ensure full product is visible as requested 
                */}
                
                {/* Main Image */}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain transition-opacity duration-500 group-hover:opacity-0 p-4"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                {/* Hover Image */}
                 <Image
                  src={product.imageHover}
                  alt={`${product.name} hover`}
                  fill
                  className="object-contain absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 p-4"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full z-10">
                    Sale
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-sm text-zinc-900 mb-1 leading-tight flex-grow">
                    {product.name}
                </h3>
                
                {/* Rating - Static for now */}
                <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(i => (
                        <span key={i} className="text-yellow-400 text-xs">★</span>
                    ))}
                    <span className="text-xs text-zinc-400 ml-1">(5)</span>
                </div>

                <div className="mb-4">
                    <span className="font-bold text-zinc-900 block">
                        Rs. {product.price}.00
                    </span>
                </div>

                {/* Button moved to bottom content area, always visible */}
                <div className="mt-auto">
                    <Button
                        asChild
                        className="w-full bg-black text-white hover:bg-zinc-800 shadow-sm text-xs uppercase tracking-wider"
                    >
                        <Link href={`/products/${product.id}`}>
                            View Product
                        </Link>
                    </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
