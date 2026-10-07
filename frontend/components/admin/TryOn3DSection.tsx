"use client";

import { useState, lazy, Suspense } from "react";
import { Box, Upload, Loader2, CheckCircle2, Trash2, Eye, EyeOff } from "lucide-react";
import { uploadProductModelAction } from "@/app/actions/admin-products";

// Lazy-load the viewer for admin preview
const Product3DViewer = lazy(() => import("@/components/product/Product3DViewer"));

interface Props {
  // kept for backward-compat with EditProductForm (tryOn fields still saved)
  tryOnEnabled: boolean;
  setTryOnEnabled: (v: boolean) => void;
  tryOnCategory: string;
  setTryOnCategory: (v: string) => void;
  model3dUrl: string;
  setModel3dUrl: (v: string) => void;
}

export default function TryOn3DSection({
  model3dUrl,
  setModel3dUrl,
  // these are still passed from EditProductForm but no longer shown as "try-on"
  tryOnEnabled,
  setTryOnEnabled,
  tryOnCategory,
  setTryOnCategory,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.set("model", file);
      const res = await uploadProductModelAction(fd);
      if (res.success && res.url) {
        setModel3dUrl(res.url);
        setUploadMsg("Model uploaded ✓");
        setShowPreview(true);
      } else {
        setUploadMsg(res.error || "Upload failed");
      }
    } catch (e: any) {
      setUploadMsg(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setModel3dUrl("");
    setShowPreview(false);
    setUploadMsg("");
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border p-6 space-y-5"
      style={{ borderColor: "rgba(197,160,89,0.3)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b pb-3"
        style={{ borderColor: "rgba(197,160,89,0.2)" }}
      >
        <div className="w-8 h-8 rounded-lg bg-[#141312] text-[#C5A059] flex items-center justify-center">
          <Box size={15} />
        </div>
        <div>
          <h3 className="font-serif text-base font-semibold text-[#141312]">
            3D Product Viewer
          </h3>
          <p className="text-xs text-gray-500 font-sans">
            Upload a GLB/GLTF model — customers can rotate, zoom &amp; inspect the jewellery in 3D on the product page
          </p>
        </div>
      </div>

      {/* Enable / Disable toggle (reused as "3D Viewer Enabled") */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-sans font-medium text-gray-800">
            Enable 3D Viewer for this product
          </p>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Shows the &ldquo;View in 3D&rdquo; button on the product page
          </p>
        </div>
        <button
          type="button"
          data-testid="admin-tryon-toggle"
          onClick={() => setTryOnEnabled(!tryOnEnabled)}
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

      {/* Model URL + Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-sans font-medium text-gray-700">
          3D Model File (GLB / GLTF)
          <span className="text-gray-400 font-normal ml-2">(optional — leave blank for no 3D view)</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={model3dUrl}
            onChange={(e) => setModel3dUrl(e.target.value)}
            placeholder="/models/jewelry/RG102.glb or external URL"
            data-testid="admin-model3d-url"
            className="flex-1 p-3 border rounded-lg font-sans outline-none focus:ring-1 bg-gray-50/50 font-mono text-xs"
            style={{ borderColor: "rgba(26,26,26,0.15)" }}
          />

          {/* Upload button */}
          <label
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-semibold rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: "rgba(26,26,26,0.2)" }}
            data-testid="admin-model3d-upload"
            title="Upload GLB or GLTF model"
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Upload size={13} />
            )}
            Upload GLB
            <input
              type="file"
              accept=".glb,.gltf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
          </label>
        </div>

        {/* Upload status message */}
        {uploadMsg && (
          <p
            className={`text-[11px] font-sans flex items-center gap-1 ${
              uploadMsg.includes("✓") ? "text-green-600" : "text-red-600"
            }`}
          >
            {uploadMsg.includes("✓") && <CheckCircle2 size={11} />}
            {uploadMsg}
          </p>
        )}

        {/* Actions when model exists */}
        {model3dUrl && (
          <div className="flex items-center gap-3 pt-1">
            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#C5A059] hover:underline"
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? "Hide preview" : "Preview 3D model"}
            </button>

            {/* Remove model */}
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-xs font-sans font-medium text-red-500 hover:underline ml-auto"
            >
              <Trash2 size={13} />
              Remove model
            </button>
          </div>
        )}

        {/* Inline 3D preview */}
        {showPreview && model3dUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#C5A059]/20">
            <Suspense
              fallback={
                <div className="w-full aspect-square bg-[#FAF8F5] flex items-center justify-center">
                  <Loader2 size={20} className="text-[#C5A059] animate-spin" />
                </div>
              }
            >
              <Product3DViewer
                modelUrl={model3dUrl}
                productName="3D Preview"
              />
            </Suspense>
          </div>
        )}

        <p className="text-[11px] text-gray-400 font-sans mt-1.5">
          💡 Supported formats: <strong>.glb</strong>, <strong>.gltf</strong>. Recommended max size: 5 MB. Smaller models load faster on mobile.
        </p>
      </div>

      {/* Jewellery category (for placement context — kept for DB compat) */}
      <div
        className="pt-4 border-t space-y-2"
        style={{ borderColor: "rgba(197,160,89,0.15)" }}
      >
        <label className="block text-sm font-sans font-medium text-gray-700">
          Jewellery Category
          <span className="text-gray-400 font-normal ml-2">(for product context)</span>
        </label>
        <select
          value={tryOnCategory}
          onChange={(e) => setTryOnCategory(e.target.value)}
          data-testid="admin-tryon-category"
          className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-white"
          style={{ borderColor: "rgba(26,26,26,0.15)" }}
        >
          <option value="">Select category…</option>
          <option value="necklace">Necklace</option>
          <option value="bracelet">Bracelet</option>
          <option value="bangle">Bangle</option>
          <option value="ring">Ring</option>
          <option value="earring">Earring</option>
        </select>
      </div>
    </div>
  );
}
