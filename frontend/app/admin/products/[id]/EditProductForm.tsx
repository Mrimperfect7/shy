"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { updateProductAction, deleteProductAction } from "@/app/actions/admin-products";
import ProductImageManager from "@/components/admin/ProductImageManager";
import RichTextEditor from "@/components/admin/RichTextEditor";

const JEWELRY_CATEGORIES = [
  { value: "", label: "Auto-detect from title/slug" },
  { value: "earrings",  label: "Earrings / Studs / Jhumkas / Hoops" },
  { value: "necklaces", label: "Necklaces / Chokers" },
  { value: "chains",    label: "Chains (Herringbone / Cuban / Rope)" },
  { value: "pendants",  label: "Pendants / Lockets / Charms" },
  { value: "rings",     label: "Rings / Bands / Solitaires" },
  { value: "bracelets", label: "Bracelets / Bangles / Cuffs / Anklets" },
  { value: "nose_pins", label: "Nose Pins / Nath" },
  { value: "sets",      label: "Jewellery Sets / Combos" },
];

interface ProductProps {
  id: string;
  title: string;
  slug: string;
  descriptionHtml: string;
  price: number;
  compareAtPrice: number | null;
  inventory: number;
  status: string;
  imageUrls: string[];
  tryOnEnabled?: boolean;
  tryOnCategory?: string | null;
  tryOnRefUrl?: string | null;
}

export default function EditProductForm({ product }: { product: ProductProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [descriptionHtml, setDescriptionHtml] = useState(product.descriptionHtml || "");
  const [price, setPrice] = useState(product.price.toString());
  const [compareAtPrice, setCompareAtPrice] = useState(product.compareAtPrice?.toString() || "");
  const [inventory, setInventory] = useState(product.inventory.toString());
  const [status, setStatus] = useState(product.status || "ACTIVE");
  const [images, setImages] = useState<string[]>(product.imageUrls || []);
  const [tryOnEnabled, setTryOnEnabled] = useState(product.tryOnEnabled ?? false);
  const [tryOnCategory, setTryOnCategory] = useState(product.tryOnCategory || "");
  const [tryOnRefUrl, setTryOnRefUrl] = useState(product.tryOnRefUrl || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("id", product.id);
      formData.set("descriptionHtml", descriptionHtml);
      formData.set("imageUrls", JSON.stringify(images));
      formData.set("status", status);
      formData.set("inventory", inventory);
      formData.set("tryOnEnabled", tryOnEnabled ? "true" : "false");
      formData.set("tryOnCategory", tryOnCategory);
      formData.set("tryOnRefUrl", tryOnRefUrl);
      
      const res = await updateProductAction(formData);

      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      } else {
        setError(res.error || "Failed to update product");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "A server error occurred while updating product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setError(res.error || "Failed to delete product");
        setShowDeleteConfirm(false);
        setDeleting(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 h-full pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products"
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>Edit Product</h1>
            <p className="font-sans text-sm text-gray-500">Update product details, cover image, and touch/hover display image.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-sans font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />
          <span>Delete Product</span>
        </button>
      </div>

      {/* Status Alerts */}
      {saved && (
        <div className="p-4 bg-green-50 text-green-800 text-sm rounded-xl border border-green-200 flex items-center gap-2 font-sans font-medium">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          Product updated successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2 font-sans font-medium">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Product Title</label>
              <input
                type="text"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 18K PVD Gold Cuban Chain Necklace"
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">URL Slug</label>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cuban-link-chain-necklace"
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50 font-mono text-xs"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
          </div>

          {/* Status & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Publish Status</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-white"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              >
                <option value="ACTIVE">🟢 Active (Visible in Store)</option>
                <option value="DRAFT">⚪ Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Stock Inventory Units</label>
              <input
                type="number"
                name="inventory"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans">₹</span>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2499.00"
                  className="w-full pl-8 pr-3 py-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Compare at Price (INR) <span className="text-gray-400 font-normal ml-1">(Optional cutoff price)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans">₹</span>
                <input
                  type="number"
                  name="compareAtPrice"
                  min="0"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="3499.00"
                  className="w-full pl-8 pr-3 py-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Product Description (HTML supported)</label>
            <RichTextEditor
              name="descriptionHtml"
              required={true}
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="<p>Describe your product, its benefits, and rituals here...</p>"
            />
          </div>

          {/* Product Images Management with First & Touch/Hover Controls */}
          <div className="border-t pt-5" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <ProductImageManager images={images} onChange={setImages} />
          </div>
        </div>

        {/* ── AI VIRTUAL TRY-ON SETTINGS ── */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
            <div className="w-8 h-8 rounded-lg bg-[#141312] text-[#C5A059] flex items-center justify-center">
              <Sparkles size={15} />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#141312]">AI Virtual Try-On</h3>
              <p className="text-xs text-gray-500 font-sans">Allow customers to virtually try on this jewellery piece using AI</p>
            </div>
          </div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans font-medium text-gray-800">Enable AI Try-On for this product</p>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Shows the ✨ AI TRY ON button on the product page</p>
            </div>
            <button
              type="button"
              onClick={() => setTryOnEnabled((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                tryOnEnabled ? "bg-[#C5A059]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  tryOnEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {tryOnEnabled && (
            <div className="space-y-4 pt-2">
              {/* Category override */}
              <div>
                <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">
                  Jewellery Category
                  <span className="text-gray-400 font-normal ml-2">(optional — auto-detected if blank)</span>
                </label>
                <select
                  value={tryOnCategory}
                  onChange={(e) => setTryOnCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-white"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                >
                  {JEWELRY_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Try-on reference image */}
              <div>
                <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">
                  Try-On Reference Image URL
                  <span className="text-gray-400 font-normal ml-2">(optional — uses product image if blank)</span>
                </label>
                <input
                  type="url"
                  value={tryOnRefUrl}
                  onChange={(e) => setTryOnRefUrl(e.target.value)}
                  placeholder="https://cdn.example.com/clean-bg-jewellery.png"
                  className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50 font-mono text-xs"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                />
                <p className="text-[11px] text-gray-400 font-sans mt-1">
                  💡 For best results: use a high-resolution image on a clean/transparent background showing only the jewellery piece.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 text-sm font-sans border rounded-lg hover:bg-gray-50 bg-white"
            style={{ borderColor: "rgba(26,26,26,0.2)" }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 text-sm font-sans font-semibold rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
            style={{ background: "var(--forest)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving Changes..." : "Save Product Changes"}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            
            <div className="text-center">
              <h3 className="font-serif text-xl mb-1 text-gray-900">Delete Product?</h3>
              <p className="font-sans text-sm text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{product.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border rounded-lg font-sans text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-sans text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
