"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import WhatsAppIcon from "./WhatsAppIcon";

export default function FloatingButtons() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      if (pathname === "/") {
        // On Home page: only visible starting from 'Our Collections' section
        const target = document.getElementById("our-collections");
        if (target) {
          const rect = target.getBoundingClientRect();
          // Becomes visible when 'Our Collections' enters viewport
          setIsVisible(rect.top <= window.innerHeight * 0.85);
        } else {
          setIsVisible(window.scrollY > 700);
        }
      } else if (pathname?.startsWith("/products/")) {
        // On Product page: only visible starting from 'Benefits' section
        const target = document.getElementById("benefits-section");
        if (target) {
          const rect = target.getBoundingClientRect();
          // Becomes visible when 'Benefits' enters viewport
          setIsVisible(rect.top <= window.innerHeight * 0.85);
        } else {
          setIsVisible(window.scrollY > 800);
        }
      } else if (pathname?.startsWith("/admin")) {
        // Hide in admin
        setIsVisible(false);
      } else {
        // Other pages (shop, contact, about, etc): visible after scrolling down a bit
        setIsVisible(window.scrollY > 300);
      }
    };

    // Run check on mount and on scroll
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [pathname]);

  if (!isVisible) return null;

  const isProductPage = pathname?.startsWith("/products/");
  const isCheckoutPage = pathname?.startsWith("/checkout") || pathname?.startsWith("/cart");

  return (
    <div className="transition-all duration-500 animate-in fade-in zoom-in-95">
      {/* Left Floating Button: Shop All Jewellery */}
      {!isProductPage && !isCheckoutPage && (
        <div className="fixed bottom-5 md:bottom-6 left-4 md:left-6 z-[45] flex items-center">
          <Link 
            href="/shop"
            className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#141312] text-[#FAF8F5] font-sans text-[11px] sm:text-xs font-semibold tracking-widest uppercase rounded-full shadow-2xl hover:scale-105 transition-all border border-[#C5A059]/50 backdrop-blur-sm cursor-pointer"
            aria-label="Shop Now - View SHYN.ISH Jewellery"
          >
            <ShoppingBag size={14} className="text-[#C5A059] shrink-0" />
            <span className="tracking-widest">SHOP ALL</span>
          </Link>
        </div>
      )}
      
      {/* Right Floating Button: WhatsApp */}
      <div className={`fixed ${isProductPage ? 'bottom-20 md:bottom-6' : 'bottom-5 md:bottom-6'} right-4 sm:right-6 z-[45] flex items-center justify-center group`}>
        <a 
          href="https://wa.me/919876543210?text=Hello%20SHYN.ISH!%20I%20have%20a%20question%20about%20your%20jewellery."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-2xl hover:scale-110 transition-all p-2.5"
          aria-label="WhatsApp Support"
        >
          <WhatsAppIcon size={22} fill="#ffffff" />
        </a>
        {/* Tooltip */}
        <span className="absolute right-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#141312] text-white text-xs font-sans font-medium px-2.5 py-1 rounded-lg shadow-md pointer-events-none whitespace-nowrap border border-[#C5A059]/30">
          Chat on WhatsApp
        </span>
      </div>
    </div>
  );
}
