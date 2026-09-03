import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import MetaPixel from "@/components/marketing/MetaPixel";
import SmoothScrollProvider from "@/components/shared/SmoothScrollProvider";
import CustomCursor from "@/components/shared/CustomCursor";
import { Suspense } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF8F5",
};

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com"),
  title: {
    default: "SHYN.ISH | Everyday Shine. Effortless Style. Jewellery Under ₹480",
    template: "%s | SHYN.ISH",
  },
  description:
    "Discover SHYN.ISH. Everyday shine & effortless style. 18K PVD gold plated & 316/304 stainless steel jewellery under ₹480. All India delivery.",
  keywords: [
    "SHYN.ISH",
    "jewellery under 480",
    "18k pvd gold plated jewellery",
    "stainless steel jewellery",
    "anti tarnish jewellery",
    "affordable fashion jewellery india",
    "gold necklace",
    "gold earrings",
    "rings",
    "bracelets",
    "jewellery gifts"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SHYN.ISH",
    title: "SHYN.ISH | Everyday Shine. Effortless Style.",
    description: "18K PVD gold plated & 316/304 stainless steel jewellery under ₹480. Best price. Honest quality. All India delivery.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "SHYN.ISH Jewellery Collection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SHYN.ISH | Everyday Shine. Effortless Style.",
    description: "18K PVD gold plated & 316/304 stainless steel jewellery under ₹480. All India delivery.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SHYN.ISH",
    url: siteUrl,
    logo: `${siteUrl}/assets/shyn-logo.png`,
    image: `${siteUrl}/og-image.jpg`,
    description: "Everyday shine & effortless style. 18K PVD gold plated and stainless steel jewellery under ₹480.",
    email: "care@shynish.com",
    telephone: "+919876543210",
    sameAs: [
      "https://www.instagram.com/shyn.ish/",
      "https://wa.me/919876543210"
    ]
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SHYN.ISH",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="preconnect" href="https://checkout.razorpay.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="bg-[#FAF8F5] text-[#181614] antialiased selection:bg-[#C5A059]/25">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <SmoothScrollProvider>
          <CartProvider>
            <CustomCursor />
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 btn-primary">
              Skip to content
            </a>
            <StorefrontLayout>
              {children}
            </StorefrontLayout>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#141312",
                  color: "#FAF8F5",
                  fontFamily: "var(--font-inter, sans-serif)",
                  fontSize: "0.85rem",
                  border: "1px solid rgba(197, 160, 89, 0.3)",
                  borderRadius: "4px",
                  padding: "0.9rem 1.25rem",
                },
              }}
            />
          </CartProvider>
        </SmoothScrollProvider>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
      </body>
    </html>
  );
}
