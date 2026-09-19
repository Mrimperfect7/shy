"use client";

import Image from "next/image";
import Link from "next/link";
import desktopHero from "../099EE2DA-AC47-42F6-89F2-C58EDDD1417F.jpeg";
import mobileHero from "../64689748-9980-452E-AAC9-06AACFEC3DFE.jpeg";

export default function LiveJewelleryHero() {
  return (
    <section
      aria-label="SHYN.ISH jewellery collection"
      className="relative w-full overflow-hidden bg-[#0d0b09]"
    >
      {/* DESKTOP LAYOUT */}
      <div className="relative hidden w-full md:block">
        <Image
          src={desktopHero}
          alt="SHYN.ISH jewellery collection"
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        {/* Top Navigation Menu Overlays (Desktop Only) */}
        <Link href="/" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "31%", width: "5%", height: "6%" }} aria-label="Home" />
        <Link href="/shop" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "37.5%", width: "5%", height: "6%" }} aria-label="Shop" />
        <Link href="/collections" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "43%", width: "8%", height: "6%" }} aria-label="Collections" />
        <Link href="/tryon" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "51.5%", width: "6%", height: "6%" }} aria-label="Try On" />
        <Link href="#our-founder" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "58%", width: "7%", height: "6%" }} aria-label="Our Founder" />

        {/* Top Right Icons Overlays (Desktop) */}
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-search'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "3%", left: "80%", width: "3.5%", height: "7%" }} aria-label="Search" />
        <Link href="/account/wishlist" className="absolute z-10 block cursor-pointer" style={{ top: "3%", left: "84%", width: "3.5%", height: "7%" }} aria-label="Wishlist/Account" />
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "3%", left: "88%", width: "3.5%", height: "7%" }} aria-label="Cart" />
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "3%", left: "92.5%", width: "3.5%", height: "7%" }} aria-label="Menu" />

        <Link
          href="/shop"
          className="absolute z-10 block"
          style={{
            top: "55.5%",
            left: "7.5%",
            width: "14.5%",
            height: "6%",
          }}
          aria-label="Explore Collection"
        />
        <Link
          href="#our-founder"
          className="absolute z-10 block"
          style={{
            top: "55.5%",
            left: "23%",
            width: "12%",
            height: "6%",
          }}
          aria-label="Watch Founder Story"
        />
      </div>

      {/* MOBILE LAYOUT */}
      <div className="relative block w-full md:hidden">
        <Image
          src={mobileHero}
          alt="SHYN.ISH jewellery collection"
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        {/* Top Right Icons Overlays (Mobile) */}
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-search'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "2%", left: "59%", width: "7%", height: "5%" }} aria-label="Search" />
        <Link href="/account/wishlist" className="absolute z-10 block cursor-pointer" style={{ top: "2%", left: "67%", width: "7%", height: "5%" }} aria-label="Wishlist/Account" />
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "2%", left: "77%", width: "7%", height: "5%" }} aria-label="Cart" />
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))} className="absolute z-10 block cursor-pointer opacity-0" style={{ top: "2%", left: "89%", width: "7%", height: "5%" }} aria-label="Menu" />

        <Link
          href="/shop"
          className="absolute z-10 block"
          style={{
            top: "39.5%",
            left: "5.5%",
            width: "43%",
            height: "6%",
          }}
          aria-label="Explore Collection"
        />
        <Link
          href="#our-founder"
          className="absolute z-10 block"
          style={{
            top: "46.5%",
            left: "5.5%",
            width: "36%",
            height: "6%",
          }}
          aria-label="Watch Founder Story"
        />
      </div>
    </section>
  );
}
