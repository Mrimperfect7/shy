import { Sparkles, Shield, Droplets, Gem, Award } from "lucide-react";

export default function AboutSection() {
  const steps = [
    {
      step: "01",
      title: "SCULPT & ERGONOMICS",
      desc: "Designed for effortless daily wear. Every ring, hoop, and chain is balanced to feel featherlight without snagging or pulling.",
    },
    {
      step: "02",
      title: "SURGICAL STEEL CORE",
      desc: "Forged in medical-grade 316L/304 stainless steel. 100% hypoallergenic, nickel-free, and guaranteed never to turn your skin green.",
    },
    {
      step: "03",
      title: "18K PVD GOLD ATOMIC BOND",
      desc: "Using Physical Vapor Deposition, real 18K gold is vacuum-bonded to the core at high heat, creating a waterproof barrier up to 10x more resilient than traditional plating.",
    },
    {
      step: "04",
      title: "MIRROR HAND-POLISHING",
      desc: "Each piece is hand-buffed to a liquid-gold finish that catches natural light with genuine fine-jewellery radiance.",
    },
    {
      step: "05",
      title: "GIFT-READY VELVET UNBOXING",
      desc: "Nestled in our signature velvet pouches and boxes with anti-tarnish lining, designed to protect your pieces for years.",
    },
  ];

  return (
    <section aria-labelledby="about-title" className="py-16 lg:py-24 bg-[#FAF8F5] border-y border-[#C5A059]/15">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Brand Story Narrative */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase">
              <Sparkles size={12} />
              <span>The SHYN.ISH Standard</span>
            </div>

            <h2
              id="about-title"
              className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141312] leading-[1.15]"
            >
              Everyday Luxury.<br />
              <span className="italic font-normal text-[#C5A059]">Crafted to Endure.</span>
            </h2>

            <div className="space-y-4 font-sans text-base leading-relaxed text-[#5E564F]">
              <p>
                Fine jewellery has spent decades trapped behind exorbitant retail markups, while fast-fashion jewellery tarnishes, turns fingers green, and ends up in landfills after three wears.
              </p>
              <p>
                At <strong className="text-[#141312] font-semibold">SHYN.ISH</strong>, we believe every woman deserves pieces she can live in: jewellery that withstands morning showers, intense workouts, and daily perfume spritzes without losing its warm golden glow.
              </p>
              <p className="font-serif italic text-lg sm:text-xl text-[#C5A059] pt-2">
                "Real 18K gold luster. Medical-grade endurance. Everything under ₹480."
              </p>
              <p>
                By cutting out distributors and utilizing high-vacuum Physical Vapor Deposition (PVD), we deliver fine-jewellery grade anti-tarnish aesthetics directly from the bench to your collarbone.
              </p>
            </div>
          </div>

          {/* Right Column: Craftsmanship Steps */}
          <div className="space-y-4">
            {steps.map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex gap-4 p-5 rounded-2xl bg-white border border-[#C5A059]/20 shadow-xs transition-all hover:shadow-md hover:border-[#C5A059]/50"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[#141312] text-[#FAF8F5] font-serif font-semibold text-sm shadow-inner">
                  {step}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xs tracking-[0.18em] uppercase font-sans font-bold text-[#141312]">
                    {title}
                  </h3>
                  <p className="text-sm font-sans text-[#5E564F] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
