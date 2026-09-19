"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface BestsellersGridProps {
  products: any[];
}

export default function BestsellersGrid({ products }: BestsellersGridProps) {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredProducts = products.filter((p) => {
    if (selectedFilter === "all") return true;
    const cat = p.category?.slug || "";
    return cat.includes(selectedFilter) || p.slug.includes(selectedFilter);
  });

  return (
    <section id="bestsellers" className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow mb-3">
              <span>Top Rated Pieces</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
              SHYN.ISH Bestsellers
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Pieces" },
              { id: "necklaces", label: "Necklaces" },
              { id: "earrings", label: "Earrings" },
              { id: "rings", label: "Rings" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-sans font-medium transition-all ${
                  selectedFilter === f.id
                    ? "bg-[#141312] text-[#FAF8F5] border border-[#C5A059]"
                    : "bg-white/60 text-[#5E564F] hover:bg-white border border-[#C5A059]/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.slice(0, 8).map((prod, idx) => (
            <ProductCard key={prod.id} product={prod} priority={idx < 4} />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center pt-6">
          <Link
            href="/shop"
            className="btn-outline flex items-center gap-2 text-xs"
            data-cursor="SHOP"
          >
            <span>Explore All {products.length} Designs</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
