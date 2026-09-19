import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-gradient-to-b from-[#FAF8F5] to-[#141312] text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141312] border border-[#C5A059]/40 text-[#FAF8F5]">
          <Sparkles size={13} className="text-[#C5A059]" />
          <span className="text-[11px] uppercase tracking-[0.25em] font-sans font-medium">
            Shine Your Way
          </span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#141312] font-normal leading-[1.05]">
          Elevate Your Everyday <br />
          <span className="italic font-normal text-[#C5A059]">Without Compromise.</span>
        </h2>

        <p className="text-base sm:text-lg text-[#5E564F] font-sans font-light max-w-xl mx-auto">
          Explore our collection of 18K PVD gold plated chains, twisted hoops, and eternity rings starting at just ₹99. All India delivery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="btn-gold px-10 py-4 text-xs font-semibold"
            data-cursor="SHOP"
          >
            <span>Explore All Jewellery</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/collections/bestsellers"
            className="btn-outline px-8 py-4 text-xs"
          >
            View Bestsellers
          </Link>
        </div>

      </div>
    </section>
  );
}
