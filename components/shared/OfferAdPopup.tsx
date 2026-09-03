"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  ShieldCheck,
  Tag
} from "lucide-react";

interface OfferData {
  id: string;
  label: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  href: string;
  cta: string;
  countdownHours: number;
  items: string[];
  imageUrl?: string | null;
  isActive: boolean;
}

export default function OfferAdPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [offer, setOffer] = useState<OfferData | null>(null);

  useEffect(() => {
    // Check if dismissed in current session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("eshara_offer_ad_dismissed");
      if (dismissed === "true") return;
    }

    // Fetch active offer from API
    fetch("/api/offer-settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.offer && data.offer.isActive) {
          const rawItems = data.offer.items;
          const parsedItems = Array.isArray(rawItems)
            ? rawItems
            : typeof rawItems === "string"
            ? JSON.parse(rawItems || "[]")
            : [];

          setOffer({
            ...data.offer,
            items: parsedItems,
          });

          // Show popup after a smooth 1.8s delay
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 1800);

          return () => clearTimeout(timer);
        }
      })
      .catch((err) => console.error("Failed to load offer popup:", err));
  }, []);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("eshara_offer_ad_dismissed", "true");
      window.dispatchEvent(new Event("eshara_offer_ad_closed"));
    }
  };

  if (!isOpen || !offer || !offer.isActive) return null;

  const originalPrice = offer.originalPrice;
  const salePrice = offer.salePrice;
  const saved = Math.max(0, originalPrice - salePrice);
  const savePct = originalPrice > 0 ? Math.round((saved / originalPrice) * 100) : 0;
  const prodImg = offer.imageUrl || "/assets/layered-bottle.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Backdrop click to close */}
      <div 
        className="fixed inset-0" 
        onClick={handleClose} 
        aria-hidden="true" 
      />

      {/* Ad Card Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={offer.title}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B2E15] via-[#071F0C] to-[#041208] text-white shadow-2xl border border-[#235831] animate-in zoom-in-95 slide-in-from-bottom-6 duration-300"
      >
        
        {/* Decorative Golden Glow Blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#FFD700]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-[#25D366]/15 blur-3xl" />

        {/* ── Top Floating Close Button ──────────────────────────────── */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close special offer advertisement"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer shadow-md active:scale-95"
        >
          <X size={17} />
        </button>

        {/* ── Header Badge Bar ────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-2 relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-widest bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shadow-xs">
            <Sparkles size={12} />
            <span>{offer.emoji} {offer.label}</span>
          </span>

          {savePct > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-[#25D366]/20 text-[#4ADE80] border border-[#25D366]/30 mr-8">
              <Tag size={10} />
              <span>{savePct}% OFF</span>
            </span>
          )}
        </div>

        {/* ── Main Content Grid ───────────────────────────────────────── */}
        <div className="p-6 pt-2 relative z-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            
            {/* Left: Product Image Showcase */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-44 sm:w-full sm:h-48 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden shadow-inner group">
                <Image
                  src={prodImg}
                  alt={offer.title}
                  fill
                  className="object-contain p-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  sizes="180px"
                />
                
                {saved > 0 && (
                  <div className="absolute bottom-2 inset-x-2 bg-[#FFD700] text-[#1A1A1A] text-[10px] font-sans font-extrabold uppercase tracking-wider py-1 rounded-lg text-center shadow-md">
                    Save ₹{saved} Today
                  </div>
                )}
              </div>
            </div>

            {/* Right: Headline & Details */}
            <div className="sm:col-span-7 space-y-2.5 text-left">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  {offer.title}
                </h3>
                <p className="font-sans text-xs text-white/70 mt-1 line-clamp-2">
                  {offer.subtitle || offer.description}
                </p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="font-serif text-3xl font-bold text-[#FFD700]">
                  ₹{salePrice}
                </span>
                {originalPrice > salePrice && (
                  <span className="font-sans text-sm line-through text-white/50">
                    ₹{originalPrice}
                  </span>
                )}
              </div>

              {/* Highlights List */}
              {offer.items && offer.items.length > 0 && (
                <ul className="space-y-1 pt-1 text-[11px] font-sans text-white/85">
                  {offer.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 truncate">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#25D366]/20 text-[#4ADE80] flex items-center justify-center shrink-0">
                        <Check size={9} strokeWidth={3} />
                      </span>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* ── Action Buttons ─────────────────────────────────────────── */}
          <div className="mt-6 space-y-2.5">
            <Link
              href={offer.href || "/shop"}
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FFD700] hover:bg-[#F5C800] text-[#1A1A1A] font-sans font-bold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-[#FFD700]/30 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>{offer.cta || "Claim Special Offer"}</span>
              <ArrowRight size={16} />
            </Link>

            <div className="flex items-center justify-between text-[11px] font-sans text-white/50 px-1 pt-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={13} /> 100% Authentic Kerala Blend
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="hover:text-white transition-colors underline cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
