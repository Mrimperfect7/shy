"use client";

import React from "react";

const phrases = [
  "100% NATURAL",
  "NO HARSH CHEMICALS",
  "GENUINE PRODUCT",
  "SAFELY CRAFTED"
];

export default function ThickMarquee() {
  return (
    <div className="w-full bg-[var(--forest)] text-white py-6 md:py-8 overflow-hidden relative border-y border-white/10">
      <div className="flex w-fit animate-[marquee_20s_linear_infinite]">
        {/* We duplicate the array multiple times to ensure seamless infinite scrolling */}
        {[...Array(4)].map((_, arrayIndex) => (
          <div key={arrayIndex} className="flex items-center whitespace-nowrap px-4">
            {phrases.map((phrase, idx) => (
              <React.Fragment key={`${arrayIndex}-${idx}`}>
                <span className="text-2xl md:text-3xl font-serif tracking-widest uppercase mx-8">
                  {phrase}
                </span>
                <span className="text-bronze text-xl mx-8 opacity-60">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
