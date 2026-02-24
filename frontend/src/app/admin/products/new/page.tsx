"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import apiClient from "@/lib/apiClient";
import axios from "axios";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    benefits: "",
    ingredients: "",
    howToUse: "",
  });

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await apiClient.get("/api/categories");
        const categoryList = Array.isArray(data) ? data : data?.data || [];
        setCategories(categoryList);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    const { data } = await axios.post("https://socialmedia-0qzd.onrender.com/api/upload", formData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mainImageUrl = "";
      if (mainImageFile) mainImageUrl = await uploadImage(mainImageFile);

      let hoverImageUrl = "";
      if (hoverImageFile) hoverImageUrl = await uploadImage(hoverImageFile);

      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(imageFiles.map(file => uploadImage(file)));
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        currency: "INR",
        categoryId: categories.find(c => c.name === formData.category)?.id || "",
        mainImage: mainImageUrl,
        hoverImage: hoverImageUrl,
        images: imageUrls,
        benefits: formData.benefits,
        ingredients: formData.ingredients,
        howToUse: formData.howToUse,
      };

      await apiClient.post("/api/products/add", payload);
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Add Product</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors">
            Discard
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Product
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">General Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="name">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Radiance Face Serum"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product. HTML or Plain Text."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="benefits">
                Benefits
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows={3}
                value={formData.benefits}
                onChange={handleChange}
                placeholder="Product benefits..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="ingredients">
                Ingredients
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                rows={3}
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="Product ingredients..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="howToUse">
                How to Use
              </label>
              <textarea
                id="howToUse"
                name="howToUse"
                rows={3}
                value={formData.howToUse}
                onChange={handleChange}
                placeholder="Usage instructions..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Media</h2>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="mainImage">
                    Main Image
                  </label>
                  <input
                    type="file"
                    id="mainImage"
                    name="mainImage"
                    accept="image/*"
                    onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-black hover:file:bg-zinc-100"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="hoverImage">
                    Hover Image
                  </label>
                  <input
                    type="file"
                    id="hoverImage"
                    name="hoverImage"
                    accept="image/*"
                    onChange={(e) => setHoverImageFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-black hover:file:bg-zinc-100"
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="images">
                    Carousel Images
                  </label>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-50 file:text-black hover:file:bg-zinc-100"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Organization & Pricing */}
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Pricing</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="price">
                Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                required
                type="number"
                step="1"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Inventory</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="stock">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                required
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">Organization</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
