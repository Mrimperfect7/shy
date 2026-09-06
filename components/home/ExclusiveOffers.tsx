"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ShoppingBag, Clock, Star, Leaf, Loader2 } from "lucide-react";

/* ─── Offer type (mirrors OfferSettings DB model) ────────────────────── */
interface OfferData {
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
  imageUrl?: string;
  isActive: boolean;
}

/* ─── Countdown timer hook ───────────────────────────────────────────── */
function useCountdown(hours: number) {
  const [timeLeft, setTimeLeft] = useState({ h: hours, m: 0, s: 0 });
  useEffect(() => {
    let end: number;
    const storedEnd = localStorage.getItem("shyn_offer_end_time");
    
    if (storedEnd) {
      end = parseInt(storedEnd, 10);
      // If timer has expired, reset it
      if (end < Date.now()) {
        end = Date.now() + hours * 3600 * 1000;
        localStorage.setItem("shyn_offer_end_time", end.toString());
      }
    } else {
      end = Date.now() + hours * 3600 * 1000;
      localStorage.setItem("shyn_offer_end_time", end.toString());
    }

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hours]);
  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function TimeSegment({ value, label, light }: { value: number; label: string; light?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[2.6rem]">
      <div
        className="font-serif font-bold leading-none tabular-nums"
        style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", color: light ? "#fff" : "var(--charcoal)" }}
      >
        {pad(value)}
      </div>
      <span
        className="font-sans text-[8px] tracking-widest uppercase mt-1"
        style={{ color: light ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────── */
export default function ExclusiveOffers() {
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offer-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.offer && data.offer.isActive) {
          const o = data.offer;
          setOffer({
            ...o,
            items: Array.isArray(o.items) ? o.items : JSON.parse(o.items || "[]"),
          });
        } else {
          setOffer(null);
        }
      })
      .catch(() => setOffer(null))
      .finally(() => setLoading(false));
  }, []);

  const countdown = useCountdown(offer?.countdownHours ?? 48);
  const { h, m, s } = countdown;

  /* Don't render anything if loading, paused, or inactive */
  if (loading || !offer || !offer.isActive) {
    return null;
  }

  const originalPrice = offer.originalPrice;
  const salePrice = offer.salePrice;
  const saved = originalPrice - salePrice;
  const savePct = Math.round((saved / originalPrice) * 100);

  return (
    <section
      aria-labelledby="offers-title"
      className="py-8 lg:py-16 relative overflow-hidden"
      style={{ background: "var(--ivory)" }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #F5C97A 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #C9D1C7 0%, transparent 70%)" }}
      />

      <div className="max-w-8xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="section-eyebrow justify-center mb-2">Exclusive Offers</p>
          <h2
            id="offers-title"
            className="font-serif"
            style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: "var(--charcoal)", lineHeight: 1.15 }}
          >
            {offer.title}.{" "}
            <span style={{ color: "#C47B1A" }}>Celebrate with SHYN.ISH.</span>
          </h2>
          <p className="font-sans text-sm mt-2 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            {offer.description}
          </p>
        </div>

        {/* Hero deal card */}
        <div className="relative rounded-3xl overflow-hidden mx-auto shadow-2xl" style={{ maxWidth: 960 }}>
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(130deg, #041707 0%, #0A3B12 45%, #1A4B22 100%)" }}
          />
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 12px),repeating-linear-gradient(-45deg,#fff 0px,#fff 1px,transparent 1px,transparent 12px)",
            }}
          />
          {/* Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-25 pointer-events-none"
            style={{ background: "radial-gradient(circle,#FFD700 0%,transparent 70%)", transform: "translate(30%,-30%)" }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left: offer details */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-sans font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,215,0,0.18)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.35)" }}
                >
                  {offer.emoji} {offer.label}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase font-sans font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  Save ₹{saved}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase font-sans font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  Limited Time
                </span>
              </div>

              <h3
                className="font-serif font-bold mb-2 leading-tight"
                style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", color: "#fff" }}
              >
                {offer.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                {offer.subtitle}
              </p>

              {/* Included items */}
              <ul className="space-y-1.5 mb-6">
                {offer.items.filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-sans text-xs sm:text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                    <Leaf size={12} style={{ color: "#FFD700", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-serif font-bold" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff" }}>
                  ₹{salePrice}
                </span>
                <span className="font-sans text-sm sm:text-base line-through" style={{ color: "rgba(255,255,255,0.45)" }}>
                  ₹{originalPrice}
                </span>
                <span
                  className="font-sans text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: "#FFD700", color: "#2D1A00" }}
                >
                  Save ₹{saved}
                </span>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href={offer.href}
                  id="onam-offer-cta"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  style={{ background: "#FFD700", color: "#2D1A00", boxShadow: "0 6px 24px rgba(255,215,0,0.35)" }}
                >
                  <ShoppingBag size={15} />
                  {offer.cta}
                </Link>
              </div>
            </div>

            {/* Right: Product Image + countdown + stars */}
            <div
              className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 relative"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.15)" }}
            >
              {/* Product Image Showcase */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mb-4 group">
                <div className="absolute inset-0 rounded-full bg-[#FFD700]/10 blur-xl scale-90 group-hover:scale-100 transition-transform duration-700" />
                <Image
                  src={offer.imageUrl || "/assets/products/necklace-pendant.jpg"}
                  alt={offer.title || "SHYN.ISH Exclusive Offer Product"}
                  fill
                  className="object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 180px, 220px"
                />
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                <Clock size={13} className="animate-pulse" style={{ color: "#FFD700" }} />
                <span className="font-sans text-[10px] tracking-widest uppercase font-semibold">Offer expires in</span>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <TimeSegment value={h} label="hrs" light />
                <span className="font-serif font-bold text-2xl mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>:</span>
                <TimeSegment value={m} label="min" light />
                <span className="font-serif font-bold text-2xl mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>:</span>
                <TimeSegment value={s} label="sec" light />
              </div>

              <div className="w-4/5 mb-3" style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />

              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill="#FFD700" stroke="none" />
                ))}
              </div>
              <p className="font-serif text-base font-medium" style={{ color: "#fff" }}>4.9 / 5</p>
              <p className="font-sans text-[10px] text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                Based on 200+ verified reviews
              </p>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {["Handcrafted in small batches", "Fast delivery across India", "100% natural ingredients", "Made in Kerala"].map((note) => (
            <p key={note} className="font-sans text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "#C47B1A" }}>✓</span> {note}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
