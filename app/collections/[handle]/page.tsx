import prisma from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import TrustBar from "@/components/home/TrustBar";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { handle } = params;

  let title = "Jewellery Collection";
  if (handle === "under-199") title = "Jewellery Under ₹199";
  else if (handle === "under-299") title = "Jewellery Under ₹299";
  else if (handle === "under-480") title = "Jewellery Under ₹480";
  else if (handle === "bestsellers") title = "SHYN.ISH Bestsellers";
  else if (handle === "gifts") title = "Luxury Gifting Collection";
  else {
    const cat = await prisma.category.findUnique({ where: { slug: handle } });
    if (cat) title = cat.name;
    else title = handle.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  return {
    title: `${title} | SHYN.ISH Everyday Jewellery`,
    description: `Shop ${title.toLowerCase()} at SHYN.ISH. 18K PVD gold plated & 316L stainless steel jewellery under ₹480. Free all India delivery.`,
  };
}

export default async function CollectionPage(props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const { handle } = params;

  let collectionTitle = "";
  let collectionDescription = "";
  let products: any[] = [];

  if (handle === "under-199") {
    collectionTitle = "Jewellery Under ₹199";
    collectionDescription = "Dainty essentials, stackable rings, and minimalist earrings crafted with 18K PVD gold plating under ₹199.";
    products = await prisma.product.findMany({
      where: { price: { lte: 199 }, status: "ACTIVE" },
      include: { category: true },
      orderBy: { price: "asc" },
    });
  } else if (handle === "under-299") {
    collectionTitle = "Jewellery Under ₹299";
    collectionDescription = "Croissant hoops, lucky clover studs, and fluid herringbone chains under ₹299.";
    products = await prisma.product.findMany({
      where: { price: { lte: 299 }, status: "ACTIVE" },
      include: { category: true },
      orderBy: { price: "asc" },
    });
  } else if (handle === "under-480") {
    collectionTitle = "Jewellery Under ₹480";
    collectionDescription = "Our signature tier. Aura interlocking pendants, Roman cuffs, and heavy 18K gold plated statements under ₹480.";
    products = await prisma.product.findMany({
      where: { price: { lte: 480 }, status: "ACTIVE" },
      include: { category: true },
      orderBy: { price: "asc" },
    });
  } else if (handle === "bestsellers") {
    collectionTitle = "SHYN.ISH Bestsellers";
    collectionDescription = "Our most coveted pieces. Handcrafted with medical-grade stainless steel and water-resistant 18K gold.";
    products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const category = await prisma.category.findUnique({
      where: { slug: handle },
      include: {
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (category) {
      collectionTitle = category.name;
      collectionDescription = category.description || "18K PVD Gold Plated & 316L Stainless Steel everyday jewellery.";
      products = category.products;
    } else {
      collectionTitle = handle.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
      collectionDescription = "Explore the curated SHYN.ISH collection.";
      products = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: { category: true },
        take: 8,
      });
    }
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      {/* Collection Hero Header */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 border-b border-[#C5A059]/20 bg-gradient-to-b from-[#F3EDE2]/40 to-[#FAF8F5]">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex text-xs font-sans text-[#5E564F] uppercase tracking-widest gap-2">
            <Link href="/" className="hover:text-[#C5A059] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#C5A059] transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-[#141312] font-semibold">{collectionTitle}</span>
          </nav>

          <h1 className="font-serif text-4xl sm:text-6xl text-[#141312] font-normal">
            {collectionTitle}
          </h1>

          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light max-w-2xl">
            {collectionDescription}
          </p>

          <div className="pt-2 text-xs font-sans text-[#C5A059] font-medium flex items-center gap-3">
            <span>{products.length} Products Available</span>
            <span>•</span>
            <span>All India Delivery</span>
            <span>•</span>
            <span>18K PVD Gold Plated</span>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <p className="font-serif text-2xl text-[#5E564F]">No pieces found in this collection.</p>
              <Link href="/shop" className="btn-gold inline-flex">
                Explore All Jewellery
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Strip */}
      <TrustBar />
    </div>
  );
}
