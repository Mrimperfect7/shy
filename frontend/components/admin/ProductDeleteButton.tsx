"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProductAction } from "@/app/actions/admin-products";

export default function ProductDeleteButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await deleteProductAction(productId);
      if (res.success) {
        setIsOpen(false);
      } else {
        setError(res.error || "Failed to delete product");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
        title="Delete Product"
      >
        <Trash2 size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl mb-1 text-gray-900">Delete Product?</h3>
              <p className="font-sans text-sm text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{productTitle}"</span>? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 border rounded-lg font-sans text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-sans text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
