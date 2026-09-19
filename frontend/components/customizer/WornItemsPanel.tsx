"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, Trash2, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store";
import { useTryOnStore } from "./tryOnStore";
import { formatINR } from "./tryOnTypes";

export default function WornItemsPanel() {
  const { items, selectedId, selectItem, removeItem, updateTransform, clearAll } = useTryOnStore();
  const addToCart = useCartStore((s) => s.addItem);
  const selected = items.find((i) => i.instanceId === selectedId) || null;
  const total = items.reduce((acc, i) => acc + i.price, 0);
  // Collapsible on phones so the 3D model keeps the screen
  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  const handleAdd = (item: typeof selected) => {
    if (!item) return;
    addToCart({ id: item.productId, title: item.name, price: item.price, imageUrl: item.image, image: item.image, quantity: 1 });
    toast.success(`Added ${item.name} to bag`);
  };

  if (items.length === 0) {
    return (
      <div
        data-testid="worn-empty-hint"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-full bg-[#16161A]/85 backdrop-blur-md border border-[#D4AF37]/25 text-[11px] font-sans text-zinc-300 tracking-wide pointer-events-none"
      >
        Drag a piece onto the model — or tap <span className="text-amber-300 font-semibold">TRY ON</span>
      </div>
    );
  }

  // Collapsed: slim bar (default on phones) so the 3D model keeps the screen
  if (collapsed) {
    return (
      <button
        data-testid="panel-toggle"
        aria-label="Expand worn items"
        aria-expanded={false}
        onClick={() => setCollapsed(false)}
        className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-[#16161A]/92 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-sans text-zinc-200 truncate">
            {selected ? selected.name : `${items.length} piece${items.length > 1 ? "s" : ""} worn`}
          </span>
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-[11px] text-amber-300">{formatINR(total)}</span>
          <ChevronUp size={14} className="text-amber-300" />
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-4 left-4 z-20 bg-[#16161A]/90 backdrop-blur-md border border-[#D4AF37]/30 p-4 rounded-xl shadow-2xl w-[min(24rem,calc(100%-2rem))]"
      data-testid="worn-items-panel"
    >
      {/* worn stack chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide" data-testid="worn-items-list">
        {items.map((i) => (
          <button
            key={i.instanceId}
            data-testid={`worn-chip-${i.productId}`}
            onClick={() => selectItem(i.instanceId === selectedId ? null : i.instanceId)}
            className={`relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border transition-all ${
              i.instanceId === selectedId ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/60" : "border-zinc-700 hover:border-zinc-500"
            }`}
          >
            <Image src={i.image} alt={i.name} fill sizes="44px" className="object-cover" />
          </button>
        ))}
        <button
          onClick={clearAll}
          data-testid="clear-all-button"
          title="Remove all"
          className="flex-shrink-0 w-11 h-11 rounded-lg border border-zinc-800 text-zinc-500 hover:text-rose-300 hover:border-rose-400/40 flex items-center justify-center transition-colors"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key={selected.instanceId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div className="flex items-center gap-3 pb-3 border-b border-[#D4AF37]/15">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#D4AF37]/25 flex-shrink-0">
                <Image src={selected.image} alt={selected.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-amber-400/70">
                  {selected.category}{selected.finger ? ` · ${selected.finger} finger` : ""}
                </p>
                <h4 className="font-serif text-sm text-zinc-100 truncate" data-testid="selected-product-name">{selected.name}</h4>
                <p className="font-mono text-xs text-amber-300" data-testid="selected-product-price">{formatINR(selected.price)}</p>
              </div>
            </div>

            {selected.loadFailed && (
              <p className="text-[10px] text-rose-300/90 font-sans py-2" data-testid="model-load-failed">
                3D Try-On isn&apos;t available for this product yet.
              </p>
            )}

            {/* adjustment sliders */}
            <div className="py-3 space-y-2.5">
              {[
                { label: selected.bodyPart === "neck" ? "Height" : "Position", key: "position" as const, min: selected.bodyPart === "neck" ? -0.12 : -0.32, max: selected.bodyPart === "neck" ? 0.08 : 0.14, step: 0.005, testId: "slider-position" },
                { label: "Rotation", key: "rotation" as const, min: -Math.PI, max: Math.PI, step: 0.02, testId: "slider-rotation" },
                { label: "Scale", key: "scale" as const, min: 0.6, max: 1.6, step: 0.01, testId: "slider-scale" },
              ].map((s) => {
                const value = s.key === "position" ? (selected.bodyPart === "neck" ? selected.position[1] : selected.position[0]) : s.key === "rotation" ? (selected.bodyPart === "neck" ? selected.rotation[1] : selected.rotation[0]) : selected.scale;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 font-sans w-14">{s.label}</span>
                    <input
                      type="range"
                      data-testid={s.testId}
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={value}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (s.key === "scale") updateTransform(selected.instanceId, { scale: v });
                        else if (s.key === "rotation") {
                          const r = [...selected.rotation] as [number, number, number];
                          if (selected.bodyPart === "neck") r[1] = v; else r[0] = v;
                          updateTransform(selected.instanceId, { rotation: r });
                        } else {
                          const p = [...selected.position] as [number, number, number];
                          if (selected.bodyPart === "neck") p[1] = v; else p[0] = v;
                          updateTransform(selected.instanceId, { position: p });
                        }
                      }}
                      className="flex-1 h-1 accent-[#D4AF37] bg-zinc-800 rounded-full cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link
                href={`/products/${selected.slug}`}
                data-testid="selected-view-product"
                className="py-2 text-[9px] uppercase tracking-[0.15em] font-sans font-semibold rounded-lg border border-zinc-700 text-zinc-300 hover:border-[#D4AF37]/60 hover:text-amber-200 transition-all flex items-center justify-center gap-1"
              >
                <Eye size={11} /> View Product
              </Link>
              <button
                onClick={() => handleAdd(selected)}
                data-testid="selected-add-to-cart"
                className="py-2 text-[9px] uppercase tracking-[0.15em] font-sans font-bold rounded-lg bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#9A7B38] text-[#141312] hover:brightness-110 transition-all flex items-center justify-center gap-1"
              >
                <ShoppingBag size={11} /> Add to Cart
              </button>
              <button
                onClick={() => removeItem(selected.instanceId)}
                data-testid="selected-remove"
                className="py-2 text-[9px] uppercase tracking-[0.15em] font-sans font-semibold rounded-lg border border-rose-400/30 text-rose-300/90 hover:bg-rose-400/10 transition-all flex items-center justify-center gap-1"
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-zinc-500 font-sans py-1">
            Tap a piece above or on the model to adjust it · Drag jewelry directly on the model to rotate &amp; slide
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#D4AF37]/15">
        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-sans">{items.length} piece{items.length > 1 ? "s" : ""} worn</span>
        <span className="flex items-center gap-3">
          <span className="font-mono text-xs text-amber-300" data-testid="look-total">{formatINR(total)}</span>
          <button
            onClick={() => setCollapsed(true)}
            data-testid="panel-collapse"
            aria-label="Collapse panel"
            aria-expanded={true}
            className="text-zinc-500 hover:text-amber-200 transition-colors"
          >
            <ChevronDown size={15} />
          </button>
        </span>
      </div>
    </motion.div>
  );
}
