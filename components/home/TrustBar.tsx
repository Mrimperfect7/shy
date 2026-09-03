import { Sparkles, ShieldCheck, Truck, Gem, IndianRupee } from "lucide-react";

export default function TrustBar() {
  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-[#C5A059]" />,
      title: "18K PVD Gold Plated",
      desc: "Vacuum coated for long-lasting brilliance",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#C5A059]" />,
      title: "316/304 Stainless Steel",
      desc: "Water-resistant & hypoallergenic core",
    },
    {
      icon: <IndianRupee className="w-5 h-5 text-[#C5A059]" />,
      title: "Jewellery Under ₹480",
      desc: "Honest luxury without the markup",
    },
    {
      icon: <Truck className="w-5 h-5 text-[#C5A059]" />,
      title: "All India Delivery",
      desc: "Carefully packed & insured shipping",
    },
  ];

  return (
    <section id="trust-strip" className="border-y border-[#C5A059]/20 bg-[#FAF8F5] py-8 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
        {features.map((f, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 p-3 rounded-xl hover:bg-white/50 transition-colors">
            <div className="w-11 h-11 rounded-full bg-[#141312] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#C5A059]/30">
              {f.icon}
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.14em] font-sans font-semibold text-[#141312]">
                {f.title}
              </h3>
              <p className="text-[12px] text-[#5E564F] font-sans mt-0.5 font-light">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
