import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function LifestyleSection() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow mb-3">
              <span>Real People. Real Shine.</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
              Made to be Worn, Not Stored.
            </h2>
          </div>
          <p className="text-sm text-[#5E564F] font-sans font-light max-w-md">
            From morning coffee runs to evening dinners, SHYN.ISH jewellery is designed for effortless daily styling. Mix, match, and stack with complete freedom.
          </p>
        </div>

        {/* Editorial Parallax Collage */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Large Visual */}
          <div className="md:col-span-7 relative h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-[#C5A059]/20 shadow-md group">
            <Image
              src="/assets/products/rings-stack.jpg"
              alt="Everyday Hand Stacking"
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
                Everyday Wrist & Ring Stack
              </span>
              <h3 className="font-serif text-2xl font-normal">
                Minimalist Solitaire Eternity Band · ₹99
              </h3>
            </div>
          </div>

          {/* Two Side Visuals */}
          <div className="md:col-span-5 grid grid-cols-1 gap-6">
            <div className="relative h-[220px] sm:h-[260px] rounded-3xl overflow-hidden border border-[#C5A059]/20 shadow-md group">
              <Image
                src="/assets/products/earrings-hoops.jpg"
                alt="Twisted French Hoops"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
                  The Daily Staple
                </span>
                <h4 className="font-serif text-lg font-normal">
                  Luxe Twisted Hoops · ₹185
                </h4>
              </div>
            </div>

            <div className="relative h-[220px] sm:h-[260px] rounded-3xl overflow-hidden border border-[#C5A059]/20 shadow-md group">
              <Image
                src="/assets/products/necklace-pendant.jpg"
                alt="Aura Interlocking Necklace"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
                  Signature Statement
                </span>
                <h4 className="font-serif text-lg font-normal">
                  Aura Interlocking 18K Pendant · ₹480
                </h4>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="flex justify-center pt-4">
          <Link
            href="/shop"
            className="btn-gold"
            data-cursor="SHOP"
          >
            <span>Explore All Everyday Pieces</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
