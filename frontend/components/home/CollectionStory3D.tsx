"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowRight } from "lucide-react";

interface CollectionStoryProps {
  products: any[];
}

export default function CollectionStory3D({ products }: CollectionStoryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".story-card");
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 50,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const storyItems = products.slice(0, 4);

  return (
    <section ref={sectionRef} id="collection-story" className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5] border-t border-[#C5A059]/15">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans justify-center">
            <Sparkles size={14} />
            <span>The Collection Story</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Pieces Made for Every Version of You
          </h2>
          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light">
            Every curve, lock, and facet is carefully sculpted to deliver liquid shine without excessive weight. Discover our four signature pillars.
          </p>
        </div>

        {/* 4 Story Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storyItems.map((item, index) => (
            <div
              key={item.id}
              className="story-card rounded-3xl p-6 bg-white/70 backdrop-blur-sm border border-[#C5A059]/20 flex flex-col justify-between space-y-4 hover:border-[#C5A059]/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5EFE6]">
                <Image
                  src={item.imageUrls?.[0] || "/assets/products/necklace-pendant.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[#141312] text-[#C5A059] text-xs font-serif flex items-center justify-center border border-[#C5A059]/30">
                  0{index + 1}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#C5A059] font-medium">
                  {item.category?.name || "Everyday Shine"}
                </span>
                <h3 className="font-serif text-lg text-[#141312] font-medium line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5E564F] font-sans font-light line-clamp-2">
                  18K PVD gold plated over hypoallergenic stainless steel.
                </p>
              </div>

              <div className="pt-3 border-t border-[#C5A059]/15 flex items-center justify-between">
                <span className="font-serif text-lg font-semibold text-[#141312]">
                  ₹{item.price}
                </span>
                <Link
                  href={`/products/${item.slug}`}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-sans font-semibold text-[#141312] hover:text-[#C5A059] transition-colors"
                >
                  <span>View Product</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
