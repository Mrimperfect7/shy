import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  {
    title: "Necklaces & Chains",
    subtitle: "Liquid gold chains & layering pendants",
    priceText: "From ₹199",
    href: "/collections/necklaces",
    image: "/assets/products/necklace-pendant.jpg",
    badge: "Bestseller",
  },
  {
    title: "Earrings & Hoops",
    subtitle: "Twisted croissant hoops & daily clover huggies",
    priceText: "From ₹185",
    href: "/collections/earrings",
    image: "/assets/products/earrings-hoops.jpg",
    badge: "Trending",
  },
  {
    title: "Rings & Bands",
    subtitle: "Stackable micro-pave eternity bands",
    priceText: "From ₹99",
    href: "/collections/rings",
    image: "/assets/products/rings-stack.jpg",
    badge: "Under ₹199",
  },
  {
    title: "Bracelets & Bangles",
    subtitle: "Roman cuffs & dainty daily bangles",
    priceText: "From ₹299",
    href: "/collections/bracelets",
    image: "/assets/products/rings-stack.jpg",
    badge: "Water-Resistant",
  },
  {
    title: "Watches & Sets",
    subtitle: "Champagne mesh timepieces & 3-piece stacks",
    priceText: "From ₹690",
    href: "/collections/watches-sets",
    image: "/assets/products/necklace-pendant.jpg",
    badge: "Limited Edition",
  },
  {
    title: "Luxury Gifting",
    subtitle: "Velvet gift boxes & presentation sets",
    priceText: "From ₹99",
    href: "/collections/gifts",
    image: "/assets/products/necklace-pendant.jpg",
    badge: "Curated Box",
  },
];

export default function CategoryGrid() {
  return (
    <section id="categories" className="py-20 lg:py-28 px-6 lg:px-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="section-eyebrow mb-3">
              <span>Curated Collections</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141312] font-normal leading-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="btn-outline self-start md:self-auto flex items-center gap-1 text-xs"
            data-cursor="SHOP"
          >
            <span>View All Pieces</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-end p-6"
              data-cursor="EXPLORE"
            >
              {/* Background Image with Zoom on Hover */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/90 via-[#141312]/35 to-transparent transition-opacity duration-300" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="badge-charcoal text-[10px] py-1 px-3">
                  {cat.badge}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059]">
                    {cat.priceText}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#C5A059] group-hover:text-[#141312] transition-colors">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-white font-medium">
                  {cat.title}
                </h3>
                <p className="text-xs text-white/70 font-sans font-light line-clamp-1">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
