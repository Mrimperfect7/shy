import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import ProductForm from "@/components/product/ProductForm";
import ReviewSection from "@/components/product/ReviewSection";
import TrustBar from "@/components/home/TrustBar";
import { Sparkles, Shield, Droplets, Heart, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import ProductViewTracker from "@/components/marketing/ProductViewTracker";
import DOMPurify from "isomorphic-dompurify";

import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";

export const revalidate = 60;

export async function generateStaticParams() {
  return SHYNISH_CATALOG.map((product) => ({
    handle: product.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { handle } = params;
  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { slug: handle },
    });
  } catch {}

  if (!product) {
    product = SHYNISH_CATALOG.find((p) => p.slug === handle);
  }

  if (!product) {
    return { title: "Product Not Found | SHYN.ISH" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const cleanDescription =
    (product.descriptionHtml || "").replace(/<[^>]*>?/gm, "").slice(0, 160) ||
    `Discover ${product.title} from SHYN.ISH. 18K PVD gold plated jewellery under ₹480.`;

  return {
    title: `${product.title} | SHYN.ISH`,
    description: cleanDescription,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.title} | SHYN.ISH`,
      description: cleanDescription,
      url: productUrl,
      siteName: "SHYN.ISH",
      images: product.imageUrls?.length > 0 ? [{ url: product.imageUrls[0], alt: product.title }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | SHYN.ISH`,
      description: cleanDescription,
      images: product.imageUrls?.length > 0 ? [product.imageUrls[0]] : [],
    },
  };
}

export default async function ProductPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const { handle } = params;

  let rawProduct: any = null;
  let relatedProducts: any[] = [];
  let approvedReviews: any[] = [];

  try {
    const [dbProduct, dbRelated, dbReviews] = await Promise.all([
      prisma.product.findUnique({
        where: { slug: handle },
        include: { category: true },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        take: 5,
      }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);
    if (dbProduct && dbProduct.slug !== "eshara-natural-hair-oil") {
      rawProduct = dbProduct;
    }
    relatedProducts = dbRelated.filter((p) => p.slug !== "eshara-natural-hair-oil" && p.slug !== handle);
    approvedReviews = dbReviews;
  } catch {}

  if (!rawProduct) {
    const fallbackItem = SHYNISH_CATALOG.find((p) => p.slug === handle);
    if (!fallbackItem) {
      notFound();
    }
    rawProduct = fallbackItem;
  }

  if (relatedProducts.length === 0) {
    relatedProducts = SHYNISH_CATALOG.filter((p) => p.slug !== handle).slice(0, 4);
  }

  const finalPrice = rawProduct.price;
  const finalCompareAtPrice = rawProduct.compareAtPrice;

  const product = {
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.slug,
    description: rawProduct.descriptionHtml.replace(/<[^>]*>?/gm, ""),
    descriptionHtml: rawProduct.descriptionHtml,
    availableForSale: rawProduct.inventory > 0,
    price: finalPrice,
    compareAtPrice: finalCompareAtPrice,
    material: rawProduct.material || "18K PVD Gold Plating over 316L Stainless Steel",
    plating: rawProduct.plating || "18K PVD Gold",
    dimensions: rawProduct.dimensions || "Standard Fit",
    careInstructions: rawProduct.careInstructions || "Water-resistant everyday wear. Store in provided velvet pouch.",
    images: (rawProduct.imageUrls || []).map((url: string, i: number) => ({
      url,
      altText: `${rawProduct.title} - Angle ${i + 1}`,
    })),
  };

  const filteredRelated = relatedProducts.filter((p) => p.id !== rawProduct.id).slice(0, 4);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const productUrl = `${siteUrl}/products/${rawProduct.slug}`;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: rawProduct.title,
    image: rawProduct.imageUrls,
    description: product.description,
    sku: rawProduct.id,
    brand: {
      "@type": "Brand",
      name: "SHYN.ISH",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: finalPrice.toString(),
      itemCondition: "https://schema.org/NewCondition",
      availability: rawProduct.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "SHYN.ISH",
      },
    },
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <ProductViewTracker contentId={rawProduct.id} contentName={rawProduct.title} value={finalPrice} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <div className="pt-6 pb-2 px-6 lg:px-12 max-w-7xl mx-auto">
        <nav className="flex text-xs font-sans text-[#5E564F] uppercase tracking-widest gap-2">
          <Link href="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#C5A059] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#141312] font-semibold truncate">{product.title}</span>
        </nav>
      </div>

      {/* Hero Product Details */}
      <section className="py-8 lg:py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Gallery (Left - 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <ProductGallery images={product.images} />
            </div>

            {/* Form / Purchase Info (Right - 5 cols) */}
            <div className="lg:col-span-5">
              <ProductForm product={product} />
            </div>

          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustBar />

      {/* Specifications & Craft Details */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 bg-white border-y border-[#C5A059]/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] font-sans text-[#C5A059] font-medium">
              Material & Craftsmanship
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141312] font-normal">
              Designed for Daily Life
            </h2>
          </div>

          <div className="prose prose-sm max-w-none text-[#5E564F] font-sans leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.descriptionHtml) }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-xs font-sans">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C5A059]/20 space-y-1">
              <span className="font-semibold text-[#141312] block">Plating Material</span>
              <p className="text-[#5E564F]">{product.plating}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C5A059]/20 space-y-1">
              <span className="font-semibold text-[#141312] block">Core Base</span>
              <p className="text-[#5E564F]">{product.material}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#C5A059]/20 space-y-1">
              <span className="font-semibold text-[#141312] block">Care Recommendation</span>
              <p className="text-[#5E564F]">{product.careInstructions}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="section-eyebrow mb-1">Pair With</span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#141312] font-normal">
                  Complete Your Everyday Stack
                </h2>
              </div>
              <Link href="/shop" className="btn-outline text-xs">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {filteredRelated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <ReviewSection productId={rawProduct.id} reviews={approvedReviews} />
    </div>
  );
}
