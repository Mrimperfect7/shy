"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/tracking";

export default function PurchaseTracker({
  orderId,
  contentIds,
  value,
  numItems,
  currency = "INR",
}: {
  orderId: string;
  contentIds: string[];
  value: number;
  numItems: number;
  currency?: string;
}) {
  const tracked = useRef(false);

  useEffect(() => {
    // Deduplication via sessionStorage
    if (typeof window === "undefined" || !orderId) return;
    
    const storageKey = `eshara_tracked_purchase_${orderId}`;
    const alreadyTracked = sessionStorage.getItem(storageKey);

    if (!tracked.current && !alreadyTracked) {
      trackPurchase(orderId, contentIds, value, numItems, currency);
      sessionStorage.setItem(storageKey, "true");
      tracked.current = true;
    }
  }, [orderId, contentIds, value, numItems, currency]);

  return null;
}
