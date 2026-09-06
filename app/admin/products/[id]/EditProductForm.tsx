"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateProductAction, deleteProductAction } from "@/app/actions/admin-products";
import ProductImageManager from "@/components/admin/ProductImageManager";
import RichTextEditor from "@/components/admin/RichTextEditor";

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
