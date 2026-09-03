"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/shopify/products";
import { useCart } from "@/context/CartContext";

interface StickyPurchaseBarProps {
  product: any;
}

export default function StickyPurchaseBar({ product }: StickyPurchaseBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, isLoading } = useCart();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past the main hero section (approx 800px)
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAdd = async () => {
    setAdding(true);
    await addItem(product, 1);
    setAdding(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 z-50 transform transition-transform duration-300 translate-y-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Product Info (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center gap-3">
          {product.featuredImage && (
            <div className="relative w-12 h-12 rounded bg-gray-100 overflow-hidden">
              <Image 
                src={product.featuredImage.url} 
                alt={product.title} 
                fill 
                className="object-cover" 
              />
            </div>
          )}
          <div>
            <h4 className="font-serif text-charcoal font-medium leading-tight line-clamp-1">{product.title}</h4>
            <span className="font-sans text-sm text-gray-500">{formatPrice(product.price.toString(), "INR")}</span>
          </div>
        </div>

        {/* Price for mobile */}
        <div className="sm:hidden font-sans font-semibold text-charcoal">
          {formatPrice(product.price.toString(), "INR")}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAdd}
          disabled={adding || isLoading || !product.availableForSale}
          className="btn-primary flex-shrink-0 px-6 sm:px-12 h-11 text-xs uppercase tracking-widest rounded-lg"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

      </div>
    </div>
  );
}
