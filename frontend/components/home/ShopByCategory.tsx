"use client";
import Link from "next/link";
import Image from "next/image";

export default function ShopByCategory({ categories }: { categories: any[] }) {
  if (!categories || categories.length === 0) return null;
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif text-[var(--forest)] mb-4">Shop By Category</h2>
        <div className="h-px w-24 bg-[var(--forest)]/30 mx-auto"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {categories.map((cat) => (
          <Link href={"/shop?category=" + cat.slug} key={cat.id} className="group flex flex-col items-center">
            <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 bg-[#f8f5ee] transition-transform duration-500 group-hover:scale-105 border-4 border-transparent group-hover:border-[var(--forest)]/10">
              {cat.imageUrl && (
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
              )}
            </div>
            <h3 className="font-serif text-lg text-center text-[var(--charcoal)] group-hover:text-[var(--forest)] transition-colors">{cat.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
