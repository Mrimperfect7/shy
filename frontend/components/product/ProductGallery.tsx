"use client";

import { useState, lazy, Suspense, useEffect } from "react";
import Image from "next/image";
import { Loader2, Box, Images } from "lucide-react";

// Lazy-load the 3D viewer so it doesn't affect pages without 3D
const Product3DViewer = lazy(() => import("./Product3DViewer"));

interface ProductGalleryProps {
  images: { url: string; altText: string }[];
  productId?: string;
  model3dUrl?: string | null;
}

export default function ProductGallery({ images, productId, model3dUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"images" | "3d">("images");

  const has3D = Boolean(model3dUrl);

  // Listen for the "View in 3D" button click from ProductForm
  useEffect(() => {
    if (!has3D) return;
    const handler = () => setActiveTab("3d");
    window.addEventListener("open-3d-viewer", handler);
    return () => window.removeEventListener("open-3d-viewer", handler);
  }, [has3D]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto aspect-square bg-gray-100 animate-pulse rounded-2xl" />
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sticky top-28 w-full max-w-md mx-auto">

      {/* Tab Toggle — Images / 3D View */}
      {has3D && (
        <div className="flex w-full rounded-xl overflow-hidden border border-[#C5A059]/25 bg-white p-1 gap-1">
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all duration-200 ${
              activeTab === "images"
                ? "bg-[#141312] text-[#FAF8F5] shadow-sm"
                : "text-[#5E564F] hover:text-[#141312] hover:bg-[#FAF8F5]"
            }`}
            aria-label="Show product images"
          >
            <Images size={13} />
            <span>Images</span>
          </button>
          <button
            onClick={() => setActiveTab("3d")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-sans font-semibold transition-all duration-200 ${
              activeTab === "3d"
                ? "bg-[#C5A059] text-white shadow-sm"
                : "text-[#5E564F] hover:text-[#141312] hover:bg-[#FAF8F5]"
            }`}
            aria-label="View product in 3D"
          >
            <Box size={13} />
            <span>View in 3D</span>
          </button>
        </div>
      )}

      {/* ── 3D VIEWER ── */}
      {has3D && activeTab === "3d" && (
        <Suspense
          fallback={
            <div className="w-full aspect-square rounded-2xl bg-[#FAF8F5] border border-[#C5A059]/15 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="text-[#C5A059] animate-spin" />
              <p className="text-xs font-sans text-[#928980]">Loading 3D viewer…</p>
            </div>
          }
        >
          <Product3DViewer
            modelUrl={model3dUrl!}
            productName={images[0]?.altText?.split(" - ")[0] || "Jewellery"}
          />
        </Suspense>
      )}

      {/* ── IMAGE GALLERY (shown when no 3D, or when Images tab is active) ── */}
      {(!has3D || activeTab === "images") && (
        <>
          {/* Desktop Main Image & Mobile Carousel */}
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-[#F8F6F2] border border-gray-100 shadow-sm flex items-center justify-center">
            {images.map((image, i) => (
              <div
                key={`desktop-${i}`}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 hidden md:flex items-center justify-center p-1.5 ${
                  i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
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
                <div
                  key={`mobile-${i}`}
                  className="w-full h-full flex-shrink-0 snap-center relative flex items-center justify-center p-1.5"
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
            </div>

            {/* "3D View Coming Soon" label for products without 3D */}
            {!has3D && (
              <div className="absolute bottom-3 right-3 z-20 bg-[#141312]/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C5A059]/20 text-[10px] font-sans text-[#C5A059]/80">
                3D View Coming Soon
              </div>
            )}
          </div>

          {/* Mobile Pagination Dots */}
          <div className="md:hidden flex justify-center gap-1.5 mt-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-5 bg-[var(--forest)]" : "w-1.5 bg-gray-300"
                }`}
              />
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
                    i === activeIndex
                      ? "border-[var(--forest)] shadow-sm scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
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
        </>
      )}
    </div>
  );
}
