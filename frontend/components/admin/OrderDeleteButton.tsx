"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOrderAction } from "@/app/actions/admin-orders";

export default function OrderDeleteButton({ 
  orderId, 
  orderNumber 
}: { 
  orderId: string; 
  orderNumber: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteOrderAction(orderId);
    if (!res.success) {
      alert(res.error || "Failed to delete order");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
        title="Delete Order Record"
      >
        <Trash2 size={15} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">Delete Order?</h3>
              <p className="text-xs text-gray-500 font-sans mt-1">
                Are you sure you want to delete order <span className="font-mono font-bold text-gray-800">{orderNumber}</span>? This will permanently remove customer details &amp; items.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 text-xs font-medium border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {loading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
