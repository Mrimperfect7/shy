"use client";

import Image from "next/image";
import Link from "next/link";

export default function LiveJewelleryHero() {
  return (
    <section
      aria-label="SHYN.ISH jewellery collection"
      className="relative w-full overflow-hidden bg-[#0d0b09]"
    >
      {/* DESKTOP LAYOUT */}
      <div className="relative hidden w-full md:block">
        <Image
          src="/assets/hero-desktop.jpg"
          alt="SHYN.ISH Jewellery Collection - A Brighter You, Always"
          width={1024}
          height={682}
          priority
          sizes="100vw"
          className="block h-auto w-full"
          quality={95}
        />

        {/* Explore Collection Link Overlay (Desktop) */}
        <Link
          href="/collections"
          className="absolute z-10 block rounded-full transition-all duration-300 hover:ring-2 hover:ring-[#C5A059]/60 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
          style={{
            top: "56.6%",
            left: "7.9%",
            width: "16.1%",
            height: "5.6%",
          }}
          aria-label="Explore Collection"
          data-cursor="EXPLORE"
        />
      </div>

      {/* MOBILE LAYOUT */}
      <div className="relative block w-full md:hidden">
        <Image
          src="/assets/hero-mobile.jpg"
          alt="SHYN.ISH Jewellery Collection - A Brighter You, Always"
          width={576}
          height={1024}
          priority
          sizes="100vw"
          className="block h-auto w-full"
          quality={95}
        />

        {/* Explore Collection Link Overlay (Mobile) */}
        <Link
          href="/collections"
          className="absolute z-10 block rounded-full transition-all duration-300 hover:ring-2 hover:ring-[#C5A059]/60 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
          style={{
            top: "40.1%",
            left: "5.7%",
            width: "32.5%",
            height: "4.4%",
          }}
          aria-label="Explore Collection"
          data-cursor="EXPLORE"
        />

        {/* Scroll to Explore Link Overlay (Mobile) */}
        <a
          href="#explore-collection"
          className="absolute z-10 block cursor-pointer"
          style={{
            bottom: "1.2%",
            left: "25%",
            width: "50%",
            height: "4%",
          }}
          aria-label="Scroll to Explore"
        />
      </div>
    </section>
  );
}
