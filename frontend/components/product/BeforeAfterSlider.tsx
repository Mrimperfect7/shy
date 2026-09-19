"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging]);

  return (
    <section className="py-10 lg:py-28 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">Real Results</h2>
        <p className="font-sans text-sm text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          See the difference our 100% natural, slow-crafted hair oil makes. Consistent use promotes healthier, thicker, and more nourished hair.
        </p>

        <div 
          ref={containerRef}
          className="relative w-full max-w-lg mx-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-medium select-none cursor-ew-resize touch-none"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
        >
          {/* After Image (Background) */}
          <div className="absolute inset-0">
            <Image 
              src="/assets/after.jpg" 
              alt="After using Eshara" 
              fill
              className="object-cover pointer-events-none"
              style={{ transform: "scale(1.1) translateY(3.6%)" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-sans font-bold tracking-wider uppercase text-charcoal shadow-sm">
              After
            </div>
          </div>

          {/* Before Image (Foreground, clipped) */}
          <div 
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image 
              src="/assets/before.jpg" 
              alt="Before using Eshara" 
              fill
              className="object-cover pointer-events-none"
              style={{ transform: "scale(1.1) translateY(-3.6%)" }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-sans font-bold tracking-wider uppercase text-charcoal shadow-sm">
              Before
            </div>
          </div>

          {/* Slider Line & Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none shadow-[0_0_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-charcoal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                <path d="M15 18l-6-6 6-6" />
                <path d="M9 18l6-6-6-6" className="rotate-180 origin-center" />
              </svg>
            </div>
          </div>
        </div>
        
        <p className="font-sans text-xs text-gray-400 mt-4">Slide to compare before and after</p>
      </div>
    </section>
  );
}
