import Hero3DSection from "@/components/home/Hero3DSection";
import TrustBar from "@/components/home/TrustBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import CollectionStory3D from "@/components/home/CollectionStory3D";
import BestsellersGrid from "@/components/home/BestsellersGrid";
import AffordablePriceHub from "@/components/home/AffordablePriceHub";
import MaterialCraftStory from "@/components/home/MaterialCraftStory";
import LifestyleSection from "@/components/home/LifestyleSection";
import GiftBoxScene from "@/components/3d/GiftBoxScene";
import PackagingSection from "@/components/home/PackagingSection";
import InstagramUgcSection from "@/components/home/InstagramUgcSection";
import CustomerReviewsSection from "@/components/home/CustomerReviewsSection";
import FinalCtaSection from "@/components/home/FinalCtaSection";
import JewelleryChain from "@/components/3d/JewelleryChain";
import prisma from "@/lib/prisma";
import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SHYN.ISH | Everyday Shine. Effortless Style. Jewellery Under ₹480",
  description:
    "Explore SHYN.ISH. Everyday shine & effortless style. 18K PVD gold plated & 316/304 stainless steel jewellery under ₹480. All India delivery.",
  openGraph: {
    title: "SHYN.ISH | Everyday Shine. Effortless Style.",
    description: "18K PVD gold plated & 316/304 stainless steel jewellery under ₹480. All India delivery.",
    url: "/",
    siteName: "SHYN.ISH",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "SHYN.ISH Jewellery" }],
  },
};

export const revalidate = 60; // ISR cache revalidation window

export default async function HomePage() {
  // 1. Fetch active products from DB if configured, but ignore any non-jewellery products
  let products: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    // Filter out any non-jewellery items so Eshara products are NEVER shown here
    products = dbProducts.filter((p) => p.slug !== "eshara-natural-hair-oil" && p.category?.slug !== "hair-care");
  } catch {}

  if (products.length === 0) {
    products = SHYNISH_CATALOG as any;
  }

  // 2. Fetch active Instagram Reels
  let reels: any[] = [];
  try {
    reels = await prisma.instagramReel.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
    });
  } catch {}

  // 3. Fetch approved reviews
  let reviews: any[] = [];
  try {
    const dbReviews = await prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    reviews = dbReviews.map((r) => ({
      id: r.id,
      name: r.reviewerName,
      rating: r.rating,
      title: r.title,
      body: r.body,
    }));
  } catch {}

  return (
    <main id="main" className="overflow-hidden bg-[#FAF8F5]">
      {/* SCENE 01: Cinematic 3D Hero */}
      <Hero3DSection />

      {/* SCENE 02: Trust & Material Strip */}
      <TrustBar />

      {/* SCENE 03: Shop by Category */}
      <CategoryGrid />

      {/* 3D Decorative Divider Chain */}
      <JewelleryChain />

      {/* SCENE 04: The 3D Collection Story */}
      <CollectionStory3D products={products} />

      {/* SCENE 05: Bestsellers Section */}
      <BestsellersGrid products={products} />

      {/* SCENE 06: Affordable Price Collections */}
      <AffordablePriceHub />

      {/* SCENE 07: Material Craft & Macro Metallurgy */}
      <MaterialCraftStory />

      {/* SCENE 08: Made to be Worn (Lifestyle Gallery) */}
      <LifestyleSection />

      {/* SCENE 09: Make Someone Shine (Interactive 3D Gift Box) */}
      <GiftBoxScene />

      {/* SCENE 10: Packed With Care */}
      <PackagingSection />

      {/* SCENE 11: From Our Instagram (UGC Grid) */}
      <InstagramUgcSection reels={reels} />

      {/* SCENE 12: Customer Reviews & Social Proof */}
      <CustomerReviewsSection reviews={reviews} />

      {/* SCENE 13: Final Campaign CTA */}
      <FinalCtaSection />
    </main>
  );
}
