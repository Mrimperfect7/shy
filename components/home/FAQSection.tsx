"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export const defaultFaqData: FAQItem[] = [
  {
    q: "What makes Eshara oil unique?",
    a: "Eshara oil is crafted with carefully selected Ayurvedic herbs and natural oils using traditional Ayurvedic principles. The formulation is designed to nourish the scalp and support overall hair wellness as part of a regular hair care routine."
  },
  {
    q: "Is Eshara oil suitable for both men and women?",
    a: "Yes. Eshara oil is suitable for both men and women and can be used as part of any regular hair-care regimen."
  },
  {
    q: "Is Eshara oil suitable for all hair types?",
    a: "Yes. The oil can be used on dry, normal, oily, straight, wavy, and curly hair types."
  },
  {
    q: "How often should I use Eshara oil?",
    a: "For best results, apply the oil 2–3 times a week or as part of your regular hair care routine."
  },
  {
    q: "Is Eshara oil suitable for dry and damaged hair?",
    a: "Yes. The nourishing blend of Ayurvedic herbs and natural oils helps care for dry, rough, and dull-looking hair while improving softness and manageability."
  },
  {
    q: "What is the best hair oil for natural growth?",
    a: "The best hair oil is one that combines authentic Ayurvedic herbs with traditional preparation methods. Eshara oil is made with carefully selected herbal ingredients to nourish the scalp, strengthen hair, and support healthy, naturally beautiful hair with regular use."
  },
  {
    q: "Is it used for children?",
    a: "Yes, for above 5 years old."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#FAF8F5] border-t border-[#EDE8E0]">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A2612]/5 text-[#0A2612] text-xs font-sans font-semibold uppercase tracking-wider mb-3">
            <HelpCircle size={14} className="text-[#16A34A]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-medium tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm text-gray-600 mt-2">
            Everything you need to know about Eshara Naturals Herbal Hair Oil and the Ayurvedic ritual.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {defaultFaqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? "bg-white border-[#C9BFA8] shadow-sm ring-1 ring-[#0A2612]/5" 
                    : "bg-white/80 hover:bg-white border-[#EAE5DC]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A] leading-snug">
                    {item.q}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "bg-[#0A2612] text-white" : "bg-[#F4F0E8] text-[#555]"
                  }`}>
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm font-sans text-[#4A4A4A] leading-relaxed border-t border-[#F2ECE1] pt-4 animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
