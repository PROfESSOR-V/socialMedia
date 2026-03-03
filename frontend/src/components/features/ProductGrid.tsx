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
  const { addToCart, user, setAuthModalOpen, cachedProducts, setCachedProducts } = useStore();
  const [products, setProducts] = useState<any[]>((cachedProducts || []).slice(0, 8));
  const [mobileCols, setMobileCols] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (cachedProducts && cachedProducts.length > 0) {
      setProducts(cachedProducts.slice(0, 8));
      return;
    }

    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get("/api/products");
        const productList = Array.isArray(data) ? data : data?.data || data?.products || [];
        const homeProducts = productList.filter((p: any) => p.showOnHomePage);
        const productsToShow = homeProducts.length > 0 ? homeProducts.slice(0, 8) : productList.slice(0, 8);
        setProducts(productsToShow);
        setCachedProducts(productList);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    
    const fetchSettings = async () => {
      try {
         const { data } = await apiClient.get("/api/settings/mobileProductsPerRow");
         if (data && data.value) setMobileCols(parseInt(data.value.toString()));
      } catch (err) {
         // silently ignore
      }
    }
    
    fetchProducts();
    fetchSettings();
  }, [cachedProducts, setCachedProducts]);

  return (
    <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${mobileCols === 2 ? 'grid-cols-2 gap-x-4 gap-y-8' : 'grid-cols-1'}`}>
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
                if (!user) {
                  setAuthModalOpen(true);
                  return;
                }
                addToCart({ ...product, image: product.mainImage || product.imageUrls?.[0] || product.imageUrl || "/assets/placeholder.png", quantity: 1 });
              }}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
          {/* Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full z-10">
                {product.discountPercentage}% OFF
            </div>
          )}
          <h3 className="font-medium text-lg text-primary">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="font-medium text-foreground flex items-center gap-2">
            {product.variants?.[0] ? (
              <>
                {(product.variants[0].discountPrice || product.discountPercentage > 0) ? (
                  <>
                    <span className="text-xl font-bold">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                        product.variants[0].discountPrice || (product.variants[0].actualPrice * (1 - (product.discountPercentage || 0) / 100))
                      )}
                    </span>
                    <span className="text-sm text-zinc-400 line-through">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.variants[0].actualPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.variants[0].actualPrice)}
                  </span>
                )}
              </>
            ) : (
              <span>Price unavailable</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
