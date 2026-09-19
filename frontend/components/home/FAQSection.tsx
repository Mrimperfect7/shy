"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export const SHYNISH_FAQS: FAQItem[] = [
  {
    q: "How did a housewife start SHYN.ISH? What is the story behind the brand?",
    a: "SHYN.ISH began right at a family dining table. Like millions of Indian homemakers, our founder loved wearing elegant jewellery but was tired of cheap brass pieces that turned black within days, and hesitant to wear expensive locker gold for daily household chores. Using her personal household savings, she partnered with certified metallurgy craftspeople to produce 18K PVD gold coated stainless steel jewellery — offering lifetime anti-tarnish lustre directly to women across India at honest prices."
  },
  {
    q: "Why is your 18K gold jewellery priced under ₹480? Is the quality genuine?",
    a: "Yes, 100%! Traditional jewellery showrooms add massive retail rent, distributor margins, and celebrity endorsement fees — marking up costs by 400% to 800%. By operating directly from our home studio without middlemen and dispatching straight to you, we pass all those savings directly to you. You get authentic medical-grade 316L stainless steel with vacuum PVD 18K gold plating at fair factory rates."
  },
  {
    q: "Does 18K PVD gold really not tarnish? Can I wear it while cooking, washing dishes, or bathing?",
    a: "Absolutely! PVD (Physical Vapor Deposition) is a high-tech vacuum process that bonds real 18K gold atoms directly into surgical stainless steel at extreme temperatures. Unlike cheap chemical electroplating that peels off, PVD coating does not react with water, soaps, perfumes, sweat, or cooking steam. You can wear our pieces 24/7 without worrying about discoloration or blackening."
  },
  {
    q: "Is SHYN.ISH jewellery safe for sensitive skin and nickel allergies?",
    a: "Yes. Every piece is crafted from medical-grade 316L and 304 surgical stainless steel, which is 100% hypoallergenic, nickel-free, and lead-free. It will never turn your skin green, irritate sensitive earlobes, or cause allergic reactions."
  },
  {
    q: "How long does delivery take across India?",
    a: "We ship to over 19,000 pin codes across every state and union territory in India. Orders are processed within 24 hours and delivered in 3 to 5 business days with live SMS and WhatsApp tracking updates right to your mobile number."
  },
  {
    q: "How does the packaging look? Is it suitable as a gift?",
    a: "Every single piece is ultrasonically cleaned, sealed in an airtight anti-tarnish sleeve, placed inside our signature microfiber velvet pouch, and tucked into a luxury matte black presentation gift box with gold foil embossing. It arrives ready to be gifted to yourself, a mother, sister, wife, or friend!"
  },
  {
    q: "What if my jewellery arrives damaged or doesn't fit?",
    a: "We treat every customer like family. If your order arrives damaged or with any manufacturing flaw, just WhatsApp or email our founder's care team within 48 hours of delivery with a photo, and we will dispatch a brand new replacement promptly without hassle."
  },
  {
    q: "Why are orders prepaid only? How can I pay securely?",
    a: "To keep our prices strictly under ₹480, we avoid cash-on-delivery RTO courier return costs (which otherwise force brands to inflate prices by ₹200+ per piece). We accept 100% secure payments via all UPI apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking, and Credit/Debit Cards with instant order confirmation."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="founder-faq" className="py-20 lg:py-28 bg-[#FAF8F5] border-t border-[#C5A059]/20 relative">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141312] text-[#FAF8F5] text-xs font-sans font-medium uppercase tracking-widest">
            <HelpCircle size={13} className="text-[#C5A059]" />
            <span>Honest Answers & FAQ</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal tracking-tight">
            Frequently Asked Questions
          </h2>
          
          <p className="font-sans text-sm sm:text-base text-[#5E564F] font-light leading-relaxed">
            Everything you need to know about our founder’s story, our anti-tarnish 18K gold technology, and our under ₹480 pricing promise.
          </p>
        </div>

        {/* Accordion FAQ Cards */}
        <div className="space-y-4">
          {SHYNISH_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#C5A059]/60 shadow-md"
                    : "bg-white/70 border-[#C5A059]/20 hover:border-[#C5A059]/40 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className={`font-serif text-base sm:text-lg font-medium leading-snug ${isOpen ? "text-[#141312]" : "text-[#2C2723]"}`}>
                    {faq.q}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isOpen ? "bg-[#141312] text-[#C5A059]" : "bg-[#FAF8F5] text-[#5E564F]"
                  }`}>
                    {isOpen ? <Minus size={15} strokeWidth={2} /> : <Plus size={15} strokeWidth={2} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[#4A423B] font-sans text-sm sm:text-[15px] leading-relaxed border-t border-[#C5A059]/10 animate-in fade-in duration-200">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Founder Help CTA Bar */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-[#141312] to-[#25211D] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-[#C5A059]/30">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] flex-shrink-0">
              <HeartHandshake size={24} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-white">Have a specific question for our founder?</h3>
              <p className="text-xs text-white/70 font-sans mt-0.5">We reply personally on WhatsApp within a few hours.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi%20SHYN.ISH,%20I%20have%20a%20question%20about%20your%20jewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-6 py-3 text-xs font-semibold whitespace-nowrap shadow-md hover:shadow-xl transition-all"
          >
            Chat with Founder
          </a>
        </div>

      </div>
    </section>
  );
}
