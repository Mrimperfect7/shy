"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "WARM",
    subtitle: "Activate the Ayurvedic Herbs",
    desc: "Take a small amount of Eshara Hair Oil and gently warm it between your palms.",
    detail: "The gentle warmth helps the oil spread easily through your hair and makes your oiling ritual more soothing.",
    image: "/assets/step1.jpg",
  },
  {
    number: "02",
    title: "MASSAGE",
    subtitle: "Deep Scalp Nourishment",
    desc: "Gently massage the oil into your scalp using your fingertips in slow, circular motions. Work the remaining oil through your lengths and ends.",
    detail: "Take a moment to let the Ayurvedic goodness sink in while you enjoy the ritual of nourishing your hair.",
    image: "/images/steps/step2.jpg",
  },
  {
    number: "03",
    title: "RESTORE",
    subtitle: "Herbal Absorption",
    desc: "Leave the oil on for 20–30 minutes, then wash your hair as usual.",
    detail: "Give the carefully crafted Ayurvedic blend time to nourish your scalp and strands, leaving your hair feeling softer, smoother and cared for.For best result,avoid using harsh shampoos",
    image: "/assets/step3-restore.jpg",
  },
  {
    number: "04",
    title: "DRY",
    subtitle: "Preserve Softness",
    desc: "Gently squeeze out excess water and pat your hair dry with a soft towel.",
    detail: "Avoid harsh rubbing and let your hair dry gently, preserving the softness and nourishment of your Eshara ritual.",
    image: "/assets/step4-dry.jpg",
  },
];

export default function HowToUse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section aria-labelledby="how-to-use-title" className="py-12 sm:py-16 lg:py-32 overflow-hidden" style={{ background: "var(--cream)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16 lg:mb-28">
          <p className="section-eyebrow justify-center mb-3 sm:mb-4 flex items-center gap-1.5 text-xs tracking-widest uppercase font-bold text-[var(--forest)]">
            <Sparkles size={14} className="text-[#D4AF37]" /> Application Ritual &amp; Roadmap
          </p>
          <h2 id="how-to-use-title" className="font-serif text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight" style={{ color: "var(--charcoal)" }}>
            Your Daily Ritual, Simplified
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm text-gray-600 font-sans max-w-md mx-auto">
            Follow our 4-step Ayurvedic roadmap to maximize absorption, scalp wellness, and natural shine.
          </p>
        </div>

        {/* ── Continuous Animated Roadmap Container ── */}
        <div className="relative" ref={containerRef}>
          
          {/* ── Desktop Central Roadmap Tracks ── */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-gray-300 transform -translate-x-1/2" />
          <motion.div 
            className="hidden lg:block absolute left-1/2 top-4 w-[2px] transform -translate-x-1/2 origin-top rounded-full shadow-sm" 
            style={{ background: "var(--forest)", height: lineHeight }}
          />

          {/* ── Mobile Left-Aligned Roadmap Tracks ── */}
          <div className="block lg:hidden absolute left-5 sm:left-7 top-4 bottom-4 w-[2px] bg-gray-300 rounded-full" />
          <motion.div 
            className="block lg:hidden absolute left-5 sm:left-7 top-4 w-[2.5px] bg-[var(--forest)] rounded-full origin-top shadow-xs" 
            style={{ height: lineHeight }}
          />

          {/* Steps List */}
          <div className="space-y-12 sm:space-y-16 lg:space-y-32">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={step.number} 
                  className={`relative flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-24 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  
                  {/* ── Mobile Roadmap Step Pin Node ── */}
                  <div className="block lg:hidden absolute left-5 sm:left-7 -translate-x-1/2 top-0 z-20">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="w-10 h-10 rounded-full bg-white border-2 border-[var(--forest)] text-[var(--forest)] flex items-center justify-center font-serif font-bold text-sm shadow-md"
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 pl-12 sm:pl-16 lg:pl-0 flex justify-center">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="relative w-full aspect-square max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-md border border-black/5 bg-white group"
                    >
                      <Image 
                        src={step.image} 
                        alt={step.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 90vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
                      
                      {/* Step Tag Overlay on Mobile Image */}
                      <div className="absolute bottom-3 left-3 lg:hidden flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-sans font-bold uppercase tracking-wider">
                        <CheckCircle2 size={11} className="text-[#D4AF37]" />
                        <span>Step {step.number}: {step.title}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Desktop Center Node (Number Pin) ── */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ type: "spring", stiffness: 220, delay: 0.15 }}
                    className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 items-center justify-center z-10 hidden lg:flex shadow-md hover:scale-110 transition-transform"
                    style={{ borderColor: "var(--forest)", color: "var(--forest)" }}
                  >
                    <span className="font-serif font-bold text-xl">{step.number}</span>
                  </motion.div>

                  {/* Text Description Side */}
                  <div className={`w-full lg:w-1/2 pl-12 sm:pl-16 ${isEven ? 'lg:pl-0 lg:pr-12' : 'lg:pl-12 lg:pr-0'}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.5, delay: 0.15 }}
                      className="flex flex-col h-full justify-center max-w-md mx-auto lg:max-w-none text-left"
                    >
                      {/* Step Header */}
                      <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                        <span className="hidden lg:inline-block text-xs font-serif font-bold text-[var(--forest)] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          STEP {step.number}
                        </span>
                        <span className="text-xs sm:text-sm tracking-[0.2em] uppercase font-sans font-bold text-[var(--forest)]">
                          {step.title}
                        </span>
                        <span className="text-gray-400 text-xs">·</span>
                        <span className="text-[11px] sm:text-xs font-sans text-gray-500 font-medium italic">
                          {step.subtitle}
                        </span>
                      </div>

                      <p className="font-sans font-bold text-base sm:text-xl lg:text-2xl leading-snug mb-2 sm:mb-3 text-[var(--charcoal)]">
                        {step.desc}
                      </p>
                      
                      <p className="font-sans text-xs sm:text-sm leading-relaxed text-gray-600 bg-white/60 p-3 sm:p-4 rounded-xl border border-[#EAE5DC] shadow-xs">
                        {step.detail}
                      </p>
                    </motion.div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 sm:mt-24 lg:mt-32 pt-8 border-t text-center space-y-2" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-serif text-base sm:text-xl font-bold text-[var(--charcoal)]">
            Make it a ritual. Consistency brings radiant results.
          </h3>
          <p className="text-xs sm:text-sm font-sans max-w-xl mx-auto text-gray-500">
            For best results, use Eshara 2–3 times weekly as part of your holistic Ayurvedic wellness routine.
          </p>
        </div>
      </div>
    </section>
  );
}
