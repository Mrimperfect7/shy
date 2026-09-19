import Image from "next/image";
import { Sparkles, Droplets, Shield, Sun } from "lucide-react";

export default function MaterialCraftStory() {
  const specs = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#C5A059]" />,
      title: "18K PVD Gold Coating",
      desc: "Physical Vapor Deposition bonds real 18K gold at high temperatures, creating an ultra-durable barrier that resists fading up to 10x longer than traditional flash plating.",
    },
    {
      icon: <Shield className="w-5 h-5 text-[#C5A059]" />,
      title: "316L / 304 Stainless Steel",
      desc: "Surgical-grade steel core that never rusts, discolors, or turns your skin green. 100% nickel-free and hypoallergenic for the most sensitive skin.",
    },
    {
      icon: <Droplets className="w-5 h-5 text-[#C5A059]" />,
      title: "Water & Sweat Resistant",
      desc: "Wear it in the shower, to the gym, or through daily handwashing. Built for true everyday durability without taking off.",
    },
    {
      icon: <Sun className="w-5 h-5 text-[#C5A059]" />,
      title: "Mirror-Polished Finish",
      desc: "Each piece is hand-buffed to achieve a brilliant, liquid-gold luster that catches the daylight with effortless radiance.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#141312] text-[#FAF8F5] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left: Material Macro Visual */}
        <div className="lg:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden border border-[#C5A059]/30 shadow-2xl">
          <Image
            src="/assets/products/necklace-pendant.jpg"
            alt="18K PVD Gold Macro Detail"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#141312]/80 backdrop-blur-md border border-[#C5A059]/30">
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold text-[#C5A059] block mb-1">
              Macro Craftsmanship
            </span>
            <p className="font-serif text-lg text-white font-normal">
              18K PVD Gold Plating over 316L Stainless Steel
            </p>
          </div>
        </div>

        {/* Right: Technical Story */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans mb-3">
              <Sparkles size={14} />
              <span>Honest Metallurgy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal leading-tight">
              Gold that stays gold. Everyday.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/70 font-sans font-light leading-relaxed">
              We eliminate unnecessary middlemen markups to bring you genuine 18K PVD vacuum gold plating over medical-grade stainless steel. No green fingers, no peeling, and no mystery alloys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {specs.map((s, idx) => (
              <div key={idx} className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-[#C5A059]/30 flex items-center justify-center">
                  {s.icon}
                </div>
                <h3 className="font-serif text-base text-white font-medium">
                  {s.title}
                </h3>
                <p className="text-xs text-white/60 font-sans font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
