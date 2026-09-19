import prisma from "@/lib/prisma";
import WatchBuilder from "@/components/shop/WatchBuilder";
import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Watch Builder | SHYN.ISH",
  description: "Customize your perfect watch set by pairing our premium watches with matching 18K PVD Gold bracelets.",
};

export default async function WatchBuilderPage() {
  let watches: any[] = [];
  let bracelets: any[] = [];

  try {
    // Attempt to fetch from DB
    const dbWatches = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        category: {
          slug: {
            in: ["watches", "watches-sets", "watch"],
          },
        },
      },
    });

    const dbBracelets = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        category: {
          slug: {
            in: ["bracelets", "bangles", "bracelets-bangles"],
          },
        },
      },
    });

    watches = dbWatches;
    bracelets = dbBracelets;
  } catch (error) {
    console.error("Failed to fetch builder products from DB", error);
  }

  // Fallback to mock catalog if empty
  if (watches.length === 0) {
    watches = SHYNISH_CATALOG.filter(p => p.category.slug === "watches-sets" || p.category.slug === "watches" || p.title.toLowerCase().includes("watch"));
  }

  if (bracelets.length === 0) {
    bracelets = SHYNISH_CATALOG.filter(p => p.category.slug === "bracelets" || p.category.slug === "bracelets-bangles" || p.title.toLowerCase().includes("bangle") || p.title.toLowerCase().includes("bracelet"));
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <WatchBuilder watches={watches} bracelets={bracelets} />
    </div>
  );
}
