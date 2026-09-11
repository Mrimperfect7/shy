"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Droplets, Heart, ArrowDown } from "lucide-react";

export default function LiveJewelleryHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll animations tied to container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    restDelta: 0.001,
  });

  // Parallax scroll trajectories for real jewellery pieces
  // 1. Centerpiece: Liquid Gold Herringbone Snake Chain
  const chainY = useTransform(smoothProgress, [0, 1], [0, 180]);
  const chainRotate = useTransform(smoothProgress, [0, 1], [0, 24]);
  const chainScale = useTransform(smoothProgress, [0, 1], [1, 1.12]);

  // 2. Left piece: Twisted Croissant Hoops
  const hoopsY = useTransform(smoothProgress, [0, 1], [0, -100]);
  const hoopsX = useTransform(smoothProgress, [0, 1], [0, -40]);
  const hoopsRotate = useTransform(smoothProgress, [0, 1], [-6, -22]);
  const hoopsScale = useTransform(smoothProgress, [0, 1], [1, 0.95]);

  // 3. Right piece: Diamond Eternity Band & Ring Stack
  const ringsY = useTransform(smoothProgress, [0, 1], [0, -120]);
  const ringsX = useTransform(smoothProgress, [0, 1], [0, 45]);
  const ringsRotate = useTransform(smoothProgress, [0, 1], [8, 30]);
  const ringsScale = useTransform(smoothProgress, [0, 1], [1, 1.05]);

  // 4. Content fade and lift on scroll
  const contentY = useTransform(smoothProgress, [0, 0.75], [0, -50]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0.15]);

  // Handle gentle mouse parallax tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[96vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#FAF8F5] pt-8 sm:pt-14 pb-8"
    >
      {/* Ambient Architectural Aura & Warm Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[580px] bg-gradient-to-b from-[#ECC880]/20 via-[#D4AF37]/10 to-transparent blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-12 left-6 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-16 right-6 w-80 h-80 bg-[#E8CA82]/15 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* ─── FLOATING LIVE JEWELLERY LAYER 1: CROISSANT HOOPS (LEFT WING) ─── */}
      <motion.div
        style={{
          y: hoopsY,
          x: hoopsX,
          rotate: hoopsRotate,
          scale: hoopsScale,
        }}
        className="absolute top-16 sm:top-24 lg:top-28 left-2 sm:left-6 lg:left-12 xl:left-16 z-10 pointer-events-auto"
      >
        {/* Idle floating physics & mouse response */}
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [0, 3, -2, 0],
          }}
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            x: mousePos.x * -16,
            y: mousePos.y * -14,
          }}
          className="relative group cursor-pointer"
        >
          <Link href="/shop" className="block relative">
            <div className="relative w-28 sm:w-44 md:w-52 lg:w-60 xl:w-64 aspect-square drop-shadow-[0_18px_30px_rgba(197,160,89,0.25)] filter transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/assets/hero/floating-hoops.png"
                alt="SHYN.ISH Luxe Twisted Croissant Hoops - 18K PVD Gold"
                fill
                priority
                sizes="(max-width: 640px) 112px, (max-width: 1024px) 210px, 260px"
                className="object-contain"
              />
              {/* Dynamic Shimmer Glint */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full" />
            </div>

            {/* Interactive Product Tag */}
            <div className="absolute -bottom-2 sm:bottom-1 left-1/2 -translate-x-1/2 bg-[#141312]/92 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#C5A059]/40 shadow-lg whitespace-nowrap opacity-85 group-hover:opacity-100 transition-all group-hover:scale-105">
              <p className="text-[9px] sm:text-[11px] font-sans font-medium text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                <span>Croissant Hoops</span>
                <span className="text-[#C5A059] font-bold">₹185</span>
              </p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* ─── FLOATING LIVE JEWELLERY LAYER 2: SOLITAIRE DIAMOND RING STACK (RIGHT WING) ─── */}
      <motion.div
        style={{
          y: ringsY,
          x: ringsX,
          rotate: ringsRotate,
          scale: ringsScale,
        }}
        className="absolute top-20 sm:top-28 lg:top-32 right-2 sm:right-6 lg:right-12 xl:right-16 z-10 pointer-events-auto"
      >
        {/* Idle floating physics & mouse response */}
        <motion.div
          animate={{
            y: [0, 16, 0],
            rotate: [0, -3, 2, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
          style={{
            x: mousePos.x * 18,
            y: mousePos.y * 16,
          }}
          className="relative group cursor-pointer"
        >
          <Link href="/shop" className="block relative">
            <div className="relative w-28 sm:w-44 md:w-52 lg:w-60 xl:w-64 aspect-square drop-shadow-[0_20px_35px_rgba(218,165,32,0.28)] filter transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/assets/hero/floating-rings.png"
                alt="SHYN.ISH Solitaire Eternity Diamond Band Stack - 18K PVD Gold"
                fill
                priority
                sizes="(max-width: 640px) 112px, (max-width: 1024px) 210px, 260px"
                className="object-contain"
              />
              {/* Dynamic Diamond Starburst Glint */}
              <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-white/80 rounded-full blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping pointer-events-none" />
            </div>

            {/* Interactive Product Tag */}
            <div className="absolute -bottom-2 sm:bottom-1 left-1/2 -translate-x-1/2 bg-[#141312]/92 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#C5A059]/40 shadow-lg whitespace-nowrap opacity-85 group-hover:opacity-100 transition-all group-hover:scale-105">
              <p className="text-[9px] sm:text-[11px] font-sans font-medium text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                <span>Eternity Ring Stack</span>
                <span className="text-[#C5A059] font-bold">₹99</span>
              </p>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* ─── FLOATING LIVE JEWELLERY LAYER 3: LIQUID SNAKE CHAIN CENTERPIECE (BOTTOM AMBIENCE) ─── */}
      <motion.div
        style={{
          y: chainY,
          rotate: chainRotate,
          scale: chainScale,
        }}
        className="absolute -bottom-10 sm:bottom-2 lg:bottom-6 left-1/2 -translate-x-1/2 z-0 pointer-events-none opacity-60 sm:opacity-75 max-w-md sm:max-w-lg lg:max-w-xl w-full"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 1.2, -1.2, 0],
          }}
          transition={{
            duration: 7.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          style={{
            x: mousePos.x * 10,
            y: mousePos.y * 8,
          }}
          className="relative w-full aspect-square max-h-[320px] sm:max-h-[420px] mx-auto filter drop-shadow-[0_22px_40px_rgba(197,160,89,0.25)]"
        >
          <Image
            src="/assets/hero/floating-chain.png"
            alt="SHYN.ISH Liquid Gold Herringbone Snake Chain - 18K PVD Gold"
            fill
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 450px, 600px"
            className="object-contain"
          />
        </motion.div>
      </motion.div>

      {/* ─── MAIN EDITORIAL HERO CONTENT (CLEAN CENTER STAGE) ─── */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOpacity,
        }}
        className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-auto my-auto"
      >
        {/* Eyebrow Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#141312] border border-[#C5A059]/40 text-[#FAF8F5] mb-5 sm:mb-6 shadow-sm"
        >
          <Sparkles size={12} className="text-[#C5A059]" />
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-sans font-medium">
            18K PVD Gold · 100% Anti-Tarnish Under ₹480
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl lg:text-[4.2rem] xl:text-[4.6rem] text-[#141312] font-normal tracking-tight leading-[1.08] mb-5 sm:mb-6 drop-shadow-xs"
        >
          Everyday Shine.
          <br />
          <span className="italic font-normal gold-text">
            Effortless Luxury in Motion.
          </span>
        </motion.h1>

        {/* Narrative Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-sans text-xs sm:text-base lg:text-[1.05rem] text-[#4A423B] font-light leading-relaxed max-w-xl sm:max-w-2xl mb-7 sm:mb-8"
        >
          Medical-grade surgical stainless steel vacuum-bonded with real 18K gold.
          Waterproof, sweatproof, and hypoallergenic — made to live in, priced honestly under ₹480.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <Link
            href="/shop"
            className="btn-gold px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-semibold shadow-lg hover:shadow-2xl transition-all flex items-center gap-2 group"
          >
            <span>Explore Collection Under ₹480</span>
            <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a
            href="#about-founder"
            className="btn-outline px-5 sm:px-6 py-3.5 sm:py-4 text-xs backdrop-blur-md bg-white/80 shadow-sm hover:bg-white hover:border-[#C5A059] transition-all text-[#141312] flex items-center gap-2"
          >
            <Heart size={14} className="text-[#C5A059]" />
            <span>Meet Our Founder</span>
          </a>
        </motion.div>

        {/* Live Feature Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-[#5E564F] font-sans"
        >
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#C5A059]/25 shadow-2xs">
            <Droplets size={13} className="text-[#C5A059]" />
            <span className="font-medium text-[#181614] text-[11px] sm:text-xs">100% Shower & Swim Safe</span>
          </div>
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#C5A059]/25 shadow-2xs">
            <ShieldCheck size={13} className="text-[#C5A059]" />
            <span className="font-medium text-[#181614] text-[11px] sm:text-xs">Zero Skin Discoloration</span>
          </div>
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-full border border-[#C5A059]/25 shadow-2xs">
            <Sparkles size={13} className="text-[#C5A059]" />
            <span className="font-medium text-[#181614] text-[11px] sm:text-xs">Surgical 316L Core</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── BOTTOM TRUST BAR & SCROLL PROMPT ─── */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 w-full mt-4 pt-4 border-t border-[#C5A059]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Metric stats */}
        <div className="flex items-center gap-5 sm:gap-8 text-left">
          <div>
            <p className="font-serif text-base sm:text-xl font-bold text-[#141312] leading-tight">25,000+</p>
            <p className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#7A726A] font-sans">Happy Indian Wearers</p>
          </div>
          <div className="h-6 w-[1px] bg-[#C5A059]/30" />
          <div>
            <p className="font-serif text-base sm:text-xl font-bold text-[#141312] leading-tight">₹480 Max</p>
            <p className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#7A726A] font-sans">Honest Pricing</p>
          </div>
          <div className="h-6 w-[1px] bg-[#C5A059]/30" />
          <div>
            <p className="font-serif text-base sm:text-xl font-bold text-[#141312] leading-tight">18K PVD</p>
            <p className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#7A726A] font-sans">Anti-Tarnish Gold</p>
          </div>
        </div>

        {/* Scroll To Discover Indicator */}
        <a
          href="#trust-strip"
          aria-label="Scroll to discover collection"
          className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-sans text-[#5E564F] hover:text-[#C5A059] transition-colors py-1"
        >
          <span>Scroll to Discover</span>
          <motion.span
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={13} className="text-[#C5A059]" />
          </motion.span>
        </a>
      </div>
    </section>
  );
}
