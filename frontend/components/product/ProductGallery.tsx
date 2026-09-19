"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface ProductGalleryProps {
  images: { url: string; altText: string }[];
  productId?: string;
}

export default function ProductGallery({ images, productId }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto aspect-square bg-gray-100 animate-pulse rounded-2xl" />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sticky top-28 w-full max-w-md mx-auto">
      {/* Desktop Main Image & Mobile Carousel */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-[#F8F6F2] border border-gray-100 shadow-sm flex items-center justify-center">
        {images.map((image, i) => (
          <div 
            key={`desktop-${i}`} 
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 hidden md:flex items-center justify-center p-1.5 ${i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
             <Image
                src={image.url}
                alt={image.altText || "Product Image"}
                fill
                priority={i === 0}
                unoptimized={true}
                className="object-contain w-full h-full"
                sizes="(max-width: 768px) 90vw, 500px"
             />
          </div>
        ))}
        
        {/* Mobile Swipeable View */}
        <div 
          className="flex w-full h-full md:hidden snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== activeIndex) {
              setActiveIndex(index);
            }
          }}
        >
          {images.map((image, i) => (
            <div key={`mobile-${i}`} className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center p-1.5">
               <Image
                  src={image.url}
                  alt={image.altText || "Product Image"}
                  fill
                  priority={i === 0}
                  unoptimized={true}
                  className="object-contain w-full h-full"
                  sizes="(max-width: 768px) 90vw, 500px"
               />
            </div>
          ))}
        </div>

        {/* Floating Quick Action: 3D Try-On (code-rendered, no AI) */}
        {productId && (
          <Link
            href={`/customizer?product=${encodeURIComponent(productId)}`}
            data-testid="gallery-try-on-button"
            className="absolute bottom-3.5 right-3.5 z-20 bg-[#141312]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C5A059]/40 text-[#FAF8F5] text-[11px] font-sans font-semibold shadow-md hover:bg-[#141312] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 group cursor-pointer"
            title="3D Try-On Showroom"
          >
            <Sparkles size={13} className="text-[#C5A059] animate-pulse" />
            <span>3D Try On</span>
          </Link>
        )}
      </div>

      {/* Mobile Pagination Dots */}
      <div className="md:hidden flex justify-center gap-1.5 mt-1">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-5 bg-[var(--forest)]" : "w-1.5 bg-gray-300"}`} />
        ))}
      </div>

      {/* Desktop Thumbnails */}
      {images.length > 1 && (
        <div className="hidden md:flex justify-center gap-2.5 overflow-x-auto scrollbar-hide py-1">
          {images.map((image, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-[#F8F6F2] p-0.5 ${
                i === activeIndex ? "border-[var(--forest)] shadow-sm scale-105" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${i + 1}`}
                fill
                unoptimized={true}
                className="object-contain w-full h-full"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
