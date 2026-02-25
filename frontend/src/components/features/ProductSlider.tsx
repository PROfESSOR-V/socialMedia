"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiClient from "@/lib/apiClient";

export default function ProductSlider() {
  const { addToCart, token, setAuthModalOpen } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get("/api/products");
        const productList = Array.isArray(data) ? data : data?.data || data?.products || [];
        setProducts(productList.slice(0, 8)); // Show first 8 products
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-2 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Curated For You
          </span>
          <h2 className="font-serif text-3xl font-medium text-primary sm:text-4xl">
            Best Sellers
          </h2>
        </motion.div>

        <div className="no-scrollbar flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="min-w-[280px] max-w-[320px] flex-none snap-start group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white mb-4">
                <Image
                  src={product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Button
                  size="icon"
                  className="absolute bottom-4 right-4 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 rounded-full shadow-lg"
                  onClick={() => {
                    if (!token) {
                      setAuthModalOpen(true);
                      return;
                    }
                    addToCart({ ...product, image: product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png", quantity: 1 });
                  }}
                >
                  <ShoppingBag className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium text-lg text-primary">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {product.description}
              </p>
              <p className="font-medium text-foreground">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
