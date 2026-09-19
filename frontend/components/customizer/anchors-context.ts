"use client";

import { createContext } from "react";
import type { Group } from "three";

// Named body anchors registered by the Mannequin and consumed by placed jewelry.
export interface AnchorsState {
  anchors: Record<string, Group | null>;
  ready: boolean;
}

export const AnchorsContext = createContext<AnchorsState>({ anchors: {}, ready: false });
