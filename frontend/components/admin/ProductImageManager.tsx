"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { 
  Upload, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  Touchpad, 
  Sparkles, 
  Loader2, 
  Plus, 
  ImageIcon 
} from "lucide-react";
import { uploadProductImageAction } from "@/app/actions/admin-products";

interface ProductImageManagerProps {
  images: string[];
  onChange: (newImages: string[]) => void;
}

export default function ProductImageManager({ images, onChange }: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await uploadProductImageAction(formData);
        if (!res.success || !res.url) {
          throw new Error(res.error || "Failed to upload image");
        }
        return res.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload one or more images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleSetHoverTouch = (index: number) => {
    if (index === 1 || images.length < 2) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    // Insert at index 1
    const newArr = [rest[0], target, ...rest.slice(1)];
    onChange(newArr);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newArr = [...images];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    onChange(newArr);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const newArr = [...images];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    onChange(newArr);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const PRESETS = [
    { name: "Single Bottle", url: "/assets/layered-bottle.png" },
    { name: "Pack of 2", url: "/assets/pack2.jpg" },
    { name: "Pack of 3", url: "/assets/pack3.jpg" },
    { name: "Signature Oil", url: "/assets/bottle.PNG" },
    { name: "Step 03 Ritual", url: "/assets/step3-restore.jpg" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-sans font-semibold text-gray-800">
            Product Images &amp; Display Order
          </label>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Configure which image appears first (Default view) and which appears on touch / hover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--charcoal)] text-white rounded-lg text-xs font-sans font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? "Uploading…" : "Upload Images"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Interactive Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {images.map((url, idx) => {
            const isFirst = idx === 0;
            const isTouch = idx === 1;

            return (
              <div
                key={`${url}-${idx}`}
                className={`relative rounded-2xl border-2 p-3 bg-white transition-all shadow-sm flex flex-col justify-between ${
                  isFirst
                    ? "border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/20"
                    : isTouch
                    ? "border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  {isFirst ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                      <Star size={11} fill="white" /> 1. Display First (Cover)
                    </span>
                  ) : isTouch ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-sm">
                      <Sparkles size={11} /> 2. Display on Touch / Hover
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                      Slot {idx + 1} (Gallery)
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
                  <Image src={url} alt={`Product image ${idx + 1}`} fill className="object-cover w-full h-full" sizes="220px" />
                </div>

                {/* Quick Selection Buttons */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-1.5">
                    {!isFirst ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-[11px] font-sans font-semibold py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Star size={11} /> Set as First
                      </button>
                    ) : (
                      <div className="text-[11px] font-sans font-bold py-1.5 px-2 text-center text-emerald-800 bg-emerald-100 rounded-lg">
                        🌟 Primary Cover
                      </div>
                    )}

                    {!isTouch && images.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleSetHoverTouch(idx)}
                        className="text-[11px] font-sans font-semibold py-1.5 px-2 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Touchpad size={11} /> Set as Touch
                      </button>
                    ) : isTouch ? (
                      <div className="text-[11px] font-sans font-bold py-1.5 px-2 text-center text-indigo-800 bg-indigo-100 rounded-lg">
                        👆 Touch / Hover
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>

                  {/* Move Left / Right */}
                  <div className="flex items-center justify-between text-gray-400 pt-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveLeft(idx)}
                      className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400">Position {idx + 1} of {images.length}</span>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveRight(idx)}
                      className="p-1 rounded hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed rounded-2xl text-center bg-gray-50/60 flex flex-col items-center justify-center">
          <ImageIcon size={32} className="text-gray-400 mb-2" />
          <p className="font-sans text-sm font-medium text-gray-700">No images added yet</p>
          <p className="font-sans text-xs text-gray-400 max-w-sm mt-0.5 mb-3">
            Add at least two images so the store can display the primary cover and the secondary image on touch/hover.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-sans font-semibold hover:bg-gray-50 transition-colors"
          >
            Select Image Files
          </button>
        </div>
      )}

      {/* Quick Add Presets & Custom URL */}
      <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-sans font-medium text-gray-500 mr-1">Quick Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => onChange([...images, p.url])}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-sans bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <Plus size={11} /> {p.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL (/assets/... or https://...)"
            className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-sans outline-none focus:border-forest"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-sans font-medium hover:bg-black transition-colors disabled:opacity-40"
          >
            Add URL
          </button>
        </div>
      </div>
    </div>
  );
}
