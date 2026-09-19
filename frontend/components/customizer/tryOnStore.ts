"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TryOnProduct, JewelryCategory, BodyPart, FingerId, CameraView,
  normalizeCategory, bodyPartForCategory, viewForBodyPart,
  anchorForBodyPart, FINGER_ANCHORS, metalColor, gemColor,
} from "./tryOnTypes";

export interface PlacedItem {
  instanceId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: JewelryCategory;
  bodyPart: BodyPart;
  anchorId: string;
  finger?: FingerId;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  procedural: boolean;
  model3dUrl?: string | null;
  metal: string;
  gem: string | null;
  variant?: string;
  loadFailed?: boolean;
}

export type WearResult = "worn" | "finger-needed" | "unavailable" | "unsupported";

const WRIST_STACK_STEP = 0.11; // configurable offset along the wrist axis

interface TryOnState {
  items: PlacedItem[];
  selectedId: string | null;
  cameraView: CameraView;
  viewNonce: number;
  activeTab: "all" | JewelryCategory;
  pendingRing: TryOnProduct | null;
  draggingId: string | null;

  wearProduct: (product: TryOnProduct, finger?: FingerId) => WearResult;
  resolveFinger: (finger: FingerId) => void;
  cancelFinger: () => void;
  removeItem: (instanceId: string) => void;
  updateTransform: (instanceId: string, t: Partial<Pick<PlacedItem, "position" | "rotation" | "scale">>) => void;
  selectItem: (instanceId: string | null) => void;
  setCameraView: (view: CameraView) => void;
  setActiveTab: (tab: "all" | JewelryCategory) => void;
  setDragging: (instanceId: string | null) => void;
  markLoadFailed: (instanceId: string) => void;
  clearAll: () => void;
}

export const useTryOnStore = create<TryOnState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedId: null,
      cameraView: "wrist",
      viewNonce: 0,
      activeTab: "all",
      pendingRing: null,
      draggingId: null,

      wearProduct: (product, finger) => {
        const category = normalizeCategory(product.category, product.title);
        if (!category) return "unsupported";
        if (!product.tryOnEnabled) return "unavailable";

        const bodyPart: BodyPart = product.tryOnBodyPart || bodyPartForCategory(category);
        if (bodyPart === "finger" && !finger) {
          set({ pendingRing: product });
          return "finger-needed";
        }

        const anchorId = bodyPart === "finger" ? FINGER_ANCHORS[finger!] : anchorForBodyPart(bodyPart);
        const cfg = product.tryOnConfig || {};
        const base = cfg.position || [0, 0, 0];
        // Jewelry stacking: offset each additional piece along the wrist axis
        const stackIndex = get().items.filter((i) => i.anchorId === anchorId).length;
        const position: [number, number, number] = [
          base[0] - (bodyPart === "wrist" ? stackIndex * WRIST_STACK_STEP : 0),
          base[1],
          base[2],
        ];

        const item: PlacedItem = {
          instanceId: `${product.id}-${Date.now()}`,
          productId: product.id,
          slug: product.slug,
          name: product.title,
          price: product.price,
          image: product.imageUrl,
          category,
          bodyPart,
          anchorId,
          finger,
          position,
          rotation: (cfg.rotation || [0, 0, 0]) as [number, number, number],
          scale: cfg.scale || 1,
          procedural: !product.model3dUrl,
          model3dUrl: product.model3dUrl || null,
          metal: metalColor(product.plating, product.material),
          gem: gemColor(product),
          variant: cfg.variant,
        };

        set((s) => ({
          items: [...s.items, item],
          selectedId: item.instanceId,
          pendingRing: null,
          cameraView: viewForBodyPart(bodyPart),
          viewNonce: s.viewNonce + 1,
        }));
        return "worn";
      },

      resolveFinger: (finger) => {
        const p = get().pendingRing;
        if (p) get().wearProduct(p, finger);
        set({ pendingRing: null });
      },
      cancelFinger: () => set({ pendingRing: null }),

      removeItem: (instanceId) =>
        set((s) => ({
          items: s.items.filter((i) => i.instanceId !== instanceId),
          selectedId: s.selectedId === instanceId ? null : s.selectedId,
        })),

      updateTransform: (instanceId, t) =>
        set((s) => ({
          items: s.items.map((i) => (i.instanceId === instanceId ? { ...i, ...t } : i)),
        })),

      selectItem: (instanceId) => set({ selectedId: instanceId }),

      setCameraView: (view) =>
        set((s) => ({ cameraView: view, viewNonce: s.viewNonce + 1 })),

      setActiveTab: (tab) => set({ activeTab: tab }),
      setDragging: (instanceId) => set({ draggingId: instanceId }),

      markLoadFailed: (instanceId) =>
        set((s) => ({
          items: s.items.map((i) => (i.instanceId === instanceId ? { ...i, loadFailed: true } : i)),
        })),

      clearAll: () => set({ items: [], selectedId: null }),
    }),
    {
      name: "shynish-3d-tryon",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
