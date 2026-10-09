"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function HeroScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !triggerRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top top",
        end: "+=350",
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
      }
    });

    // Subtle parallax scale on the background image
    tl.to(".hero-bg-image", {
      scale: 1.05,
      y: 15,
      ease: "power1.out",
      duration: 1
    }, 0)
    // Fade out text cleanly at the end of the single scroll
    .to(".hero-content-wrapper", {
      opacity: 0,
      y: -20,
      ease: "power1.out",
      duration: 0.8
    }, 0.2);

  }, { scope: containerRef });

  return (
    <div ref={triggerRef} className="bg-[#080605] overflow-hidden">
      <section 
        ref={containerRef} 
        className="relative w-full h-[100svh] min-h-[600px] overflow-hidden flex items-center justify-start isolate"
      >
        
        {/* Full-screen Hero Background Image */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Image 
            src="/assets/hero-jewelry-dark.jpg" 
            alt="SHYN.ISH Luxury Jewelry" 
            fill
            priority
            className="hero-bg-image object-cover object-center origin-center md:object-[center_60%]" 
            sizes="100vw"
            quality={90}
          />
        </div>

        {/* Gradient Overlays for Readability */}
        <div 
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: `
              linear-gradient(90deg, rgba(8, 6, 5, 0.85) 0%, rgba(8, 6, 5, 0.4) 45%, rgba(8, 6, 5, 0.1) 100%),
              linear-gradient(180deg, rgba(8, 6, 5, 0.4) 0%, rgba(8, 6, 5, 0.05) 45%, rgba(8, 6, 5, 0.7) 100%)
            `
          }}
        />

        {/* Content Wrapper */}
        <div className="hero-content-wrapper relative z-10 flex flex-col items-start justify-center w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-[-5vh]">
          
          <div className="flex flex-col items-start mb-6">
            <p className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#e5d5b5] mb-3 font-sans font-medium opacity-90">
              Fine Elegance
            </p>
          </div>
          
          <div className="relative w-48 sm:w-64 md:w-80 aspect-[700/296] mb-8">
            <Image
              src="/assets/shyn-logo.png"
              alt="SHYN.ISH"
              fill
              priority
              className="object-contain object-left invert brightness-0"
            />
          </div>

          <div className="text-left mb-10 max-w-lg">
            <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-white tracking-wide leading-[1.1] mb-5">
              CRAFTED FOR YOU.
            </h1>
            
            <p className="font-sans text-[clamp(0.9rem,1.5vw,1.1rem)] text-[#d4c9b9] opacity-90 tracking-wide font-light max-w-md">
              Timeless Jewellery for Modern Life
            </p>
          </div>

          <Link 
            href="/shop" 
            className="group relative inline-flex items-center justify-center gap-3 bg-[#e5d5b5] text-[#1a1714] px-8 py-4 text-xs sm:text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:bg-white overflow-hidden"
          >
            <span className="relative z-10">Explore Collection</span>
            <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-6 md:left-12 lg:left-20 flex items-center gap-3 opacity-70 z-10">
          <div className="w-[18px] h-[30px] border border-[#d4c9b9] rounded-full flex justify-center p-1">
            <div className="w-[3px] h-[3px] bg-[#d4c9b9] rounded-full animate-bounce mt-1"></div>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4c9b9]">Scroll</span>
        </div>

      </section>
    </div>
  );
}
