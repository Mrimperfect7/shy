"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shyn_wishlist");
      if (saved) {
        const list = JSON.parse(saved);
        setWishlistSlugs(list);
        if (list.length > 0) {
          fetch(`/api/products?slugs=${encodeURIComponent(list.join(","))}`)
            .then((r) => r.json())
            .then((data) => {
              if (data?.products) {
                setProducts(data.products);
              }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const handleRemove = (slug: string) => {
    const updated = wishlistSlugs.filter((s) => s !== slug);
    setWishlistSlugs(updated);
    setProducts(products.filter((p) => p.slug !== slug));
    localStorage.setItem("shyn_wishlist", JSON.stringify(updated));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id || product.slug,
      title: product.title,
      price: product.price,
      image: product.imageUrls?.[0] || "/assets/products/necklace-pendant.jpg",
      quantity: 1,
      variantTitle: product.material || "18K PVD Gold",
    });
    toast.success(`Added ${product.title} to bag! ✨`, {
      style: {
        background: "#141312",
        color: "#FAF8F5",
        border: "1px solid #C5A059",
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
            Personal Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Your Saved Jewellery
          </h1>
          <p className="text-sm text-[#5E564F] font-sans font-light">
            Keep track of your favorite 18K PVD gold pieces and everyday staples.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm font-sans text-[#5E564F]">
            Loading your saved pieces...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#C5A059]/20 p-8 space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center mx-auto">
              <Heart size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#141312]">Your wishlist is empty</h2>
              <p className="text-xs text-[#5E564F] font-sans font-light">
                Discover our bestselling necklaces, twisted hoops, and rings starting under ₹199.
              </p>
            </div>
            <Link href="/shop" className="btn-gold inline-flex text-xs">
              <span>Start Exploring</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F5EFE6]">
                  <Image
                    src={p.imageUrls?.[0] || "/assets/products/necklace-pendant.jpg"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemove(p.slug)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-rose-600 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <Link href={`/products/${p.slug}`}>
                      <h3 className="font-serif text-base font-medium text-[#141312] hover:text-[#C5A059] line-clamp-1">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#5E564F] font-sans mt-0.5">
                      {p.material || "18K PVD Gold"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="font-serif text-lg font-semibold text-[#141312]">
                      ₹{p.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="p-2 rounded-full bg-[#141312] text-[#FAF8F5] hover:bg-black transition-colors"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
