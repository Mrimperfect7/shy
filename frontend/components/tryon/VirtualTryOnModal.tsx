"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Sparkles, AlertCircle, RefreshCw, User, Camera, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TryOnProduct, TryOnMode, TryOnResult, AICharacter, MetalTone, TryOnAdjustment, TryOnRequest } from "@/lib/tryon/types";
import { trackTryOnEvent } from "@/lib/tryon/analytics";
import CharacterSelector from "./CharacterSelector";
import SelfPhotoCapture from "./SelfPhotoCapture";
import TryOnResultView from "./TryOnResultView";

// ─── LOADING STEPS ────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  { label: "Preparing your try-on...", progress: 12 },
  { label: "Analysing jewellery design...", progress: 28 },
  { label: "Detecting body landmarks...", progress: 46 },
  { label: "Positioning jewellery...", progress: 64 },
  { label: "Rendering realistic details...", progress: 82 },
  { label: "Finishing your look...", progress: 96 },
];

const STEP_DURATIONS = [800, 1200, 1400, 1500, 1600, 1200]; // ms per step

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TryOnProduct;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

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
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── BODY SCROLL LOCK ────────────────────────────────────────────────────
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

  // ─── ANIMATED LOADING PROGRESS ───────────────────────────────────────────
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStepIndex(0);
      setLoadingProgress(0);
      return;
    }

    let stepIdx = 0;
    setLoadingStepIndex(0);
    setLoadingProgress(LOADING_STEPS[0].progress);

    const timers: NodeJS.Timeout[] = [];
    let elapsed = 0;

    STEP_DURATIONS.forEach((duration, i) => {
      elapsed += duration;
      const timer = setTimeout(() => {
        const nextStep = Math.min(i + 1, LOADING_STEPS.length - 1);
        setLoadingStepIndex(nextStep);
        setLoadingProgress(LOADING_STEPS[nextStep].progress);
      }, elapsed);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  // ─── GENERATION ──────────────────────────────────────────────────────────
  const executeGeneration = useCallback(async (
    modeToUse: TryOnMode,
    userImg?: string,
    adjustment?: TryOnAdjustment
  ) => {
    setErrorMessage(null);
    setIsGenerating(true);
    setTryOnResult(null);

    trackTryOnEvent("try_on_generation_started", {
      productId: product.id,
      category: product.category,
      mode: modeToUse,
    });

    const startTime = Date.now();

    try {
      const payload: TryOnRequest = {
        productId: product.id,
        productTitle: product.title,
        productImageUrl: product.imageUrl,
        category: product.category,
        metalTone: selectedMetalTone,
        mode: modeToUse,
        characterId: modeToUse === "character" ? selectedCharacterId : undefined,
        userImageBase64: modeToUse === "self" ? (userImg || userImageBase64 || undefined) : undefined,
        adjustment,
      };

      // 1. Create Try-On Job on Genlook
      const res = await fetch("/api/genlook/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to start virtual try-on generation. Please try again.");
      }

      const generationId = data.generationId;
      if (!generationId) {
        throw new Error("No generation ID returned. Please try again.");
      }

      // 2. Poll for Status
      let resultImageUrl = null;
      let attempts = 0;
      const maxAttempts = 45; // 45 * 4s = 180s (3 minutes)

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        attempts++;

        const statusRes = await fetch(`/api/genlook/status?id=${generationId}`);
        const statusData = await statusRes.json();

        if (!statusRes.ok || !statusData.success) {
          console.warn("[Genlook Polling] Status fetch failed, will retry:", statusData.error);
          continue;
        }

        if (statusData.status === "COMPLETED") {
          resultImageUrl = statusData.resultImageUrl;
          break;
        } else if (statusData.status === "FAILED") {
          throw new Error("Virtual try-on generation failed. Please try a different photo.");
        }
      }

      if (!resultImageUrl) {
        throw new Error("Generation timed out. Please try again later.");
      }

      // 3. Display Result
      setTryOnResult({
        success: true,
        resultImageUrl,
        originalImageUrl: product.imageUrl,
        category: product.category,
        processingTimeMs: Date.now() - startTime,
        provider: "ai_provider"
      });

      trackTryOnEvent("try_on_generation_completed", {
        productId: product.id,
        processingTimeMs: Date.now() - startTime,
        provider: "ai_provider",
      });
    } catch (err: any) {
      console.error("[Try-On Error]:", err);
      setErrorMessage(err.message || "Something went wrong while generating your try-on.");
      trackTryOnEvent("try_on_generation_failed", { error: err.message });
    } finally {
      setIsGenerating(false);
    }
  }, [product, selectedCharacterId, selectedMetalTone, userImageBase64]);

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

  const currentStep = LOADING_STEPS[loadingStepIndex];

  // ─── METAL TONE OPTIONS ──────────────────────────────────────────────────
  const metalToneOptions: { value: MetalTone; label: string; color: string }[] = [
    { value: "yellow_gold", label: "18K Yellow Gold", color: "#C5A059" },
    { value: "rose_gold",   label: "Rose Gold",       color: "#C87C7C" },
    { value: "white_gold",  label: "White Gold",      color: "#C8C8C8" },
    { value: "silver",      label: "Silver Steel",    color: "#A8A8A8" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] z-50">
        {/* ── Backdrop ── */}
        <motion.div
          className="fixed inset-0 bg-[#141312]/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* ── Scrollable Modal Container ── */}
        <div className="fixed inset-0 overflow-y-auto pointer-events-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5 lg:p-8">
            {/* ── Modal Window ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#C5A059]/30 overflow-hidden z-10 flex flex-col pointer-events-auto"
            >
          {/* ── HEADER ── */}
          <div className="px-5 sm:px-8 py-4 bg-white border-b border-[#C5A059]/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-sm">
                <Sparkles size={17} />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-normal text-[#141312] leading-tight flex items-center gap-2">
                  <span>AI Jewellery Try-On</span>
                  <span className="text-[9px] uppercase font-sans font-bold tracking-[0.15em] text-[#C5A059] bg-[#C5A059]/12 px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                    Live
                  </span>
                </h2>
                <p className="text-[11px] font-sans text-[#7A726A] hidden sm:block mt-0.5">
                  See exactly how this piece looks on you before purchasing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#5E564F] hover:text-[#141312] hover:bg-[#F4EFE6] transition-colors"
              aria-label="Close try-on"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── PRODUCT INFO STRIP ── */}
          <div className="px-5 sm:px-8 py-3 bg-[#F8F4EE]/80 border-b border-[#C5A059]/15 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            {/* Product thumbnail + title */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#C5A059]/30 flex-shrink-0 shadow-xs">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-[#141312] truncate max-w-[200px] sm:max-w-xs">
                  {product.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-sans text-[#5E564F]">
                  <span className="font-semibold text-[#141312]">₹{product.price}</span>
                  <span>·</span>
                  <span className="capitalize">{product.category.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Metal Tone Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#7A726A] font-sans hidden md:inline tracking-wide uppercase">Tone:</span>
              <div className="flex items-center gap-1">
                {metalToneOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedMetalTone(opt.value)}
                    title={opt.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all shadow-xs ${
                      selectedMetalTone === opt.value
                        ? "border-[#141312] scale-110 shadow-md"
                        : "border-transparent hover:border-[#141312]/40 hover:scale-105"
                    }`}
                    style={{ backgroundColor: opt.color }}
                    aria-label={opt.label}
                  />
                ))}
                <span className="text-[10px] font-sans text-[#5E564F] ml-1 hidden sm:inline">
                  {metalToneOptions.find((o) => o.value === selectedMetalTone)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── MODAL BODY ── */}
          <div className="p-5 sm:p-8 overflow-y-auto flex-1 min-h-0">

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => executeGeneration(mode)}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-[11px] font-semibold hover:bg-rose-800 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <RefreshCw size={11} />
                  <span>Retry</span>
                </button>
              </motion.div>
            )}

            {/* ── LOADING STATE ── */}
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-7"
              >
                {/* Orbital spinner */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-[#C5A059]/20 animate-ping" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C5A059] border-r-[#C5A059]/40"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-dashed border-[#C5A059]/30"
                  />
                  <div className="w-14 h-14 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center shadow-xl">
                    <Sparkles size={22} className="animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2.5 max-w-sm w-full">
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={loadingStepIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="font-serif text-xl sm:text-2xl text-[#141312]"
                    >
                      {currentStep.label}
                    </motion.h3>
                  </AnimatePresence>

                  {/* Progress bar */}
                  <div className="w-full max-w-xs mx-auto h-1.5 bg-[#EAE5D9] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#ECC880] via-[#C5A059] to-[#9A7832]"
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-[11px] font-sans text-[#928980] tabular-nums">
                    {loadingProgress}% complete
                  </p>
                </div>

                <p className="text-[10px] text-[#928980] font-sans flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Your photo is processed securely and never stored</span>
                </p>
              </motion.div>

            ) : tryOnResult ? (
              /* ── RESULT VIEW ── */
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
              /* ── MODE SELECTION + INPUT ── */
              <div className="space-y-7">

                {/* Mode selector tabs */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("character");
                      trackTryOnEvent("ai_character_selected");
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 font-sans text-xs font-semibold ${
                      mode === "character"
                        ? "bg-[#141312] text-[#FAF8F5] border-[#141312] shadow-lg"
                        : "bg-white text-[#5E564F] border-[#C5A059]/25 hover:border-[#C5A059]/60 hover:shadow-sm"
                    }`}
                  >
                    <User size={20} className={mode === "character" ? "text-[#C5A059]" : "text-[#928980]"} />
                    <div className="text-center">
                      <div className={mode === "character" ? "text-white" : ""}>AI Model</div>
                      <div className={`text-[9px] font-normal mt-0.5 ${mode === "character" ? "text-[#C5A059]" : "text-[#928980]"}`}>
                        7 diverse models
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("self");
                      trackTryOnEvent("self_image_selected");
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 font-sans text-xs font-semibold ${
                      mode === "self"
                        ? "bg-[#141312] text-[#FAF8F5] border-[#141312] shadow-lg"
                        : "bg-white text-[#5E564F] border-[#C5A059]/25 hover:border-[#C5A059]/60 hover:shadow-sm"
                    }`}
                  >
                    <Camera size={20} className={mode === "self" ? "text-[#C5A059]" : "text-[#928980]"} />
                    <div className="text-center">
                      <div className={mode === "self" ? "text-white" : ""}>My Photo</div>
                      <div className={`text-[9px] font-normal mt-0.5 ${mode === "self" ? "text-[#C5A059]" : "text-[#928980]"}`}>
                        Upload or selfie
                      </div>
                    </div>
                  </button>
                </div>

                {/* Mode 1: AI Character Try-On */}
                {mode === "character" && (
                  <CharacterSelector
                    category={product.category}
                    selectedCharacterId={selectedCharacterId}
                    onSelectCharacter={handleCharacterSelect}
                    onConfirmTryOn={() => executeGeneration("character")}
                  />
                )}

                {/* Mode 2: Self Photo */}
                {mode === "self" && (
                  <SelfPhotoCapture
                    category={product.category}
                    productImageUrl={product.imageUrl}
                    onPhotoReady={handleSelfPhotoReady}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      </div>
      </div>
    </AnimatePresence>
  );
}
