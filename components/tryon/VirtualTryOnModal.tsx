"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, AlertCircle, RefreshCw, User, Camera, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TryOnProduct, TryOnMode, TryOnResult, AICharacter, MetalTone, TryOnAdjustment, TryOnRequest } from "@/lib/tryon/types";
import { trackTryOnEvent } from "@/lib/tryon/analytics";
import CharacterSelector from "./CharacterSelector";
import SelfPhotoCapture from "./SelfPhotoCapture";
import TryOnResultView from "./TryOnResultView";

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TryOnProduct;
}

export default function VirtualTryOnModal({
  isOpen,
  onClose,
  product,
}: VirtualTryOnModalProps) {
  const [mode, setMode] = useState<TryOnMode>("character");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("char-zara");
  const [selectedMetalTone, setSelectedMetalTone] = useState<MetalTone>(product.metalTone || "yellow_gold");
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      trackTryOnEvent("try_on_opened", { productId: product.id, category: product.category });
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, product]);

  // Animated loading progress steps
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    if (isGenerating) {
      setLoadingStep(0);
      timer1 = setTimeout(() => setLoadingStep(1), 900);
      timer2 = setTimeout(() => setLoadingStep(2), 2000);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isGenerating]);

  // Execute Try-On API Call
  const executeGeneration = async (modeToUse: TryOnMode, userImg?: string, adjustment?: TryOnAdjustment) => {
    setErrorMessage(null);
    setIsGenerating(true);
    trackTryOnEvent("try_on_generation_started", {
      productId: product.id,
      category: product.category,
      mode: modeToUse,
    });

    try {
      const payload: TryOnRequest = {
        productId: product.id,
        productTitle: product.title,
        productImageUrl: product.imageUrl,
        category: product.category,
        metalTone: selectedMetalTone,
        mode: modeToUse,
        characterId: modeToUse === "character" ? selectedCharacterId : undefined,
        userImageBase64: modeToUse === "self" ? userImg || userImageBase64 || undefined : undefined,
        adjustment,
      };

      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to generate virtual try-on. Please try again.");
      }

      setTryOnResult(data);
      trackTryOnEvent("try_on_generation_completed", {
        productId: product.id,
        processingTimeMs: data.processingTimeMs,
        provider: data.provider,
      });
    } catch (err: any) {
      console.error("[Try-On Error]:", err);
      setErrorMessage(err.message || "Something went wrong while generating try-on.");
      trackTryOnEvent("try_on_generation_failed", { error: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCharacterSelect = (char: AICharacter) => {
    setSelectedCharacterId(char.id);
    trackTryOnEvent("ai_character_selected", { characterId: char.id, characterName: char.name });
  };

  const handleSelfPhotoReady = (base64Img: string) => {
    setUserImageBase64(base64Img);
    trackTryOnEvent("image_uploaded", { mode: "self" });
    executeGeneration("self", base64Img);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5 lg:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#141312]/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border-2 border-[#C5A059]/40 overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* ─── MODAL HEADER ─── */}
          <div className="px-5 sm:px-8 py-4 bg-white border-b border-[#C5A059]/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-normal text-[#141312] leading-tight flex items-center gap-2">
                  <span>AI Jewelry Virtual Try-On</span>
                  <span className="text-[10px] uppercase font-sans font-semibold tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </h2>
                <p className="text-[11px] font-sans text-[#7A726A] hidden sm:block">
                  Experience realistic sizing, proportions, and 18K gold luster before purchasing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* ─── PRODUCT INFO STRIP & VARIANT SELECTOR ─── */}
          <div className="px-5 sm:px-8 py-3 bg-[#F4EFE6]/70 border-b border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-[#C5A059]/30 flex-shrink-0">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-[#141312] truncate max-w-[220px] sm:max-w-md">
                  {product.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-sans text-[#5E564F]">
                  <span className="text-[#141312] font-semibold">₹{product.price}</span>
                  <span>•</span>
                  <span className="capitalize">{product.category}</span>
                </div>
              </div>
            </div>

            {/* Metal Tone Switcher */}
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className="text-[11px] text-[#7A726A] hidden md:inline">Metal Tone:</span>
              <button
                type="button"
                onClick={() => setSelectedMetalTone("yellow_gold")}
                className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold transition-all ${
                  selectedMetalTone === "yellow_gold"
                    ? "bg-[#C5A059] text-[#141312] shadow-xs"
                    : "bg-white/80 text-[#5E564F] hover:bg-white border border-[#C5A059]/20"
                }`}
              >
                18K Yellow Gold
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetalTone("silver")}
                className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold transition-all ${
                  selectedMetalTone === "silver"
                    ? "bg-[#C5A059] text-[#141312] shadow-xs"
                    : "bg-white/80 text-[#5E564F] hover:bg-white border border-[#C5A059]/20"
                }`}
              >
                Silver Steel
              </button>
            </div>
          </div>

          {/* ─── MODAL BODY WITH SCROLL ─── */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-1">
            {/* Error Display */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => executeGeneration(mode)}
                  className="px-3 py-1 rounded-lg bg-rose-800 text-white text-[11px] font-medium hover:bg-rose-900 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11} />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* ─── GENERATION LOADING STATE ─── */}
            {isGenerating ? (
              <div className="py-14 sm:py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Outer Pulsing Golden Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#C5A059]/30 animate-ping" />
                  <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#C5A059] animate-spin" />
                  <div className="w-14 h-14 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-xl">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif text-2xl text-[#141312]">
                    Creating Your Virtual Try-On...
                  </h3>
                  <p className="text-xs font-sans text-[#5E564F] leading-relaxed transition-all">
                    {loadingStep === 0 && "Analyzing 18K gold contours & jewelry boundaries..."}
                    {loadingStep === 1 && `Aligning realistic placement for ${product.category}...`}
                    {loadingStep === 2 && "Synthesizing authentic contact shadows & metallic luster..."}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs h-1.5 bg-[#EAE5D9] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#ECC880] via-[#C5A059] to-[#9A7832]"
                    initial={{ width: "10%" }}
                    animate={{ width: loadingStep === 0 ? "35%" : loadingStep === 1 ? "70%" : "95%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <p className="text-[10px] text-[#928980] font-sans flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>100% Product Fidelity · Zero AI Distortion</span>
                </p>
              </div>
            ) : tryOnResult ? (
              /* ─── RESULT DISPLAY STATE ─── */
              <TryOnResultView
                product={product}
                result={tryOnResult}
                onRetryCharacter={() => {
                  setTryOnResult(null);
                  setMode("character");
                }}
                onRetrySelf={() => {
                  setTryOnResult(null);
                  setMode("self");
                }}
                onClose={onClose}
                onApplyAdjustment={(adj) => executeGeneration(mode, undefined, adj)}
                isApplyingAdjustment={isGenerating}
              />
            ) : (
              /* ─── MODE SELECTION & INPUT STATE ─── */
              <div className="space-y-6">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("character");
                      trackTryOnEvent("ai_character_selected");
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-sans text-xs font-semibold ${
                      mode === "character"
                        ? "bg-[#141312] text-[#FAF8F5] border-[#141312] shadow-md"
                        : "bg-white text-[#5E564F] border-[#C5A059]/25 hover:border-[#C5A059]"
                    }`}
                  >
                    <User size={16} className={mode === "character" ? "text-[#C5A059]" : ""} />
                    <span>AI Character Try-On</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("self");
                      trackTryOnEvent("self_image_selected");
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-sans text-xs font-semibold ${
                      mode === "self"
                        ? "bg-[#141312] text-[#FAF8F5] border-[#141312] shadow-md"
                        : "bg-white text-[#5E564F] border-[#C5A059]/25 hover:border-[#C5A059]"
                    }`}
                  >
                    <Camera size={16} className={mode === "self" ? "text-[#C5A059]" : ""} />
                    <span>Try On Myself</span>
                  </button>
                </div>

                {/* Mode 1: AI Characters */}
                {mode === "character" && (
                  <CharacterSelector
                    category={product.category}
                    selectedCharacterId={selectedCharacterId}
                    onSelectCharacter={handleCharacterSelect}
                    onConfirmTryOn={() => executeGeneration("character")}
                  />
                )}

                {/* Mode 2: Self Photo Capture / Upload */}
                {mode === "self" && (
                  <SelfPhotoCapture
                    category={product.category}
                    onPhotoReady={handleSelfPhotoReady}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
