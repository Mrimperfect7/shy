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
        end: "+=350", // Completes smoothly in one single natural scroll
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
      }
    });

    // Subtle parallax scale on the background image
    tl.to(".hero-bg-image", {
      scale: 1.1,
      y: 30,
      ease: "power1.out",
      duration: 1
    }, 0)
    // Fade out text cleanly at the end of the single scroll
    .to(".hero-content-wrapper", {
      opacity: 0,
      y: -40,
      ease: "power1.out",
      duration: 0.8
    }, 0.2);

  }, { scope: containerRef });

  return (
    <div ref={triggerRef} className="bg-[#EAE5D9] overflow-hidden">
      <section 
        ref={containerRef} 
        className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      >
        
        {/* Full-screen Hero Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-center">
          <Image 
            src="/assets/herobg.jpg" 
            alt="Eshara Luxury Botanical Skincare" 
            fill
            priority
            className="hero-bg-image object-cover md:object-cover object-center origin-center md:block hidden" 
            sizes="100vw"
          />
          {/* Mobile specific image rendering */}
          <Image 
            src="/assets/herobg-mobile.png" 
            alt="Eshara Luxury Botanical Skincare" 
            fill
            priority
            className="hero-bg-image object-cover object-center origin-center md:hidden block" 
            sizes="100vw"
          />
        </div>

        {/* Central Content */}
        <div className="hero-content-wrapper absolute z-20 flex flex-col items-center justify-center w-full px-4 pointer-events-auto mt-[-5vh]">
          
          <div className="flex flex-col items-center mb-4">
            <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-[var(--forest)] mb-2 font-sans font-medium">The Power of Nature</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[1px] w-8 bg-[var(--forest)] opacity-50"></div>
              <span className="text-[var(--forest)] text-lg">🌿</span>
              <div className="h-[1px] w-8 bg-[var(--forest)] opacity-50"></div>
            </div>
          </div>
          
          <div className="relative w-64 sm:w-80 md:w-[400px] aspect-[700/296] mb-2">
            <Image
              src="/assets/eshara-logo.png"
              alt="Eshara Naturals"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h4 className="font-serif text-[1.2rem] sm:text-2xl md:text-[1.8rem] text-[var(--forest)] tracking-widest leading-tight mb-3">
              NURTURE BY NATURE.
            </h4>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-12 bg-[var(--forest)] opacity-30"></div>
              <span className="text-[var(--forest)] opacity-50 text-xs">❖</span>
              <div className="h-[1px] w-12 bg-[var(--forest)] opacity-30"></div>
            </div>
            
            <p className="font-sans text-[0.8rem] sm:text-sm text-[var(--forest)] opacity-80 tracking-wide">
              From Ayurvedic Roots to Modern Rituals
            </p>
          </div>

          <Link href="/products/eshara-natural-hair-oil" className="border border-[var(--forest)] bg-[var(--forest)] text-white hover:bg-transparent hover:text-[var(--forest)] transition-colors duration-300 px-6 py-3 text-xs tracking-widest uppercase flex items-center gap-2">
            Shop now <ArrowRight size={14} />
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70">
          <div className="w-[20px] h-[32px] border border-[var(--forest)] rounded-full flex justify-center p-1">
            <div className="w-1 h-1 bg-[var(--forest)] rounded-full animate-bounce"></div>
          </div>
          <span className="text-[8px] uppercase tracking-widest text-[var(--forest)]">Scroll to explore</span>
        </div>

      </section>
    </div>
  );
}
