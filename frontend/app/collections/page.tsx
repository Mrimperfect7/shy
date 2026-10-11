import prisma from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import Image from "next/image";
import TrustBar from "@/components/home/TrustBar";
import { SHYNISH_CATALOG } from "@/lib/data/shynish-products";
import { Sparkles, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore Curated Collections | SHYN.ISH Everyday Jewellery",
  description: "Explore SHYN.ISH curated jewellery collections. 18K PVD gold plated & 316L stainless steel necklaces, earrings, rings, bracelets, and gifts under ₹480.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "Explore Curated Collections | SHYN.ISH Everyday Jewellery",
    description: "18K PVD gold plated & 316L stainless steel jewellery collections under ₹480.",
    url: "/collections",
    siteName: "SHYN.ISH",
  },
};

const CATEGORY_COLLECTIONS = [
  {
    title: "Necklaces & Chains",
    subtitle: "Liquid gold chains, layering pendants & daily essentials",
    priceText: "From ₹199",
    href: "/collections/necklaces",
    image: "/assets/products/necklace-pendant.jpg",
    tag: "Bestselling Category",
  },
  {
    title: "Earrings & Hoops",
    subtitle: "Twisted croissant hoops, huggies & waterproof studs",
    priceText: "From ₹185",
    href: "/collections/earrings",
    image: "/assets/products/earrings-hoops.jpg",
    tag: "Trending Now",
  },
  {
    title: "Rings & Bands",
    subtitle: "Stackable micro-pave eternity bands & signet rings",
    priceText: "From ₹99",
    href: "/collections/rings",
    image: "/assets/products/rings-stack.jpg",
    tag: "Under ₹199",
  },
  {
    title: "Bracelets & Bangles",
    subtitle: "Roman cuffs, paperclip chains & dainty wristwear",
    priceText: "From ₹299",
    href: "/collections/bracelets",
    image: "/assets/products/rings-stack.jpg",
    tag: "Water-Resistant",
  },
  {
    title: "Watches & Sets",
    subtitle: "Champagne mesh timepieces & 3-piece curated stacks",
    priceText: "From ₹690",
    href: "/collections/watches-sets",
    image: "/assets/products/necklace-pendant.jpg",
    tag: "Special Edition",
  },
  {
    title: "Luxury Gifting",
    subtitle: "Velvet gift boxes, cards & complete ready-to-gift sets",
    priceText: "From ₹99",
    href: "/collections/gifts",
    image: "/assets/products/necklace-pendant.jpg",
    tag: "Gift Ready",
  },
];

const TIER_COLLECTIONS = [
  {
    title: "Under ₹199 Collection",
    desc: "Dainty micro studs, everyday stacking rings & minimalist essentials.",
    badge: "Most Affordable",
    href: "/collections/under-199",
    accent: "from-[#F3EDE2] to-[#FAF8F5]",
  },
  {
    title: "Under ₹299 Collection",
    desc: "Croissant hoops, twisted huggies, and herringbone liquid chains.",
    badge: "Everyday Favorites",
    href: "/collections/under-299",
    accent: "from-[#EFE7D8] to-[#FAF8F5]",
  },
  {
    title: "Under ₹480 Collection",
    desc: "Our signature tier. Roman cuffs, aura pendants & statement pieces.",
    badge: "Signature Tier",
    href: "/collections/under-480",
    accent: "from-[#EADEC8] to-[#FAF8F5]",
  },
  {
    title: "SHYN.ISH Bestsellers",
    desc: "The most loved pieces handpicked by over 10,000 happy customers.",
    badge: "Top Rated",
    href: "/collections/bestsellers",
    accent: "from-[#E5D5B5]/30 to-[#FAF8F5]",
  },
];

export default async function CollectionsPage() {
  let products: any[] = [];

  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });
    products = dbProducts.filter((p) => p.slug !== "eshara-natural-hair-oil" && p.category?.slug !== "hair-care");
  } catch {}

  if (products.length === 0) {
    products = SHYNISH_CATALOG.slice(0, 12) as any;
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-12 lg:pt-24 lg:pb-16 px-6 lg:px-12 border-b border-[#C5A059]/20 bg-gradient-to-b from-[#F3EDE2]/50 via-[#FAF8F5]/80 to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex text-xs font-sans text-[#5E564F] uppercase tracking-widest gap-2">
            <Link href="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#141312] font-semibold">Collections</span>
          </nav>

          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans">
            <Sparkles size={14} />
            <span>Curated Elegance</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-[#141312] font-normal tracking-tight">
            Explore Collections
          </h1>

          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light max-w-2xl leading-relaxed">
            Every piece is crafted in anti-tarnish 18K PVD gold plating and hypoallergenic 316L stainless steel. 
            Browse by jewellery category or shop by price tier.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 lg:py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow mb-2">Category Showcase</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141312]">Shop by Category</h2>
            </div>
            <Link href="/shop" className="btn-outline flex items-center gap-1.5 text-xs self-start sm:self-auto">
              <span>View All Products</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {CATEGORY_COLLECTIONS.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-6"
                data-cursor="EXPLORE"
              >
                {/* Background Image */}
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/90 via-[#141312]/40 to-transparent transition-opacity duration-300" />

                {/* Badge */}
                <span className="absolute top-5 left-5 bg-[#FAF8F5]/90 backdrop-blur-sm text-[#141312] text-[10px] tracking-widest uppercase font-semibold px-3 py-1 rounded-full border border-[#C5A059]/30">
                  {cat.tag}
                </span>

                {/* Content */}
                <div className="relative z-10 space-y-1">
                  <span className="text-[#C5A059] text-xs font-sans tracking-wider font-medium">
                    {cat.priceText}
                  </span>
                  <h3 className="font-serif text-2xl text-[#FAF8F5] group-hover:text-[#C5A059] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-[#FAF8F5]/80 font-sans font-light line-clamp-1">
                    {cat.subtitle}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs text-[#C5A059] font-medium tracking-wide">
                    <span>Explore Collection</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Price Tier & Special Collections */}
      <section className="py-16 px-6 lg:px-12 bg-white/60 border-y border-[#C5A059]/15">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <p className="section-eyebrow mb-2">Curated Highlights</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#141312]">Special Collections</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIER_COLLECTIONS.map((tier) => (
              <Link
                key={tier.title}
                href={tier.href}
                className="group p-6 rounded-xl border border-[#C5A059]/20 bg-gradient-to-b hover:border-[#C5A059]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: `linear-gradient(to bottom, var(--tw-gradient-stops))`,
                }}
              >
                <div>
                  <span className="inline-block text-[10px] tracking-widest uppercase font-semibold text-[#8C6D2B] bg-[#C5A059]/15 px-2.5 py-1 rounded-md mb-4">
                    {tier.badge}
                  </span>
                  <h3 className="font-serif text-xl text-[#141312] group-hover:text-[#8C6D2B] transition-colors mb-2">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-[#5E564F] font-sans font-light leading-relaxed mb-6">
                    {tier.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#8C6D2B] font-medium font-sans">
                  <span>Shop Collection</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Pieces */}
      <section className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow mb-2">Trending Across Collections</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141312]">Featured Pieces</h2>
            </div>
            <Link href="/shop" className="btn-outline flex items-center gap-1.5 text-xs self-start sm:self-auto">
              <span>View All {products.length}+ Pieces</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustBar />
    </div>
  );
}
