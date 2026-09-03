import Link from "next/link";
import Image from "next/image";
import { Package, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function PackagingSection() {
  const steps = [
    {
      num: "01",
      title: "Anti-Tarnish Seal",
      desc: "Each piece is ultrasonically polished and placed in an airtight protective ziplock sleeve to preserve its showroom gold luster.",
    },
    {
      num: "02",
      title: "Signature Velvet Pouch",
      desc: "Tucked into a soft microfiber velvet pouch, perfect for safe storage and effortless travel in your handbag.",
    },
    {
      num: "03",
      title: "Luxury Rigid Box",
      desc: "Housed in our heavy-gauge matte black jewellery box with gold foil embossing, ready for unforgettable unboxing.",
    },
    {
      num: "04",
      title: "Tamper-Proof Transit",
      desc: "Discreetly dispatched in eco-friendly bubble-reinforced outer packaging for secure, damage-free delivery across India.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5] border-t border-[#C5A059]/15">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium font-sans justify-center">
            <Package size={14} />
            <span>Unboxing Standard</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Packed with Absolute Care
          </h2>
          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light">
            We treat every order as a special occasion. Whether a gift for yourself or someone you cherish, the unboxing experience is meticulously designed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-[#C5A059]/20 shadow-sm space-y-4 hover:border-[#C5A059]/50 transition-colors"
            >
              <span className="font-serif text-3xl text-[#C5A059] font-medium block">
                {step.num}
              </span>
              <h3 className="font-serif text-xl text-[#141312] font-normal">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5E564F] font-sans font-light leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
