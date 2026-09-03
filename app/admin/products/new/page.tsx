"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createProductAction } from "@/app/actions/admin-products";
import ProductImageManager from "@/components/admin/ProductImageManager";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("ACTIVE");
  const [inventory, setInventory] = useState("100");
  const [descriptionHtml, setDescriptionHtml] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("descriptionHtml", descriptionHtml);
      formData.set("imageUrls", JSON.stringify(images));
      formData.set("status", status);
      formData.set("inventory", inventory);
      
      const res = await createProductAction(formData);

      if (res.success) {
        router.push("/admin/products");
      } else {
        setError(res.error || "Failed to create product");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "A server error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 h-full pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products"
          className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>Add Product</h1>
          <p className="font-sans text-sm text-gray-500">Create a new product with custom cover and touch/hover image order.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          
          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Product Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Eshara Premium Hair Oil"
              className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Description (HTML supported) *</label>
            <RichTextEditor
              name="descriptionHtml"
              required={true}
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="<p>Describe your product benefits, ingredients, and ritual here...</p>"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Price (INR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans">₹</span>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  placeholder="2499.00"
                  className="w-full pl-8 pr-3 py-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Compare at Price (INR) <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans">₹</span>
                <input
                  type="number"
                  name="compareAtPrice"
                  min="0"
                  step="0.01"
                  placeholder="3499.00"
                  className="w-full pl-8 pr-3 py-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
                  style={{ borderColor: "rgba(26,26,26,0.15)" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">To show a discounted cutoff price, enter a value higher than the price.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none bg-white"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              >
                <option value="ACTIVE">🟢 Active (Visible in Store)</option>
                <option value="DRAFT">⚪ Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Initial Stock Inventory</label>
              <input
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="w-full p-3 border rounded-lg font-sans text-sm outline-none bg-gray-50/50"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
          </div>

          {/* Product Image Ordering Manager */}
          <div className="border-t pt-5" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <ProductImageManager images={images} onChange={setImages} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
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
            {loading ? "Saving Product…" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
