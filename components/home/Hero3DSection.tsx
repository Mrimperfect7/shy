"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Sparkles } from "lucide-react";

export default function Hero3DSection() {
  return (
    <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#FAF8F5] -mt-24 pt-24">
      {/* Static Premium Hero Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/assets/hero-jewellery.jpg"
          alt="SHYN.ISH Luxury 18K PVD Gold Jewellery"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Editorial Luxury Scrim & Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-[#FAF8F5]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/50 via-transparent to-[#FAF8F5]" />
      </div>

      {/* Hero Typography & Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full text-center flex flex-col items-center pointer-events-none">
        
        {/* Brand Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141312]/85 backdrop-blur-md border border-[#C5A059]/40 text-[#FAF8F5] mb-6 pointer-events-auto shadow-sm">
          <Sparkles size={13} className="text-[#C5A059]" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-sans font-medium">
            18K PVD Gold · Jewellery Under ₹480
          </span>
        </div>

        {/* Main Cinematic Title */}
        <h1 className="hero-title text-center max-w-4xl tracking-tight text-[#141312] select-none">
          EVERYDAY SHINE.
          <br />
          <span className="font-serif italic font-normal text-[#C5A059]">EFFORTLESS STYLE.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-[#4A423B] font-sans max-w-xl font-normal tracking-wide select-none">
          Jewellery crafted for modern femininity. 18K PVD gold plated & 316/304 stainless steel pieces designed to make you sparkle every day.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
          <Link
            href="/shop"
            className="btn-gold px-8 py-3.5 shadow-md hover:shadow-xl transition-all"
            data-cursor="SHOP"
          >
            Shop Now
          </Link>
          <a
            href="#categories"
            className="btn-outline px-8 py-3.5 backdrop-blur-md bg-white/70 shadow-sm hover:bg-white transition-all"
            data-cursor="EXPLORE"
          >
            Explore Collection
          </a>
        </div>

        {/* Trust Badges under CTAs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#4A423B] font-sans font-medium">
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#C5A059]/25 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>Anti-Tarnish Everyday Wear</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#C5A059]/25 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>All India Delivery</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#C5A059]/25 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span>Best Price. Honest Quality</span>
          </div>
        </div>

      </div>

      {/* Subtle Scroll Down Prompt */}
      <a
        href="#trust-strip"
        aria-label="Scroll to content"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-sans text-[#5E564F]/80 hover:text-[#C5A059] transition-colors z-20 pointer-events-auto"
      >
        <span>Scroll to Discover</span>
        <ArrowDown size={13} className="animate-bounce" />
      </a>
    </section>
  );
}
