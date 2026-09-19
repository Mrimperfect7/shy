"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, useDroppable,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { ArrowLeft, Hand, Gem, CircleDot } from "lucide-react";
import toast from "react-hot-toast";
import CatalogSidebar from "./CatalogSidebar";
import WornItemsPanel from "./WornItemsPanel";
import FingerPicker from "./FingerPicker";
import { useTryOnStore } from "./tryOnStore";
import { TryOnProduct, CameraView, normalizeCategory } from "./tryOnTypes";

const TryOnScene = dynamic(() => import("./TryOnScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0C]">
      <p className="font-serif text-lg text-amber-200/70 animate-pulse tracking-wide">Preparing the showroom…</p>
    </div>
  ),
});

const VIEW_BUTTONS: { id: CameraView; label: string; icon: typeof Hand; testId: string }[] = [
  { id: "wrist", label: "Wrist", icon: Hand, testId: "camera-view-wrist" },
  { id: "ring", label: "Ring", icon: CircleDot, testId: "camera-view-ring" },
  { id: "neck", label: "Neck", icon: Gem, testId: "camera-view-neck" },
];

function DroppableCanvas() {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" });
  return (
    <div
      ref={setNodeRef}
      data-testid="canvas-dropzone"
      className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
        isOver ? "ring-2 ring-[#D4AF37]/60 ring-inset bg-[#D4AF37]/5" : ""
      }`}
    />
  );
}

export default function JewelryCustomizer({
  catalog,
  initialProduct,
}: {
  catalog: TryOnProduct[];
  initialProduct?: TryOnProduct | null;
}) {
  const wearProduct = useTryOnStore((s) => s.wearProduct);
  const cameraView = useTryOnStore((s) => s.cameraView);
  const setCameraView = useTryOnStore((s) => s.setCameraView);
  const items = useTryOnStore((s) => s.items);
  const [dragProduct, setDragProduct] = useState<TryOnProduct | null>(null);
  const wornInitialRef = useRef<string | null>(null);

  // Product page → "Try This On": wear the exact product on arrival (once)
  useEffect(() => {
    if (!initialProduct) return;
    const state = useTryOnStore.getState();
    if (wornInitialRef.current === initialProduct.id) return;
    if (state.items.some((i) => i.productId === initialProduct.id)) return;
    wornInitialRef.current = initialProduct.id;
    if (!initialProduct.tryOnEnabled || !normalizeCategory(initialProduct.category, initialProduct.title)) return;
    wearProduct(initialProduct, initialProduct.tryOnConfig?.finger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct?.id]);

  const unavailableInitial =
    initialProduct && (!initialProduct.tryOnEnabled || !normalizeCategory(initialProduct.category, initialProduct.title));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.data.current?.productId;
    setDragProduct(catalog.find((p) => p.id === id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragProduct(null);
    if (event.over?.id !== "canvas-dropzone") return;
    const id = event.active.data.current?.productId;
    const product = catalog.find((p) => p.id === id);
    if (!product) return;
    const result = wearProduct(product);
    if (result === "worn") toast.success(`${product.title} is on the model`);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <style>{`.shyn-marquee{display:inline-block;animation:shyn-marquee 42s linear infinite}@keyframes shyn-marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}
.tryon-vignette{background:radial-gradient(circle at 50% 42%,transparent 42%,rgba(5,5,6,0.8) 100%)}`}</style>
      <div
        data-testid="customizer-root"
        className="mt-16 md:mt-20 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-5rem)] bg-[#0B0B0C] text-[#F7F5F0] flex flex-col overflow-hidden"
      >
        {/* showroom header */}
        <header className="flex-shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-[#D4AF37]/15 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/shop"
              data-testid="back-to-shop"
              className="text-zinc-500 hover:text-amber-200 transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-sans"
            >
              <ArrowLeft size={13} /> <span className="hidden sm:inline">Shop</span>
            </Link>
            <div className="h-6 w-px bg-[#D4AF37]/20 hidden sm:block" />
            <div className="min-w-0">
              <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-amber-400/80">The Shynish Showroom</p>
              <h1 className="font-serif text-lg sm:text-xl text-amber-50 truncate leading-tight">Customize Your Look</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {VIEW_BUTTONS.map((v) => (
              <button
                key={v.id}
                data-testid={v.testId}
                onClick={() => setCameraView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.15em] font-sans font-semibold transition-all ${
                  cameraView === v.id
                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#141312]"
                    : "border-zinc-700/70 text-zinc-400 hover:border-[#D4AF37]/50 hover:text-amber-200"
                }`}
              >
                <v.icon size={12} /> <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* 3D viewport */}
          <div className="relative flex-1 min-h-[52dvh] lg:min-h-0 order-1 bg-[#0E0E10]" data-testid="viewport-3d">
            <TryOnScene />
            {/* cinematic vignette */}
            <div className="absolute inset-0 pointer-events-none tryon-vignette" />
            <DroppableCanvas />

            {/* body view label */}
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm border border-[#D4AF37]/25 text-[10px] font-mono tracking-[0.22em] uppercase text-amber-200/90 pointer-events-none" data-testid="view-label">
              {cameraView === "neck" ? "Neck View" : cameraView === "ring" ? "Ring View" : "Wrist View"}
            </div>

            {unavailableInitial && (
              <div className="absolute inset-x-4 top-16 z-20 mx-auto max-w-sm rounded-xl bg-[#16161A]/95 border border-[#D4AF37]/30 p-5 text-center shadow-2xl" data-testid="tryon-unavailable-banner">
                <p className="font-serif text-base text-zinc-100 mb-1">3D Try-On isn&apos;t available for this product yet.</p>
                <p className="text-[11px] text-zinc-500 font-sans mb-3">{initialProduct!.title} is still stunning in photos.</p>
                <Link
                  href={`/products/${initialProduct!.slug}`}
                  data-testid="unavailable-view-product"
                  className="inline-block px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-sans font-bold rounded-full bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#9A7B38] text-[#141312]"
                >
                  View Product
                </Link>
              </div>
            )}

            <WornItemsPanel />
          </div>

          {/* catalog sidebar */}
          <div className="order-2 w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 h-[44dvh] lg:h-auto border-t lg:border-t-0 border-[#D4AF37]/10">
            <CatalogSidebar catalog={catalog} />
          </div>
        </div>

        <FingerPicker />

        <DragOverlay dropAnimation={null}>
          {dragProduct && (
            <div className="w-24 rounded-lg overflow-hidden border border-[#D4AF37]/60 shadow-2xl bg-[#18181C] rotate-3">
              <div className="relative aspect-square">
                <Image src={dragProduct.imageUrl} alt={dragProduct.title} fill sizes="96px" className="object-cover" />
              </div>
              <p className="text-[9px] font-sans text-zinc-300 p-1.5 truncate">{dragProduct.title}</p>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
