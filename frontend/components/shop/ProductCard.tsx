"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Star, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: any;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const slug = product.slug || product.handle || "";
  const title = product.title || product.name || "SHYN.ISH Jewellery";
  const price = typeof product.price === "number" ? product.price : parseFloat(product.price || "0");
  const compareAtPrice = product.compareAtPrice ? (typeof product.compareAtPrice === "number" ? product.compareAtPrice : parseFloat(product.compareAtPrice)) : null;
  const isSale = compareAtPrice && compareAtPrice > price;
  const discountPercent = isSale ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const imageUrls = product.imageUrls || (product.images?.map((img: any) => img.url || img)) || [];
  const primaryImage = imageUrls[0] || "/assets/products/necklace-pendant.jpg";
  const hoverImage = imageUrls[1] || imageUrls[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shyn_wishlist");
      if (saved) {
        const list = JSON.parse(saved);
        setIsWishlisted(list.includes(slug));
      }
    } catch {}
  }, [slug]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("shyn_wishlist");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(slug)) {
        list = list.filter(item => item !== slug);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        list.push(slug);
        setIsWishlisted(true);
        toast.success("Added to wishlist ✨");
      }
      localStorage.setItem("shyn_wishlist", JSON.stringify(list));
    } catch {}
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem({
      id: product.id || slug,
      title: title,
      price: price,
      image: primaryImage,
      imageUrl: primaryImage,
      quantity: 1,
      variantTitle: product.material || "18K PVD Gold",
    });
    toast.success(`Added ${title} to bag! ✨`, {
      icon: "✨",
      style: {
        background: "#141312",
        color: "#FAF8F5",
        border: "1px solid #C5A059",
      }
    });
    setAdding(false);
  };

  return (
    <div className="group relative flex flex-col bg-[#FAF8F5] rounded-2xl overflow-hidden border border-[#C5A059]/15 hover:border-[#C5A059]/50 transition-all duration-300 hover:shadow-lg">
      <Link href={`/products/${slug}`} className="block relative aspect-square overflow-hidden bg-[#F4EFE6]" data-cursor="VIEW">
        {/* Main Image */}
        <Image
          src={primaryImage}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover Alternate Image */}
        {hoverImage && hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            alt={`${title} alternate angle`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isSale && (
            <span className="badge-gold text-[10px] py-0.5 px-2">
              {discountPercent}% OFF
            </span>
          )}
          {price <= 199 && (
            <span className="bg-[#141312] text-[#FAF8F5] text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-[#C5A059]/30">
              Under ₹199
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          aria-label="Add to Wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#141312] hover:text-[#C5A059] transition-colors z-10 shadow-sm"
        >
          <Heart size={15} fill={isWishlisted ? "#C5A059" : "none"} stroke={isWishlisted ? "#C5A059" : "currentColor"} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute bottom-3 inset-x-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            disabled={adding}
            aria-label={`Quick add ${title} to bag`}
            className="w-full py-2.5 px-4 bg-[#141312]/95 backdrop-blur-md text-[#FAF8F5] hover:bg-[#000] border border-[#C5A059]/50 rounded-xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <ShoppingBag size={13} className="text-[#C5A059]" />
            <span>{adding ? "Adding..." : "Quick Add"}</span>
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#FAF8F5]">
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={11} fill="#C5A059" stroke="#C5A059" />
            ))}
            <span className="text-[11px] text-[#5E564F] font-sans ml-1 font-light">(4.9)</span>
          </div>

          <Link href={`/products/${slug}`} className="block group-hover:text-[#C5A059] transition-colors">
            <h3 className="font-serif text-base font-medium text-[#141312] leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-[#5E564F] font-sans mt-0.5 line-clamp-1">
            {product.material || "18K PVD Gold · 316L Stainless Steel"}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-[#C5A059]/15 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg font-semibold text-[#141312]">
              ₹{price}
            </span>
            {compareAtPrice && (
              <span className="text-xs text-[#928980] line-through font-sans">
                ₹{compareAtPrice}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] text-[#C5A059] uppercase tracking-wider font-semibold font-sans">
              Free Delivery
            </span>
            {product.tryOnEnabled && (
              <Link
                href={`/customizer?product=${encodeURIComponent(product.id || slug)}`}
                onClick={(e) => e.stopPropagation()}
                data-testid={`tryon-card-${product.id || slug}`}
                className="text-[9px] uppercase tracking-[0.18em] font-sans font-bold px-2.5 py-1 rounded-full border border-[#C5A059]/60 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#141312] transition-colors"
              >
                3D Try On
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
