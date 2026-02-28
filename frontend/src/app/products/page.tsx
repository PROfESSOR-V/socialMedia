import ProductCategories from "@/components/features/ProductCategories";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products - AÚRELYÑ",
  description: "Explore our collection of premium natural skincare.",
};

async function getProductsData() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${backendUrl}/api/products`, { cache: 'no-store' }),
      fetch(`${backendUrl}/api/categories`, { cache: 'no-store' })
    ]);
    
    const pData = await productsRes.json();
    const cData = await categoriesRes.json();
    
    const productsList = Array.isArray(pData) ? pData : pData?.data || [];
    const categoriesList = Array.isArray(cData) ? cData : cData?.data || [];
    
    const catNames = categoriesList.map((c: any) => c.name);
    const uniqueCatNames = ["All", ...Array.from(new Set<string>(catNames)).filter(name => name !== "All")];
    
    return { products: productsList, categories: uniqueCatNames };
  } catch (error) {
    console.error("SSR Fetch failed", error);
    return { products: [], categories: ["All"] };
  }
}

export default async function ProductsPage() {
  const { products, categories } = await getProductsData();

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
      <ProductCategories initialProducts={products} initialCategories={categories} />
    </div>
  );
}
