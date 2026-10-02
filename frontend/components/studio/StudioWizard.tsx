"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Upload, CheckCircle2, Image as ImageIcon, Camera, User, Download, RefreshCw, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

// ─── TYPES ────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface ProductDetails {
  name: string;
  category: string;
  material: string;
  gemstone: string;
  weight: string;
  dimensions: string;
}

interface ModelDetails {
  mode: "ai" | "photo";
  ageRange: string;
  skinTone: string;
  hair: string;
  pose: string;
  expression: string;
}

// ─── STYLES ───────────────────────────────────────────────────────────

const STYLES = [
  { id: "cheerful", name: "CHEERFUL", desc: "Bright, youthful, energetic commercial jewellery campaign." },
  { id: "elegant", name: "ELEGANT", desc: "Luxury, sophisticated, refined jewellery editorial." },
  { id: "boho", name: "BOHO", desc: "Natural, artistic, relaxed, contemporary bohemian aesthetic." },
  { id: "vintage", name: "VINTAGE", desc: "Classic, nostalgic, timeless jewellery photography." },
  { id: "luxury", name: "LUXURY", desc: "High-end jewellery campaign with controlled studio lighting." },
  { id: "bridal", name: "BRIDAL", desc: "Elegant wedding/bridal styling." },
  { id: "traditional_indian", name: "TRADITIONAL INDIAN", desc: "Sophisticated traditional styling." },
  { id: "modern_indian", name: "MODERN INDIAN", desc: "Contemporary Indian fashion editorial." },
  { id: "festive", name: "FESTIVE", desc: "Indian festive campaign aesthetic." },
  { id: "editorial", name: "EDITORIAL", desc: "Fashion-magazine style photography." },
  { id: "custom", name: "CUSTOM", desc: "Describe your own custom style." },
];

const CATEGORIES = [
  "Necklace", "Pendant", "Earrings", "Stud Earrings", "Jhumka", 
  "Ring", "Bracelet", "Bangle", "Anklet", "Nose Ring", "Jewellery Set", "Other"
];

const MATERIALS = [
  "Gold", "Silver", "Platinum", "Rose Gold", "White Gold", "Yellow Gold", "Stainless Steel", "Other"
];

export default function StudioWizard() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const [step, setStep] = useState<Step>(1);
  
  // State for Step 1
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // State for Step 2
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: "Aurelia Solitaire Necklace",
    category: "Necklace",
    material: "18K Yellow Gold",
    gemstone: "Diamond",
    weight: "",
    dimensions: "18 inches",
  });

  // State for Step 3
  const [selectedStyle, setSelectedStyle] = useState<string>("luxury");
  const [customStyle, setCustomStyle] = useState("");

  // State for Step 4
  const [modelDetails, setModelDetails] = useState<ModelDetails>({
    mode: "ai",
    ageRange: "25-30",
    skinTone: "medium warm",
    hair: "long black wavy",
    pose: "Three-quarter portrait",
    expression: "Natural subtle smile",
  });
  const [modelPhoto, setModelPhoto] = useState<string | null>(null);

  // State for Step 5 & 6
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6) as Step);
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setProductImages((prev) => [...prev, base64]);
        
        // Auto-analyze
        try {
          const res = await fetch("/api/studio/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.analysis) {
              setProductDetails(prev => ({
                ...prev,
                category: data.analysis.category || prev.category,
                material: data.analysis.material || prev.material,
                gemstone: data.analysis.gemstone || prev.gemstone,
              }));
              toast.success("Product details auto-detected by AI!");
            }
          }
        } catch (e) {
          console.error("Auto-analyze failed", e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModelPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setModelPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    nextStep(); // Go to step 5 (loading/generating)

    try {
      const payload = {
        productImageBase64: productImages[0],
        productDetails,
        style: selectedStyle === "custom" ? customStyle : selectedStyle,
        modelDetails: modelDetails.mode === "ai" ? modelDetails : { mode: "photo", photoBase64: modelPhoto },
      };

      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await res.json();
      setResultImage(data.resultImageUrl);
      nextStep(); // Go to step 6 (result)
      toast.success("Generation complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Generation failed. Please try again.");
      prevStep(); // Go back to step 4
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `shynish_ai_studio_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-[#C5A059]/20 overflow-hidden flex flex-col min-h-[700px]">
      
      {/* ── HEADER & PROGRESS ── */}
      <div className="px-6 py-5 border-b border-[#C5A059]/15 bg-[#FAF8F5]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-[#141312]">AI Visual Studio</h1>
            <p className="text-xs font-sans text-[#7A726A]">Generate highly realistic marketing images</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mt-6 max-w-3xl mx-auto px-4">
          {[
            { id: 1, label: "Product" },
            { id: 2, label: "Details" },
            { id: 3, label: "Style" },
            { id: 4, label: "Model" },
            { id: 5, label: "Generate" },
            { id: 6, label: "Result" }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 w-16">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step === s.id ? "bg-[#141312] text-[#C5A059] ring-4 ring-[#C5A059]/20" : 
                step > s.id ? "bg-[#C5A059] text-white" : "bg-white border-2 border-[#EAE5D9] text-[#928980]"
              }`}>
                {step > s.id ? <CheckCircle2 size={16} /> : `0${s.id}`}
              </div>
              <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider text-center ${
                step === s.id ? "text-[#141312]" : step > s.id ? "text-[#C5A059]" : "text-[#928980]"
              }`}>
                {s.label}
              </span>
            </div>
          ))}
          {/* Connecting line */}
          <div className="absolute top-[82px] left-12 right-12 h-[2px] bg-[#EAE5D9] z-0 hidden sm:block pointer-events-none" />
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PRODUCT UPLOAD */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="font-serif text-3xl text-[#141312] mb-2">Upload Jewellery Product</h2>
                <p className="text-sm font-sans text-[#7A726A]">The AI will strictly preserve this exact design in the final generated image.</p>
              </div>

              <div className="border-2 border-dashed border-[#C5A059]/40 rounded-3xl p-12 flex flex-col items-center justify-center bg-[#FAF8F5] transition-colors hover:bg-[#F4EFE6]">
                <input type="file" id="product-upload" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                <label htmlFor="product-upload" className="cursor-pointer flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-[#C5A059]" />
                  </div>
                  <span className="font-sans font-semibold text-[#141312]">Click to upload product image</span>
                  <span className="text-xs text-[#7A726A] mt-2">JPG, PNG, WEBP supported. Transparent background preferred.</span>
                </label>
              </div>

              {productImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-8">
                  {productImages.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#C5A059]/20 shadow-sm bg-white">
                      <img src={src} alt="Product preview" className="w-full h-full object-contain p-2" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-8">
                <button 
                  onClick={nextStep} 
                  disabled={productImages.length === 0}
                  className="px-8 py-3 rounded-xl bg-[#141312] text-[#FAF8F5] font-semibold text-sm flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Product Details <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PRODUCT DETAILS */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="font-serif text-3xl text-[#141312] mb-2">Product Details</h2>
                <p className="text-sm font-sans text-[#7A726A]">Providing accurate details helps the AI understand scale, materials, and placement.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Product Name</label>
                  <input type="text" value={productDetails.name} onChange={e => setProductDetails({...productDetails, name: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAF8F5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Category</label>
                  <select value={productDetails.category} onChange={e => setProductDetails({...productDetails, category: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAF8F5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Material</label>
                  <select value={productDetails.material} onChange={e => setProductDetails({...productDetails, material: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAF8F5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none">
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Gemstone</label>
                  <input type="text" value={productDetails.gemstone} onChange={e => setProductDetails({...productDetails, gemstone: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAF8F5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" placeholder="e.g. Diamond, Ruby, None" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Dimensions / Length</label>
                  <input type="text" value={productDetails.dimensions} onChange={e => setProductDetails({...productDetails, dimensions: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-[#FAF8F5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" placeholder="e.g. 18 inches" />
                </div>
              </div>

              <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-[#5E564F] font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-[#141312] text-[#FAF8F5] font-semibold text-sm flex items-center gap-2 hover:bg-black transition-colors">
                  Next: Select Style <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: STYLE SELECTION */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="font-serif text-3xl text-[#141312] mb-2">Select Visual Style</h2>
                <p className="text-sm font-sans text-[#7A726A]">This defines the photography style, lighting, wardrobe, and environment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                      selectedStyle === style.id 
                        ? "border-[#141312] bg-[#FAF8F5] shadow-md" 
                        : "border-gray-100 hover:border-[#C5A059]/50 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-sans font-bold text-sm tracking-wider text-[#141312]">{style.name}</h3>
                      {selectedStyle === style.id && <CheckCircle2 size={18} className="text-[#C5A059]" />}
                    </div>
                    <p className="text-xs text-[#7A726A] leading-relaxed">{style.desc}</p>
                  </button>
                ))}
              </div>

              {selectedStyle === "custom" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#C5A059]/30">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F] mb-2 block">Custom Style Description</label>
                  <textarea 
                    rows={3} 
                    value={customStyle} 
                    onChange={e => setCustomStyle(e.target.value)} 
                    placeholder="e.g. Create a luxury Kerala-inspired jewellery campaign with warm natural lighting and an elegant traditional outfit."
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-[#C5A059] outline-none text-sm resize-none" 
                  />
                </motion.div>
              )}

              <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-[#5E564F] font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-[#141312] text-[#FAF8F5] font-semibold text-sm flex items-center gap-2 hover:bg-black transition-colors">
                  Next: Customize Model <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: MODEL CUSTOMIZATION */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="font-serif text-3xl text-[#141312] mb-2">Model Customization</h2>
                <p className="text-sm font-sans text-[#7A726A]">Generate a tailored AI model or upload a real person's photograph.</p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                <button 
                  onClick={() => setModelDetails({...modelDetails, mode: "ai"})}
                  className={`px-8 py-4 flex items-center gap-3 rounded-2xl border-2 transition-all font-semibold ${
                    modelDetails.mode === "ai" ? "border-[#141312] bg-[#141312] text-white shadow-lg" : "border-gray-200 text-[#5E564F] hover:border-[#C5A059]/50"
                  }`}
                >
                  <Wand2 size={20} className={modelDetails.mode === "ai" ? "text-[#C5A059]" : ""} />
                  AI Generated Model
                </button>
                <button 
                  onClick={() => setModelDetails({...modelDetails, mode: "photo"})}
                  className={`px-8 py-4 flex items-center gap-3 rounded-2xl border-2 transition-all font-semibold ${
                    modelDetails.mode === "photo" ? "border-[#141312] bg-[#141312] text-white shadow-lg" : "border-gray-200 text-[#5E564F] hover:border-[#C5A059]/50"
                  }`}
                >
                  <User size={20} className={modelDetails.mode === "photo" ? "text-[#C5A059]" : ""} />
                  Upload Person Photo
                </button>
              </div>

              {modelDetails.mode === "ai" ? (
                <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#C5A059]/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Age Range</label>
                    <select value={modelDetails.ageRange} onChange={e => setModelDetails({...modelDetails, ageRange: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-[#C5A059] outline-none">
                      <option value="18-24">18–24</option>
                      <option value="25-30">25–30</option>
                      <option value="31-40">31–40</option>
                      <option value="41-50">41–50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Skin Tone</label>
                    <select value={modelDetails.skinTone} onChange={e => setModelDetails({...modelDetails, skinTone: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-[#C5A059] outline-none">
                      <option value="fair">Fair</option>
                      <option value="light warm">Light Warm</option>
                      <option value="medium warm">Medium Warm</option>
                      <option value="olive">Olive</option>
                      <option value="deep warm">Deep Warm</option>
                      <option value="rich dark">Rich Dark</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Hair Style & Color</label>
                    <input type="text" value={modelDetails.hair} onChange={e => setModelDetails({...modelDetails, hair: e.target.value})} placeholder="e.g. long black wavy hair" className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-[#C5A059] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5E564F]">Pose</label>
                    <input type="text" value={modelDetails.pose} onChange={e => setModelDetails({...modelDetails, pose: e.target.value})} placeholder="e.g. Three-quarter portrait" className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:border-[#C5A059] outline-none" />
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#C5A059]/20 flex flex-col items-center">
                  <p className="text-sm text-[#7A726A] text-center mb-6 max-w-md">
                    Upload a clear, well-lit photograph. The AI will preserve the identity, face, and clothing, and only modify what is necessary to place the jewellery realistically.
                  </p>
                  
                  {modelPhoto ? (
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
                      <img src={modelPhoto} alt="Model" className="w-full h-full object-cover" />
                      <button onClick={() => setModelPhoto(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-semibold text-sm">
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm">
                      <input type="file" id="model-upload" accept="image/*" className="hidden" onChange={handleModelPhotoUpload} />
                      <label htmlFor="model-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#C5A059]/40 rounded-2xl bg-white hover:bg-[#F4EFE6] transition-colors cursor-pointer group">
                        <Camera size={32} className="text-[#C5A059] mb-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-[#141312]">Click to upload photo</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-[#5E564F] font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleGenerate} 
                  disabled={modelDetails.mode === "photo" && !modelPhoto}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#141312] via-[#242220] to-[#141312] text-[#FAF8F5] font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#C5A059]"
                >
                  <Sparkles size={16} className="text-[#C5A059]" /> Generate Marketing Image
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: GENERATING */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border-[2px] border-[#C5A059]/20 animate-ping" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#C5A059] border-r-[#C5A059]/40" />
                <div className="w-16 h-16 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-xl">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
              </div>
              <h2 className="font-serif text-3xl text-[#141312] mb-3">Crafting Your Masterpiece</h2>
              <p className="text-sm font-sans text-[#7A726A] max-w-sm mx-auto">
                AI is currently processing product fidelity, anatomical landmarks, and applying the requested visual style. This typically takes 15-30 seconds.
              </p>
            </motion.div>
          )}

          {/* STEP 6: RESULT */}
          {step === 6 && resultImage && (
            <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6">
                <h2 className="font-serif text-3xl text-[#141312]">Generation Result</h2>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <CheckCircle2 size={16} /> Quality Validated
                </div>
              </div>

              <div className="w-full relative aspect-[3/4] md:aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-[#F8F4EE]">
                <img src={resultImage} alt="Generated Jewellery Campaign" className="w-full h-full object-cover" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
                <button onClick={handleDownload} className="py-4 rounded-xl bg-[#141312] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors">
                  <Download size={18} /> Download High-Res
                </button>
                <button onClick={handleGenerate} className="py-4 rounded-xl bg-white border-2 border-[#C5A059] text-[#141312] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FAF8F5] transition-colors">
                  <RefreshCw size={18} /> Generate Variant
                </button>
                <button onClick={() => setStep(1)} className="py-4 rounded-xl border-2 border-gray-200 text-[#5E564F] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                  Create New Studio
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
