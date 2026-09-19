"use client";

import Image from "next/image";
import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { Sparkles, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useTryOnStore } from "./tryOnStore";
import {
  TryOnProduct, CATEGORY_TABS, normalizeCategory, bodyPartForCategory, viewForBodyPart, formatINR,
} from "./tryOnTypes";

function CatalogCard({ product }: { product: TryOnProduct }) {
  const wearProduct = useTryOnStore((s) => s.wearProduct);
  const category = normalizeCategory(product.category, product.title);
  const supported = Boolean(category && product.tryOnEnabled);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `catalog-${product.id}`,
    data: { productId: product.id },
    disabled: !supported,
  });

  const handleTryOn = () => {
    const result = wearProduct(product);
    if (result === "unavailable") toast("3D Try-On isn't available for this product yet.", { icon: "✦" });
    else if (result === "unsupported") toast("This piece can't be previewed in the showroom yet.", { icon: "✦" });
    else if (result === "worn") toast.success(`${product.title} is on the model`);
  };

  return (
    <div
      ref={setNodeRef}
      {...(supported ? { ...listeners, ...attributes } : {})}
      data-testid={`catalog-card-${product.id}`}
      className={`group relative rounded-xl border bg-[#18181C] overflow-hidden transition-all duration-300 ${
        isDragging ? "opacity-40" : ""
      } ${
        supported
          ? "border-[#D4AF37]/12 hover:border-[#D4AF37]/50 hover:bg-[#222228] cursor-grab active:cursor-grabbing"
          : "border-white/5 opacity-75"
      }`}
    >
      <div className="relative aspect-square bg-[#0E0E10] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="180px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {supported && product.model3dUrl == null && (
          <span className="absolute top-2 left-2 text-[8px] font-mono tracking-[0.18em] uppercase px-1.5 py-0.5 rounded bg-black/60 border border-[#D4AF37]/30 text-amber-300/90">
            Preview model
          </span>
        )}
        {supported && (
          <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-[0.16em] text-zinc-300/90 font-sans flex items-center gap-1">
            <Sparkles size={9} className="text-[#D4AF37]" /> Drag onto model
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-serif text-sm text-zinc-100 leading-snug line-clamp-1">{product.title}</h3>
        <p className="font-mono text-xs text-amber-300 mt-1">{formatINR(product.price)}</p>
        {supported ? (
          <button
            data-testid={`tryon-${product.id}`}
            onClick={handleTryOn}
            className="mt-2.5 w-full py-2 text-[10px] uppercase tracking-[0.2em] font-sans font-bold rounded-lg bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#9A7B38] text-[#141312] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Try On
          </button>
        ) : (
          <div className="mt-2.5">
            <p className="text-[10px] text-zinc-500 font-sans mb-1.5" data-testid={`unavailable-${product.id}`}>
              3D Try-On isn&apos;t available for this product yet.
            </p>
            <Link
              href={`/products/${product.slug}`}
              data-testid={`view-product-${product.id}`}
              className="w-full py-2 text-[10px] uppercase tracking-[0.2em] font-sans font-semibold rounded-lg border border-zinc-700 text-zinc-300 hover:border-[#D4AF37]/50 hover:text-amber-200 transition-all flex items-center justify-center gap-1.5"
            >
              <Eye size={11} /> View Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogSidebar({ catalog }: { catalog: TryOnProduct[] }) {
  const activeTab = useTryOnStore((s) => s.activeTab);
  const setActiveTab = useTryOnStore((s) => s.setActiveTab);
  const setCameraView = useTryOnStore((s) => s.setCameraView);

  const visible = catalog.filter((p) => {
    const cat = normalizeCategory(p.category, p.title);
    if (activeTab === "all") return true;
    return cat === activeTab;
  });

  return (
    <aside className="h-full flex flex-col bg-[#121215] border-l border-[#D4AF37]/10" data-testid="catalog-sidebar">
      {/* editorial marquee */}
      <div className="overflow-hidden border-b border-[#D4AF37]/10 py-2 flex-shrink-0">
        <div className="shyn-marquee whitespace-nowrap font-mono text-[9px] tracking-[0.35em] uppercase text-[#D4AF37]/60">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="mx-6">
              Handcrafted in Jaipur · 18K PVD Gold · Anti-Tarnish · Ships Across India · Code-Rendered 3D — No AI ·
            </span>
          ))}
        </div>
      </div>

      {/* category tabs */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-[#D4AF37]/10">
        <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-400/80 mb-2">The Collection</p>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              data-testid={tab.testId}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "all") setCameraView(viewForBodyPart(bodyPartForCategory(tab.id)));
              }}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] font-sans font-semibold rounded-full border transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-[#141312] border-[#D4AF37]"
                  : "bg-transparent text-zinc-400 border-zinc-700/60 hover:border-[#D4AF37]/50 hover:text-amber-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* products */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {visible.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center mt-10 font-sans">No pieces in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((p) => (
              <CatalogCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
