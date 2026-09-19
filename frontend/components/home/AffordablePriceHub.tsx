import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function AffordablePriceHub() {
  const tiers = [
    {
      price: "₹199",
      label: "UNDER ₹199",
      tagline: "Everyday essentials & dainty stacks",
      features: ["Eternity band rings", "Petite stud earrings", "Minimalist layering chains"],
      href: "/collections/under-199",
      bgClass: "bg-[#FAF8F5]",
      borderClass: "border-[#C5A059]/25",
    },
    {
      price: "₹299",
      label: "UNDER ₹299",
      tagline: "Statement hoops & delicate charms",
      features: ["French twisted hoops", "Lucky clover huggies", "Herringbone silky chains"],
      href: "/collections/under-299",
      bgClass: "bg-[#F5EFE6]",
      borderClass: "border-[#C5A059]/40",
      featured: true,
    },
    {
      price: "₹480",
      label: "UNDER ₹480",
      tagline: "The signature luxury collection",
      features: ["Aura interlocking pendants", "Roman numeral bangles", "Heavy-plated 18K PVD gold"],
      href: "/collections/under-480",
      bgClass: "bg-[#141312]",
      textClass: "text-[#FAF8F5]",
      borderClass: "border-[#C5A059]/50",
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans justify-center">
            <Sparkles size={14} />
            <span>Honest Pricing</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Shine Without the Splurge
          </h2>
          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light">
            Luxury jewellery shouldn&apos;t cost a fortune. Designed with medical-grade steel and thick 18K PVD gold plating at honest prices under ₹480.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className={`rounded-3xl p-8 lg:p-10 flex flex-col justify-between border ${tier.borderClass} ${tier.bgClass} relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              {tier.featured && (
                <div className="absolute top-4 right-4">
                  <span className="badge-gold text-[10px]">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-sans font-semibold text-[#C5A059] block mb-2">
                  {tier.label}
                </span>

                <div className="flex items-baseline gap-1 my-3">
                  <span className={`font-serif text-5xl lg:text-6xl font-medium ${tier.textClass || "text-[#141312]"}`}>
                    {tier.price}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-[#5E564F]">
                    & Below
                  </span>
                </div>

                <p className={`text-sm font-sans mb-6 ${tier.textClass ? "text-white/70" : "text-[#5E564F]"}`}>
                  {tier.tagline}
                </p>

                <ul className="space-y-3 pt-4 border-t border-[#C5A059]/20 text-xs font-sans">
                  {tier.features.map((feat) => (
                    <li key={feat} className={`flex items-center gap-2.5 ${tier.textClass ? "text-white/80" : "text-[#181614]"}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#C5A059]/15">
                <Link
                  href={tier.href}
                  className={`w-full py-3.5 px-6 rounded-full text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all ${
                    tier.textClass
                      ? "btn-gold"
                      : "btn-outline w-full justify-center"
                  }`}
                  data-cursor="SHOP"
                >
                  <span>Explore {tier.label}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
