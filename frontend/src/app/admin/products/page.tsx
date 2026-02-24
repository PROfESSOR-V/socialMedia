"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Package, Power, PowerOff } from "lucide-react";
import apiClient from "@/lib/apiClient";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get("/api/products/all");
        // Depending on backend structure, maybe data is data.data or similar.
        // Let's assume the array is direct, or nested in 'products' field
        const productList = Array.isArray(data) ? data : data?.data || data?.products || [];
        setProducts(productList);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your store's inventory and catalog.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-shadow"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                    <td className={`px-6 py-4 ${!product.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden relative shrink-0">
                          {product.imageUrls && product.imageUrls.length > 0 ? (
                            <Image 
                              src={product.imageUrls[0]} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : product.imageUrl ? (
                            <Image 
                              src={product.imageUrl} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{product.name}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{product.description || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-900 font-medium">
                      ₹{product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (product.stock || 10) > 5 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {(product.stock || 10)} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to ${product.isActive ? 'disable' : 'enable'} this product?`)) {
                              try {
                                await apiClient.put(`/api/products/disable/${product.id}`);
                                setProducts(products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
                              } catch (err) {
                                console.error(err);
                                alert("Failed to toggle product status");
                              }
                            }
                          }}
                          className={`p-2 rounded-lg transition-colors ${product.isActive ? 'text-zinc-400 hover:text-orange-600 hover:bg-orange-50' : 'text-orange-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={product.isActive ? "Disable (Hide from Store)" : "Enable (Show on Store)"}
                        >
                          {product.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={async () => {
                              if (confirm("Are you sure you want to permanently delete this product?")) {
                                try {
                                    await apiClient.delete(`/api/products/del/${product.id}`);
                                    setProducts(products.filter(p => p.id !== product.id));
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to delete product");
                                }
                              }
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
