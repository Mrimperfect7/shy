"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/tracking";

export default function ProductViewTracker({
  contentId,
  contentName,
  value,
  currency = "INR",
}: {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
}) {
  useEffect(() => {
    trackViewContent(contentId, contentName, value, currency);
  }, [contentId, contentName, value, currency]);

  return null;
}
