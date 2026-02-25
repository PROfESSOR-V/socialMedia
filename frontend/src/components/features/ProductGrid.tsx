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

export default function ProductGrid() {
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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="group"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/20 mb-4">
            <Image
              src={product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            
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
  );
}
