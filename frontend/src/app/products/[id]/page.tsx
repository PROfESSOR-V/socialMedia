"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Minus, Plus, Leaf, Rabbit, HeartHandshake, Truck, Info, Droplets, Loader2 } from "lucide-react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, token, setAuthModalOpen } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await apiClient.get(`/api/products/${params.id}`);
        const prod = data.data || data;
        setProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
     return (
        <div className="flex justify-center items-center py-40 min-h-screen bg-[#f9f9f9]">
           <Loader2 className="w-12 h-12 animate-spin text-zinc-400" />
        </div>
     );
  }

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!token) {
      setAuthModalOpen(true);
      return;
    }
    
    addToCart({ 
       id: product.id, 
       name: product.name, 
       price: displayPrice, 
       image: product.mainImage || "https://placehold.co/400x400/e8e8e1/a0a096?text=Image", 
       quantity,
       variantName: selectedVariant ? selectedVariant.name : undefined 
    });
  };

  const displayPrice = selectedVariant && selectedVariant.price ? selectedVariant.price : product.price;
  const displayStock = selectedVariant && selectedVariant.stock !== undefined ? selectedVariant.stock : (product.stock || product.quantity || 0);
  const isOutOfStock = displayStock < quantity;

  return (
    <div className="container mx-auto px-4 py-12 pt-32 sm:px-6 lg:px-8 bg-[#f9f9f9] min-h-screen">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 items-start">
        {/* Product Image Section */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="sticky top-24"
        >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#e8e8e1]">
              <img
                src={product.mainImage || "https://placehold.co/400x500/e8e8e1/a0a096?text=Image+Not+Found"}
                alt={product.name}
                className="w-full h-full object-contain p-8 md:p-12 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Best Seller
              </div>
            </div>
            
            {/* Thumbnail/Gallery Placeholder */}
            {(product.images?.length > 0 || product.hoverImage) && (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                   <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-black cursor-pointer bg-[#e8e8e1] shrink-0">
                      <img src={product.mainImage} alt="thumb" className="w-full h-full object-contain p-2" />
                   </div>
                   {product.hoverImage && (
                     <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer bg-[#e8e8e1] shrink-0">
                        <img src={product.hoverImage} alt="thumb hover" className="w-full h-full object-contain p-2" />
                     </div>
                   )}
                   {product.images?.map((imgUrl: string, idx: number) => (
                     <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer bg-[#e8e8e1] shrink-0">
                        <img src={imgUrl} alt={`thumb ${idx}`} className="w-full h-full object-contain p-2" />
                     </div>
                   ))}
              </div>
            )}
        </motion.div>

        {/* Product Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="mb-2 text-2xl font-bold text-zinc-900">
             {formatPrice(displayPrice)}
          </div>

          <h1 className="mb-4 font-serif text-4xl lg:text-5xl font-medium text-zinc-900 leading-tight">
            {product.name}
          </h1>

          <p className="mb-6 text-zinc-600 leading-relaxed text-lg whitespace-pre-line">
            {product.description || "It gently cleanses and nourishes, leaving your skin feeling soft, hydrated, and refreshed without stripping natural oils."}
          </p>

          {/* Type / Size Selection */}
          {product.variants && product.variants.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 text-zinc-900">Select Variant</h3>
            <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any) => (
                    <button
                        key={variant.name}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            selectedVariant?.name === variant.name
                                ? "bg-zinc-900 text-white shadow-md"
                                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                        } ${variant.stock <= 0 ? "opacity-50" : ""}`}
                    >
                        {variant.name}
                    </button>
                ))}
            </div>
          </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-zinc-100">
             <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center rounded-lg bg-zinc-100">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:text-black text-zinc-500 disabled:opacity-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:text-black text-zinc-500 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
             </div>
             
             <Button 
                size="lg" 
                disabled={isOutOfStock}
                className="w-full text-base h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all uppercase tracking-widest font-semibold disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none" 
                onClick={handleAddToCart}
             >
               {isOutOfStock ? "Out of Stock" : `Add to Cart — ${formatPrice(displayPrice * quantity)}`}
             </Button>
             
             <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500 justify-center">
                 <Truck className="w-4 h-4" />
                 <span>Free Shipping over Rs. 50</span>
                 <span className="mx-2">•</span>
                 <HeartHandshake className="w-4 h-4" />
                 <span>14 Days Returns</span>
             </div>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                  { icon: Leaf, label: "100% Natural" },
                  { icon: Rabbit, label: "Cruelty Free" },
                  { icon: Droplets, label: "Eco Friendly" },
                  { icon: Info, label: "Expert Approved" },
              ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 bg-zinc-100 rounded-xl text-center gap-2">
                       <item.icon className="w-6 h-6 text-zinc-700" />
                       <span className="text-xs font-medium text-zinc-600 max-w-[80px] leading-tight">{item.label}</span>
                  </div>
              ))}
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            <details className="group bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900 p-5 hover:bg-zinc-50 transition-colors marker:content-none select-none">
                <span className="text-lg font-serif">Details</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-zinc-600 leading-relaxed text-sm whitespace-pre-line">
                <p>
                    {product.benefits || `${product.name} is designed to meet the highest standards of clean beauty. Formulated without parabens, sulfates, or artificial fragrances. Perfect for sensitive skin types.`}
                </p>
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900 p-5 hover:bg-zinc-50 transition-colors marker:content-none select-none">
                <span className="text-lg font-serif">How to Use</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-zinc-600 leading-relaxed text-sm whitespace-pre-line">
                <p>{product.howToUse || "Apply a small amount to clean skin. Massage gently."}</p>
              </div>
            </details>

             <details className="group bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900 p-5 hover:bg-zinc-50 transition-colors marker:content-none select-none">
                <span className="text-lg font-serif">Ingredients</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-zinc-600 leading-relaxed text-sm whitespace-pre-line">
                <p>{product.ingredients || "Aqua, Glycerin, Natural Oils, Vitamin E."}</p>
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-zinc-100 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-900 p-5 hover:bg-zinc-50 transition-colors marker:content-none select-none">
                <span className="text-lg font-serif">Delivery & Returns</span>
                <span className="transition-transform duration-300 group-open:rotate-180">
                  <Plus className="h-5 w-5 text-zinc-400" />
                </span>
              </summary>
              <div className="px-5 pb-5 pt-0 text-zinc-600 leading-relaxed text-sm">
                <p>
                    Free standard delivery on orders over Rs. 50. 
                    Returns accepted within 14 days of delivery.
                </p>
              </div>
            </details>
          </div>
        </motion.div>
      </div>

      {/* FAQ / Extra Section Placeholder matching Image 3 lower part */}
      <div className="mt-20 py-12 border-t border-zinc-200">
          <h2 className="text-center font-serif text-3xl mb-12">FAQ</h2>
          <div className="max-w-3xl mx-auto space-y-4">
               <div className="bg-white p-6 rounded-xl shadow-sm">
                   <h4 className="font-semibold mb-2">What skin types are your products suitable for?</h4>
                   <p className="text-zinc-600 text-sm">Our products are formulated to be gentle and effective for all skin types, including sensitive and acne-prone skin.</p>
               </div>
          </div>
      </div>
    </div>
  );
}
