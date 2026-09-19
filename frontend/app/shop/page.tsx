import ProductCard from "@/components/shop/ProductCard";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop All Jewellery | SHYN.ISH Everyday Shine Under ₹480",
  description: "Shop SHYN.ISH 18K PVD gold plated & 316L stainless steel jewellery under ₹480. Necklaces, earrings, rings, bangles, and gift sets with all India delivery.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop All Jewellery | SHYN.ISH Everyday Shine Under ₹480",
    description: "Shop SHYN.ISH 18K PVD gold plated & 316L stainless steel jewellery under ₹480. All India delivery.",
    url: "/shop",
    siteName: "SHYN.ISH",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Shop SHYN.ISH Jewellery" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Jewellery | SHYN.ISH Everyday Shine Under ₹480",
    description: "18K PVD gold plated & 316L stainless steel jewellery under ₹480.",
    images: ["/og-image.jpg"],
  },
};

const SORT_OPTIONS = [
  { label: "Featured", value: "" },
  { label: "Price: Low to High", value: "PRICE_ASC" },
  { label: "Price: High to Low", value: "PRICE_DESC" },
  { label: "Newest First", value: "CREATED_AT_DESC" },
];

const PRODUCTS_PER_PAGE = 24;

export default function ShopPage() {
  return (
    <div className="min-h-screen pt-6 bg-[#FAF8F5]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 border-b border-[#C5A059]/20">
        <p className="section-eyebrow mb-2">The Complete Collection</p>
        <h1 className="font-serif text-4xl sm:text-6xl text-[#141312] font-normal">
          All Jewellery
        </h1>
        <p className="text-sm text-[#5E564F] font-sans font-light mt-2 max-w-xl">
          18K PVD Gold Plated · 316L Stainless Steel · Free All-India Delivery
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Suspense fallback={<ShopSkeleton />}>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-6 bg-gray-200 rounded-full w-48 hidden sm:block" />
      </div>
      <div className="py-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[4/5] bg-gray-200 rounded-xl" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

import ShopClient from "@/components/shop/ShopClient";
import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";

async function ShopContent() {
  let products: any[] = [];
  try {
    const rawProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        inventory: true,
        imageUrls: true,
        createdAt: true,
        tryOnEnabled: true,
      },
    });

    const jewelleryProducts = rawProducts.filter((p) => p.slug !== "eshara-natural-hair-oil");
    if (jewelleryProducts.length > 0) {
      products = jewelleryProducts.map((p) => ({
        id: p.id,
        handle: p.slug,
        title: p.title,
        price: p.price.toString(),
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
        featuredImage: p.imageUrls.length > 0 ? { url: p.imageUrls[0], altText: p.title } : null,
        images: p.imageUrls.map((url) => ({ url, altText: p.title })),
        availableForSale: p.inventory > 0,
        tryOnEnabled: p.tryOnEnabled,
        variants: [{ id: p.id }],
        createdAt: p.createdAt,
      }));
    }
  } catch {}

  if (products.length === 0) {
    products = SHYNISH_CATALOG.map((p) => ({
      id: p.id,
      handle: p.slug,
      title: p.title,
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : null,
      featuredImage: { url: p.imageUrls[0], altText: p.title },
      images: p.images,
      availableForSale: true,
      tryOnEnabled: p.tryOnEnabled,
      variants: [{ id: p.id }],
      createdAt: new Date().toISOString(),
    }));
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const shopUrl = `${siteUrl}/shop`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Jewellery",
    description: "Shop SHYN.ISH premium waterproof 18K PVD gold and 316L stainless steel jewellery under ₹480.",
    url: shopUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${siteUrl}/products/${p.handle}`,
        name: p.title
      }))
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: shopUrl
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ShopClient initialProducts={products} />
    </>
  );
}
