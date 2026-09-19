"use client";

import { useState } from "react";
import { Sparkles, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { uploadProductModelAction } from "@/app/actions/admin-products";

const TRYON_CATEGORIES = [
  { value: "", label: "Not a try-on piece (earrings, watches, gifts…)" },
  { value: "bangle", label: "Bangle → worn on wrist" },
  { value: "bracelet", label: "Bracelet → worn on wrist" },
  { value: "ring", label: "Ring → worn on finger (customer picks finger)" },
  { value: "necklace", label: "Necklace → worn on neck" },
];

interface Props {
  tryOnEnabled: boolean;
  setTryOnEnabled: (v: boolean) => void;
  tryOnCategory: string;
  setTryOnCategory: (v: string) => void;
  model3dUrl: string;
  setModel3dUrl: (v: string) => void;
}

export default function TryOn3DSection({
  tryOnEnabled, setTryOnEnabled, tryOnCategory, setTryOnCategory, model3dUrl, setModel3dUrl,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

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
      } else {
        setUploadMsg(res.error || "Upload failed");
      }
    } catch (e: any) {
      setUploadMsg(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5" style={{ borderColor: "rgba(197,160,89,0.3)" }}>
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: "rgba(197,160,89,0.2)" }}>
        <div className="w-8 h-8 rounded-lg bg-[#141312] text-[#C5A059] flex items-center justify-center">
          <Sparkles size={15} />
        </div>
        <div>
          <h3 className="font-serif text-base font-semibold text-[#141312]">3D Try-On Showroom</h3>
          <p className="text-xs text-gray-500 font-sans">Code-rendered 3D try-on (no AI) — appears in /customizer and on the product page</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-sans font-medium text-gray-800">Enable 3D Try-On for this product</p>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Shows the TRY ON button on cards, product page &amp; showroom</p>
        </div>
        <button
          type="button"
          data-testid="admin-tryon-toggle"
          onClick={() => setTryOnEnabled(!tryOnEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${tryOnEnabled ? "bg-[#C5A059]" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${tryOnEnabled ? "translate-x-6" : "translate-x-0"}`} />
        </button>
      </div>

      {tryOnEnabled && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">
              Jewellery Category <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(decides the body anchor automatically)</span>
            </label>
            <select
              value={tryOnCategory}
              onChange={(e) => setTryOnCategory(e.target.value)}
              data-testid="admin-tryon-category"
              className="w-full p-3 border rounded-lg font-sans text-sm outline-none focus:ring-1 bg-white"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            >
              {TRYON_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {tryOnEnabled && !tryOnCategory && (
              <p className="text-[11px] text-amber-600 font-sans mt-1">Pick a category so the showroom knows where to place it.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-sans font-medium mb-1.5 text-gray-700">
              3D Model (GLB)
              <span className="text-gray-400 font-normal ml-2">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={model3dUrl}
                onChange={(e) => setModel3dUrl(e.target.value)}
                placeholder="/models/jewelry/RG102.glb"
                data-testid="admin-model3d-url"
                className="flex-1 p-3 border rounded-lg font-sans outline-none focus:ring-1 bg-gray-50/50 font-mono text-xs"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
              <label
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-semibold rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: "rgba(26,26,26,0.2)" }}
                data-testid="admin-model3d-upload"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
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
            {uploadMsg && (
              <p className={`text-[11px] font-sans mt-1 flex items-center gap-1 ${uploadMsg.includes("✓") ? "text-green-600" : "text-red-600"}`}>
                {uploadMsg.includes("✓") && <CheckCircle2 size={11} />} {uploadMsg}
              </p>
            )}
            <p className="text-[11px] text-gray-400 font-sans mt-1.5">
              💡 No GLB? Leave blank — a product-specific procedural 3D preview (metal from plating, gem from title) is generated automatically in the showroom. Never another product&apos;s model.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
