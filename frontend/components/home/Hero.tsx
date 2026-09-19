"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-black"
    >
      {/* Background Video with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: videoY, scale: videoScale, opacity }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center opacity-70"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-8xl mx-auto px-6 lg:px-12 pb-16 lg:pb-32 pt-32 lg:pt-20 w-full text-white flex justify-center h-full items-end">
        <div className="max-w-3xl text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/products/eshara-natural-hair-oil" className="btn-primary bg-white text-black hover:bg-gray-100 px-8">
              Shop now <ArrowRight size={14} />
            </Link>
            <Link href="/about" className="btn-outline bg-black/40 backdrop-blur-sm border-white/50 text-white hover:bg-black/60 px-8">
              Buy now
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 right-6 lg:right-12 flex flex-col items-center gap-3 z-20"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-sans text-white/60" style={{ writingMode: "vertical-rl" }}>
            Scroll to explore
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent" />
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent, var(--ivory))" }}
      />
    </section>
  );
}
