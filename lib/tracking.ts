export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const sendToCAPI = (eventName: string, customData: any = {}) => {
  if (typeof window === "undefined") return;
  fetch("/api/marketing/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventSourceUrl: window.location.href,
      clientUserAgent: navigator.userAgent,
      customData,
    }),
  }).catch((err) => console.error("CAPI error:", err));
};

export const pageview = () => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "PageView");
  }
  sendToCAPI("PageView");
};

export const trackEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
  sendToCAPI(name, options);
};

export const trackViewContent = (
  contentId: string,
  contentName: string,
  value: number,
  currency: string = "INR"
) => {
  trackEvent("ViewContent", {
    content_ids: [contentId],
    content_type: "product",
    content_name: contentName,
    value,
    currency,
  });
};

export const trackSearch = (searchString: string) => {
  trackEvent("Search", {
    search_string: searchString,
  });
};

export const trackAddToCart = (
  contentId: string,
  value: number,
  quantity: number = 1,
  currency: string = "INR"
) => {
  trackEvent("AddToCart", {
    content_ids: [contentId],
    content_type: "product",
    value,
    currency,
    quantity,
  });
};

export const trackInitiateCheckout = (
  contentIds: string[],
  value: number,
  numItems: number,
  currency: string = "INR"
) => {
  trackEvent("InitiateCheckout", {
    content_ids: contentIds,
    value,
    currency,
    num_items: numItems,
  });
};

export const trackAddPaymentInfo = (
  contentIds: string[],
  value: number,
  currency: string = "INR"
) => {
  trackEvent("AddPaymentInfo", {
    content_ids: contentIds,
    value,
    currency,
  });
};

export const trackPurchase = (
  orderId: string, // used for deduplication logic outside this function or via API
  contentIds: string[],
  value: number,
  numItems: number,
  currency: string = "INR"
) => {
  trackEvent("Purchase", {
    content_ids: contentIds,
    value,
    currency,
    num_items: numItems,
    order_id: orderId, // Some systems accept this for deduplication
  });
};
