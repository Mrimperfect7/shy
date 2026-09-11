"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Check,
  Zap,
} from "lucide-react";
import { TryOnResult, TryOnProduct, TryOnAdjustment } from "@/lib/tryon/types";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface TryOnResultViewProps {
  product: TryOnProduct;
  result: TryOnResult;
  onRetryCharacter: () => void;
  onRetrySelf: () => void;
  onClose: () => void;
  onApplyAdjustment?: (adjustment: TryOnAdjustment) => Promise<void> | void;
  isApplyingAdjustment?: boolean;
}

export default function TryOnResultView({
  product,
  result,
  onRetryCharacter,
  onRetrySelf,
  onClose,
  onApplyAdjustment,
  isApplyingAdjustment = false,
}: TryOnResultViewProps) {
  const { addItem } = useCartStore();
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%
  const [isComparingHeld, setIsComparingHeld] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fine-tune adjustment state
  const [showAdjust, setShowAdjust] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0);
  const [rotationDelta, setRotationDelta] = useState(0);
  const [earVisibility, setEarVisibility] = useState<"both" | "left_only" | "right_only">("both");

  const handleNudge = (dx: number, dy: number) => {
    setOffsetX((prev) => Math.max(-0.25, Math.min(0.25, prev + dx)));
    setOffsetY((prev) => Math.max(-0.25, Math.min(0.25, prev + dy)));
  };

  const handleRotate = (deg: number) => {
    setRotationDelta((prev) => (prev + deg) % 360);
  };

  const handleApplyAdjustment = async () => {
    if (onApplyAdjustment) {
      await onApplyAdjustment({
        offsetX,
        offsetY,
        scaleMultiplier,
        rotationDelta,
        earVisibility,
      });
      toast.success("Adjustment applied ✨");
    }
  };

  // Handle slider drag
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id || product.handle,
      title: product.title,
      price: product.price,
      image: product.imageUrl,
      imageUrl: product.imageUrl,
      quantity: 1,
      variantTitle: product.material || "18K PVD Gold",
    });

    toast.success(`Added ${product.title} to bag! ✨`, {
      style: {
        background: "#141312",
        color: "#FAF8F5",
        border: "1px solid #C5A059",
      },
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = result.resultImageUrl;
    link.download = `shynish-${product.handle}-tryon.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SHYN.ISH Virtual Try-On - ${product.title}`,
          text: `Check out how the ${product.title} looks on me with SHYN.ISH AI Try-On!`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      toast.success("Product link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Result Subheader */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C5A059]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-[#C5A059]">
              AI Virtual Try-On Complete
            </p>
          </div>
          <h3 className="font-serif text-lg sm:text-2xl text-[#141312]">
            {product.title} on Display
          </h3>
        </div>

        {/* Quick Action Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAdjust(!showAdjust)}
            className={`px-3.5 py-1.5 rounded-full border text-[11px] font-sans font-medium transition-all flex items-center gap-1.5 shadow-2xs select-none ${
              showAdjust
                ? "bg-[#141312] text-[#FAF8F5] border-[#141312]"
                : "bg-white border-[#C5A059]/30 text-[#141312] hover:bg-[#FAF8F5]"
            }`}
          >
            <SlidersHorizontal size={13} className="text-[#C5A059]" />
            <span>{showAdjust ? "Hide Fit Controls" : "Fine-Tune Fit"}</span>
          </button>

          <button
            type="button"
            onMouseDown={() => setIsComparingHeld(true)}
            onMouseUp={() => setIsComparingHeld(false)}
            onTouchStart={() => setIsComparingHeld(true)}
            onTouchEnd={() => setIsComparingHeld(false)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#C5A059]/30 text-[11px] font-sans font-medium text-[#141312] hover:bg-[#FAF8F5] transition-all flex items-center gap-1.5 shadow-2xs select-none"
          >
            <span>Hold for Original</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full bg-white border border-[#C5A059]/30 text-[#141312] hover:bg-[#FAF8F5] transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen zoom"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ─── INTERACTIVE FINE-TUNE FIT CONTROLS ─── */}
      {showAdjust && (
        <div className="p-4 rounded-2xl bg-white border border-[#C5A059]/40 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#C5A059]/15 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span className="font-serif text-sm font-medium text-[#141312]">
                Custom Placement & Size Adjuster
              </span>
            </div>
            <span className="text-[10px] text-[#7A726A] font-sans">
              Nudge position or toggle ear visibility
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
            {/* 1. Position Nudges */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#5E564F] block">
                Nudge Position
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleNudge(-0.015, 0)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                  title="Move Left"
                >
                  ← Left
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0.015, 0)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                  title="Move Right"
                >
                  Right →
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0, -0.015)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                  title="Move Up"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0, 0.015)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                  title="Move Down"
                >
                  ↓ Down
                </button>
              </div>
            </div>

            {/* 2. Scale / Size */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#5E564F] block">
                Jewelry Scale ({Math.round(scaleMultiplier * 100)}%)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScaleMultiplier((s) => Math.max(0.6, s - 0.1))}
                  className="px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                >
                  - Smaller
                </button>
                <button
                  type="button"
                  onClick={() => setScaleMultiplier((s) => Math.min(1.6, s + 0.1))}
                  className="px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                >
                  + Larger
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(5)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#C5A059]/30 hover:bg-[#C5A059]/10 font-semibold"
                  title="Tilt angle"
                >
                  ↺ Tilt
                </button>
              </div>
            </div>

            {/* 3. Ear Visibility (for earrings) or Action */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-[#5E564F] block">
                {product.category === "earrings" ? "Ears Rendered" : "Apply"}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.category === "earrings" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEarVisibility("both")}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        earVisibility === "both"
                          ? "bg-[#141312] text-[#FAF8F5] border-[#141312]"
                          : "bg-[#FAF8F5] border-[#C5A059]/30 text-[#5E564F]"
                      }`}
                    >
                      Both
                    </button>
                    <button
                      type="button"
                      onClick={() => setEarVisibility("left_only")}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        earVisibility === "left_only"
                          ? "bg-[#141312] text-[#FAF8F5] border-[#141312]"
                          : "bg-[#FAF8F5] border-[#C5A059]/30 text-[#5E564F]"
                      }`}
                    >
                      Left Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setEarVisibility("right_only")}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        earVisibility === "right_only"
                          ? "bg-[#141312] text-[#FAF8F5] border-[#141312]"
                          : "bg-[#FAF8F5] border-[#C5A059]/30 text-[#5E564F]"
                      }`}
                    >
                      Right Only
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleApplyAdjustment}
                  disabled={isApplyingAdjustment}
                  className="px-3.5 py-1 rounded-lg bg-[#C5A059] text-[#141312] font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1"
                >
                  <Sparkles size={11} />
                  <span>{isApplyingAdjustment ? "Updating..." : "Update"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INTERACTIVE BEFORE / AFTER SLIDER DISPLAY ─── */}
      <div className="flex justify-center">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className={`relative aspect-[3/4] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C5A059]/40 cursor-ew-resize select-none bg-black ${
            isFullscreen ? "fixed inset-4 z-50 max-w-none aspect-auto m-auto" : ""
          }`}
        >
          {/* Base: The AI Try-On Result */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={isComparingHeld ? result.originalImageUrl : result.resultImageUrl}
              alt="AI Try-On Result"
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Overlay: The Original Image revealed by the slider */}
          {!isComparingHeld && result.originalImageUrl && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative w-full h-full" style={{ width: containerRef.current?.clientWidth || "100%" }}>
                <Image
                  src={result.originalImageUrl}
                  alt="Original"
                  fill
                  sizes="(max-width: 768px) 100vw, 448px"
                  className="object-cover object-center"
                />
                {/* Original Label Tag */}
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[10px] uppercase font-sans font-semibold tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                  Original
                </div>
              </div>
            </div>
          )}

          {/* Try-On Result Label Tag */}
          {!isComparingHeld && (
            <div className="absolute top-4 right-4 bg-[#C5A059] text-[#141312] text-[10px] uppercase font-sans font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md">
              AI Try-On ✨
            </div>
          )}

          {/* Slider Divider Bar */}
          {!isComparingHeld && (
            <div
              className="absolute top-0 bottom-0 w-[2.5px] bg-[#FAF8F5] shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#141312] border-2 border-[#C5A059] text-[#C5A059] flex items-center justify-center shadow-lg">
                <SlidersHorizontal size={13} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slider Hint */}
      <p className="text-center text-xs text-[#7A726A] font-sans">
        ← Drag the gold divider to compare the original photo with your AI Virtual Try-On →
      </p>

      {/* ─── ACTION BAR (ADD TO BAG / SHARE / RETRY) ─── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#C5A059]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Price & Product Summary */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#C5A059]/40 bg-[#FAF8F5] p-1 flex-shrink-0">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-[#141312] leading-tight">
              ₹{product.price}
            </p>
            <p className="text-[11px] text-[#5E564F] font-sans truncate max-w-[200px]">
              {product.title}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-gold px-6 py-3 text-xs font-semibold shadow-md hover:shadow-xl transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <ShoppingBag size={15} />
            <span>Add to Bag · ₹{product.price}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-3 rounded-full bg-[#FAF8F5] border border-[#C5A059]/30 text-[#141312] hover:bg-white hover:border-[#C5A059] transition-all"
            title="Share Try-On"
          >
            {isCopied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-3 rounded-full bg-[#FAF8F5] border border-[#C5A059]/30 text-[#141312] hover:bg-white hover:border-[#C5A059] transition-all"
            title="Download result image"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* ─── RETRY OR TRY ANOTHER PRODUCT ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-sans">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetryCharacter}
            className="text-[#5E564F] hover:text-[#C5A059] transition-colors flex items-center gap-1"
          >
            <RefreshCw size={12} />
            <span>Try Another Model</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onRetrySelf}
            className="text-[#5E564F] hover:text-[#C5A059] transition-colors flex items-center gap-1"
          >
            <span>Upload Another Photo</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#141312] font-medium hover:text-[#C5A059] transition-colors"
        >
          Continue Shopping →
        </button>
      </div>

      {/* Subtle Luxury Disclaimer */}
      <p className="text-[11px] text-[#928980] font-sans text-center leading-relaxed">
        AI-generated preview. Actual appearance may vary slightly depending on lighting, angle and screen resolution.
      </p>
    </div>
  );
}
