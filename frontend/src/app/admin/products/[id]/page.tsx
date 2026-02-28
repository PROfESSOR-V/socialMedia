"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import apiClient from "@/lib/apiClient";
import axios from "axios";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    mainImage: "",
    hoverImage: "",
    images: "",
    benefits: "",
    ingredients: "",
    howToUse: "",
  });

  const [variants, setVariants] = useState<any[]>([]);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get(`/api/products/${id}`);
        const product = response.data?.data || response.data;
        // Populate form
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          stock: product.quantity?.toString() || product.stock?.toString() || "0",
          category: categories.find((c: any) => c.id === product.categoryId)?.name || product.categoryId || "",
          mainImage: product.mainImage || "",
          hoverImage: product.hoverImage || "",
          images: Array.isArray(product.images) ? product.images.join(", ") : "",
          benefits: product.benefits || "",
          ingredients: product.ingredients || "",
          howToUse: product.howToUse || "",
        });
        
        if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
          setVariants(product.variants);
        } else {
          setVariants([{ name: "", price: "", stock: "" }]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setInitialLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const uploadImage = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const { data } = await apiClient.post("/api/upload", uploadData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let mainImageUrl = formData.mainImage;
      if (mainImageFile) mainImageUrl = await uploadImage(mainImageFile);

      let hoverImageUrl = formData.hoverImage;
      if (hoverImageFile) hoverImageUrl = await uploadImage(hoverImageFile);

      let imageUrls: string[] = formData.images ? formData.images.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(imageFiles.map(file => uploadImage(file)));
      }

      const parsedVariants = variants
        .filter(v => typeof v.name === 'string' && v.name.trim() !== '')
        .map(v => ({
          name: v.name,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0
        }));

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
        variants: parsedVariants.length > 0 ? parsedVariants : null
      };

      await apiClient.put(`/api/products/update/${id}`, payload);
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Edit Product</h1>
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
            Save Changes
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
               {formData.mainImage && (
                 <div className="relative mb-4">
                   <img src={formData.mainImage} className="w-32 h-32 object-contain rounded-lg bg-white border border-zinc-100" />
                 </div>
               )}
               <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="mainImage">
                    Update Main Image
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
               
               {formData.hoverImage && (
                 <div className="relative mb-4 mt-6">
                   <img src={formData.hoverImage} className="w-20 h-20 object-contain rounded-lg bg-white border border-zinc-100" />
                 </div>
               )}
               <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5" htmlFor="hoverImage">
                    Update Hover Image
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
                    Update Carousel Images (Will replace existing)
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

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-zinc-900">Product Variants</h2>
              <button 
                type="button" 
                onClick={addVariant}
                className="text-xs flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">Add different sizes, volumes, or types (e.g. 50ml, 100ml). If a user selects a variant, its price and stock will be used instead of the base product values.</p>
            
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="flex gap-3 items-start p-3 border border-zinc-100 bg-zinc-50/50 rounded-xl relative">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Variant Name (e.g., Size)</label>
                      <input
                        type="text"
                        value={variant.name || ''}
                        onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                        placeholder="e.g. 50ml"
                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Price</label>
                        <input
                          type="number"
                          value={variant.price || ''}
                          onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                          placeholder="Price"
                          className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-700 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock || ''}
                          onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                          placeholder="Stock qty"
                          className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="mt-6 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
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
