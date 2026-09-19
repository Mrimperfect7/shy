"use client";

import { useState } from "react";
import { saveSeoMetadata } from "@/app/actions/seo";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { calculateSeoScore } from "@/lib/seo";

type SeoEditFormProps = {
  entityType: string;
  entityId: string;
  entityName: string;
  entityUrl: string;
  initialData: any;
};

export default function SeoEditForm({ entityType, entityId, entityName, entityUrl, initialData }: SeoEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    robotsIndex: initialData?.robotsIndex ?? true,
    robotsFollow: initialData?.robotsFollow ?? true,
    ogTitle: initialData?.ogTitle || "",
    ogDescription: initialData?.ogDescription || "",
    ogImage: initialData?.ogImage || "",
    twitterTitle: initialData?.twitterTitle || "",
    twitterDescription: initialData?.twitterDescription || "",
    twitterImage: initialData?.twitterImage || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveSeoMetadata({
      entityType,
      entityId,
      ...formData,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("SEO Metadata saved successfully!");
      router.push("/admin/seo");
    } else {
      toast.error(res.error || "Failed to save SEO metadata.");
    }
  };

  const score = calculateSeoScore(formData.title, formData.description, formData.canonicalUrl, !!formData.ogImage);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Score */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Live SEO Score</h3>
          <p className="text-sm text-gray-500">Based on standard SEO best practices.</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold" style={{ color: score > 80 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' }}>
            {score} / 100
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Column */}
        <div className="space-y-6">
          {/* General SEO */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Search Engine Optimization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">SEO Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={entityName}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Recommended: 50-60 characters</span>
                <span className={formData.title.length > 60 ? "text-red-500" : ""}>{formData.title.length} / 60</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Recommended: 150-160 characters</span>
                <span className={formData.description.length > 160 ? "text-red-500" : ""}>{formData.description.length} / 160</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
              <input
                type="text"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleChange}
                placeholder={`https://shynish.com${entityUrl}`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="robotsIndex"
                  checked={formData.robotsIndex}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Index</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="robotsFollow"
                  checked={formData.robotsFollow}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Follow</span>
              </label>
            </div>
          </div>

          {/* Open Graph */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Open Graph (Facebook / LinkedIn)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">OG Title</label>
              <input
                type="text"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleChange}
                placeholder="Leave blank to use SEO Title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">OG Description</label>
              <textarea
                name="ogDescription"
                value={formData.ogDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Leave blank to use Meta Description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">OG Image URL</label>
              <input
                type="text"
                name="ogImage"
                value={formData.ogImage}
                onChange={handleChange}
                placeholder="/assets/og-image.jpg"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              />
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Google Search Preview</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 font-sans">
              <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-[#C5A059]/20 text-[#C5A059] rounded-full flex items-center justify-center text-xs font-bold">S</div>
                <div>
                  <div className="font-medium">SHYN.ISH</div>
                  <div className="text-gray-500 text-xs">https://shynish.com{entityUrl}</div>
                </div>
              </div>
              <div className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                {formData.title || entityName}
              </div>
              <div className="text-sm text-[#4d5156] mt-1 line-clamp-2">
                {formData.description || "Provide a meta description to see it appear here in the search results preview."}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Social Preview</h3>
            <div className="rounded-lg border border-gray-200 overflow-hidden font-sans max-w-sm mx-auto shadow-sm">
              <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center text-gray-400">
                {formData.ogImage ? (
                  <img src={formData.ogImage} alt="OG" className="w-full h-full object-cover" />
                ) : (
                  <span>No Image (1200x630)</span>
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase">SHYNISH.COM</div>
                <div className="font-semibold text-gray-900 mt-1 truncate">
                  {formData.ogTitle || formData.title || entityName}
                </div>
                <div className="text-sm text-gray-500 mt-1 truncate">
                  {formData.ogDescription || formData.description || "Description preview goes here."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save SEO Metadata"}
        </button>
      </div>
    </form>
  );
}
