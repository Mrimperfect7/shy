"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, ArrowRight, Star, CheckCircle2 } from "lucide-react";

export default function AboutFounderSection() {
  return (
    <section id="about-founder" className="relative py-20 lg:py-28 bg-[#FAF8F5] border-t border-[#C5A059]/20 overflow-hidden">
      {/* Background Architectural Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[500px] bg-gradient-to-r from-[#C5A059]/10 via-[#FAF8F5] to-[#C5A059]/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141312] border border-[#C5A059]/40 text-[#FAF8F5] text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium shadow-sm">
            <Sparkles size={12} className="text-[#C5A059]" />
            <span>The Heart Behind The Brand</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal tracking-tight">
            Our Founder’s Journey
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#5E564F] font-light leading-relaxed">
            From a quiet family dining table to revolutionizing everyday luxury jewellery for women across India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN: THE HOUSEWIFE FOUNDER STORY & COPY (7 COLS ON LG) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left order-2 lg:order-1">
            
            {/* Story Subheading */}
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-[2.6rem] text-[#141312] font-normal tracking-tight leading-[1.12] mb-6">
              Too Shy For The Spotlight.
              <br />
              <span className="italic font-normal text-[#C5A059]">
                Bold Enough To Redefine Luxury.
              </span>
            </h3>

            {/* Heartfelt Founder Narrative */}
            <div className="space-y-4 text-[#4A423B] font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
              <p className="font-normal">
                For years, my days revolved around quiet household chores and caring for my family. 
                Like millions of Indian homemakers, I had a secret passion for jewellery — but was heartbroken seeing women choose between brass pieces that turned black in a week and real gold locked away in bank lockers.
              </p>
              <p className="font-light text-[#5E564F]">
                One afternoon, from my own dining table, I took our modest household savings to solve this once and for all. 
                No showroom rents. No celebrity margins. Just surgical-grade 316L steel coated in durable <strong className="text-[#141312] font-semibold">18K PVD Gold</strong> that withstands cooking, dishwashing, perfume, and daily wear — honestly priced under ₹480.
              </p>
            </div>

            {/* Founder Note Quote */}
            <div className="mt-6 p-5 rounded-2xl bg-white/90 border border-[#C5A059]/35 shadow-sm max-w-xl flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059] flex-shrink-0 mt-0.5 sm:mt-0">
                <Heart size={20} fill="#C5A059" className="text-[#C5A059]" />
              </div>
              <p className="text-xs sm:text-[13px] text-[#2C2723] font-serif italic leading-relaxed">
                &ldquo;When you wear SHYN.ISH, you wear an honest dream made by a woman who believes every Indian homemaker deserves to sparkle without guilt.&rdquo;
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/shop"
                className="btn-gold px-7 py-3.5 text-xs font-semibold shadow-md hover:shadow-xl transition-all flex items-center gap-2"
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
            <div className="mt-10 pt-6 border-t border-[#C5A059]/25 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#5E564F] font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span className="font-medium text-[#181614]">18K PVD Gold Anti-Tarnish</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span className="font-medium text-[#181614]">Direct from Homemaker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#C5A059]" />
                <span className="font-medium text-[#181614]">All India Delivery</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: THE FOUNDER IN ARCHWAY PHOTOGRAPH (5 COLS ON LG) */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full aspect-[923/1024] rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#C5A059]/35 group bg-[#EFECE6]">
              
              {/* The Uploaded Heritage Photograph */}
              <Image
                src="/assets/hero-housewife-story.jpg"
                alt="SHYN.ISH Founder — A Homemaker's Journey in Royal Mughal Arches"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
              />

              {/* Editorial Warm Vignette & Soft Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/80 via-transparent to-black/10 pointer-events-none" />

              {/* Floating Badge on Image */}
              <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 shadow-md flex items-center gap-1.5">
                <Star size={13} className="text-[#C5A059] fill-[#C5A059]" />
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-[#141312]">
                  Authentic Story
                </span>
              </div>

              {/* Floating Bottom Card Over Image */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#141312]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-white shadow-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-sans font-medium mb-1">
                  The Woman Behind The Brand
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-white/95 leading-snug">
                  &ldquo;Behind these shy hands is a quiet resolve to make every Indian woman shine in real 18K gold quality.&rdquo;
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
