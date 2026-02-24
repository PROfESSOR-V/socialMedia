import ProductCategories from "@/components/features/ProductCategories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products - AÚRELYÑ",
  description: "Explore our collection of premium natural skincare.",
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-32">
      <div className="mb-0 text-center">
        <h1 className="font-serif text-4xl font-medium text-primary sm:text-5xl">
          All Products
        </h1>
        <p className="mt-4 text-muted-foreground">
          Discover nature's finest ingredients for your skin.
        </p>
      </div>
      <ProductCategories />
    </div>
  );
}
