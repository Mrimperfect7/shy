import { TryOnAnalyticsEvent } from "./types";

export function trackTryOnEvent(event: TryOnAnalyticsEvent, metadata?: Record<string, any>) {
  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    if (process.env.NODE_ENV === "development") {
      console.log(`[AI Try-On Analytics]`, payload);
    }

    // Window dataLayer integration for Google Analytics / Tag Manager if present
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: `tryon_${event}`,
        ...metadata,
      });
    }
  } catch (err) {
    // Fail silently without disrupting UX
  }
}
