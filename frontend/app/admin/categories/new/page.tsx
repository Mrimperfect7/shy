"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createCategoryAction } from "@/app/actions/admin-categories";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const res = await createCategoryAction(formData);

      if (res.success) {
        router.push("/admin/categories");
      } else {
        setError(res.error || "Failed to create category");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "A server error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 h-full pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl mb-1 text-[var(--charcoal)]">Add Category</h1>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6 border-gray-200">
          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Category Name *</label>
            <input type="text" name="name" required className="w-full p-3 border rounded-lg bg-gray-50/50" />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">Image URL</label>
            <input type="text" name="imageUrl" className="w-full p-3 border rounded-lg bg-gray-50/50" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/categories" className="px-6 py-3 text-sm font-sans border rounded-lg bg-white">Cancel</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 text-sm font-sans font-semibold rounded-lg text-white bg-[var(--forest)]">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
          </button>
        </div>
      </form>
    </div>
  );
}
