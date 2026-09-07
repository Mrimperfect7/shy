"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Sparkles, ShieldCheck, Heart, ArrowRight, Star } from "lucide-react";

export default function Hero3DSection() {
  return (
    <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF8F5] pt-12 pb-16 lg:py-24">
      {/* Background Architectural Glow / Subtle Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#C5A059]/10 via-[#C5A059]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* LEFT COLUMN: THE HOUSEWIFE FOUNDER STORY & COPY (7 COLS ON LG) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left order-2 lg:order-1">
            
            {/* Story Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141312] border border-[#C5A059]/40 text-[#FAF8F5] mb-5 shadow-sm">
              <Sparkles size={12} className="text-[#C5A059]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium">
                A Homemaker’s Heart · 18K Gold Under ₹480
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.4rem] xl:text-[3.8rem] text-[#141312] font-normal tracking-tight leading-[1.08] mb-6">
              Too Shy For The Spotlight.
              <br />
              <span className="italic font-normal text-[#C5A059]">
                Bold Enough To Redefine Luxury.
              </span>
            </h1>

            {/* Heartfelt Founder Narrative */}
            <div className="space-y-3.5 text-[#4A423B] font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
              <p className="font-normal">
                For years, my days revolved around quiet household chores and caring for my family. 
                Like millions of Indian homemakers, I had a secret passion for jewellery — but was heartbroken seeing women choose between brass pieces that turned black in a week and real gold locked away in bank lockers.
              </p>
              <p className="font-light text-[#5E564F]">
                One afternoon, from my own dining table, I took our modest household savings to solve this once and for all. 
                No showroom rents. No celebrity margins. Just surgical-grade 316L steel coated in durable <strong>18K PVD Gold</strong> that withstands cooking, dishwashing, perfume, and daily wear — honestly priced under ₹480.
              </p>
            </div>

            {/* Founder Note Quote */}
            <div className="mt-5 p-4 rounded-2xl bg-white/80 border border-[#C5A059]/30 shadow-xs max-w-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] flex-shrink-0">
                <Heart size={18} fill="#C5A059" className="text-[#C5A059]" />
              </div>
              <p className="text-xs sm:text-[13px] text-[#2C2723] font-serif italic leading-snug">
                &ldquo;When you wear SHYN.ISH, you wear an honest dream made by a woman who believes every Indian homemaker deserves to sparkle without guilt.&rdquo;
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/shop"
                className="btn-gold px-8 py-3.5 text-xs font-semibold shadow-md hover:shadow-xl transition-all flex items-center gap-2"
                data-cursor="SHOP"
              >
                <span>Shop My Collection (Under ₹480)</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href="#founder-faq"
                className="btn-outline px-6 py-3.5 text-xs backdrop-blur-md bg-white/70 shadow-sm hover:bg-white transition-all text-[#141312]"
              >
                Read Founder Story & FAQ
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 pt-6 border-t border-[#C5A059]/20 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#5E564F] font-sans">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span className="font-medium text-[#181614]">18K PVD Gold Anti-Tarnish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span className="font-medium text-[#181614]">Direct from Homemaker</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span className="font-medium text-[#181614]">All India Delivery</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: THE FOUNDER IN ARCHWAY PHOTOGRAPH (5 COLS ON LG) */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full aspect-[923/1024] rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#C5A059]/30 group">
              
              {/* The Uploaded Heritage Photograph */}
              <Image
                src="/assets/hero-housewife-story.jpg"
                alt="SHYN.ISH Founder — A Homemaker's Journey in Royal Mughal Arches"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
              />

              {/* Editorial Warm Vignette & Soft Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/75 via-transparent to-black/10 pointer-events-none" />

              {/* Floating Badge on Image */}
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C5A059]/40 shadow-md flex items-center gap-1.5">
                <Star size={12} className="text-[#C5A059] fill-[#C5A059]" />
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-[#141312]">
                  Authentic Story
                </span>
              </div>

              {/* Floating Bottom Card Over Image */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#141312]/85 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white shadow-lg">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-sans font-medium mb-1">
                  The Woman Behind The Brand
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-white/90 leading-snug">
                  &ldquo;Behind these shy hands is a quiet resolve to make every Indian woman shine in real 18K gold quality.&rdquo;
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Subtle Scroll Down Prompt */}
      <a
        href="#trust-strip"
        aria-label="Scroll to discover collection"
        className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-[9px] tracking-[0.22em] uppercase font-sans text-[#5E564F]/80 hover:text-[#C5A059] transition-colors pointer-events-auto"
      >
        <span>Scroll to Discover</span>
        <ArrowDown size={12} className="animate-bounce" />
      </a>
    </section>
  );
}
