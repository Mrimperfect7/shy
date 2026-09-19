import { Metadata } from "next";
import prisma from "@/lib/prisma";
import JewelryCustomizer from "@/components/customizer/JewelryCustomizer";
import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";
import type { TryOnProduct } from "@/components/customizer/tryOnTypes";

export const metadata: Metadata = {
  title: "3D Try-On Showroom | SHYNISH",
  description: "Customize your look in the SHYNISH 3D showroom. Try exact store bangles, bracelets, rings and necklaces on a code-rendered model — no AI, no camera.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function toTryOnProduct(p: any): TryOnProduct {
  return {
    id: p.id,
    slug: p.slug || p.handle,
    title: p.title,
    price: typeof p.price === "number" ? p.price : parseFloat(p.price || "0"),
    compareAtPrice: p.compareAtPrice ?? null,
    imageUrl: p.imageUrls?.[0] || p.images?.[0]?.url || "/assets/products/necklace-pendant.jpg",
    category: p.category?.slug || (typeof p.category === "string" ? p.category : ""),
    material: p.material || null,
    plating: p.plating || null,
    tryOnEnabled: Boolean(p.tryOnEnabled),
    model3dUrl: p.model3dUrl || null,
    tryOnBodyPart: p.tryOnBodyPart || null,
    tryOnConfig: (p.tryOnConfig as TryOnProduct["tryOnConfig"]) || null,
  };
}

export default async function CustomizerPage({ searchParams }: Props) {
  const params = await searchParams;
  const productParam = typeof params.product === "string" ? params.product : undefined;

  let catalog: TryOnProduct[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE", slug: { not: "eshara-natural-hair-oil" } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    catalog = dbProducts.map(toTryOnProduct);
  } catch {}

  if (catalog.length === 0) {
    catalog = SHYNISH_CATALOG.filter((p) => p.slug !== "eshara-natural-hair-oil").map(toTryOnProduct);
  }

  let initialProduct: TryOnProduct | null = null;
  if (productParam) {
    initialProduct = catalog.find((p) => p.id === productParam || p.slug === productParam) || null;
  }

  return (
    <main className="w-full">
      <JewelryCustomizer catalog={catalog} initialProduct={initialProduct} />
    </main>
  );
}
