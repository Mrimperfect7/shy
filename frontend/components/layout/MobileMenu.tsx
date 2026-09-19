"use client";
import Link from "next/link";
import { X, MessageCircle, Heart } from "lucide-react";
import InstagramIcon from "@/components/shared/InstagramIcon";
import Logo from "@/components/shared/Logo";
import { useEffect } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop All" },
  { href: "/collections/bestsellers", label: "Bestsellers" },
  { href: "/collections/under-480", label: "Under ₹480" },
  { href: "/watch-builder", label: "Watch Builder" },
  { href: "/collections/necklaces", label: "Necklaces & Chains" },
  { href: "/collections/earrings", label: "Earrings" },
  { href: "/collections/rings", label: "Rings & Bangles" },
  { href: "/collections/gifts", label: "Gifting Experience" },
  { href: "/about", label: "Brand Story" },
  { href: "/journal", label: "Journal & Styling" },
];

export default function MobileMenu({ onClose, isLoggedIn = false }: { onClose: () => void, isLoggedIn?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="mobile-menu fixed inset-0 bg-[#FAF8F5] z-[150] flex flex-col" role="dialog" aria-label="Navigation menu" aria-modal="true">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#C5A059]/20">
        <Link href="/" onClick={onClose} className="flex items-center">
          <Logo variant="horizontal" theme="dark" className="h-8 w-auto object-contain" />
        </Link>
        <button onClick={onClose} aria-label="Close menu" className="p-2 text-[#141312] hover:text-[#C5A059] transition-colors">
          <X size={24} strokeWidth={1.4} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile navigation">
        <ul className="divide-y divide-[#C5A059]/15">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-2.5 font-serif text-lg sm:text-xl font-medium text-[#181614] hover:text-[#C5A059] transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-[#C5A059] text-sm">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-5 border-t border-[#C5A059]/20 space-y-3 bg-[#FAF8F5]">
        <div className="grid grid-cols-2 gap-2">
          {isLoggedIn ? (
            <Link href="/account" onClick={onClose} className="btn-primary w-full justify-center text-xs py-3">
              My Account
            </Link>
          ) : (
            <Link href="/account/login" onClick={onClose} className="btn-primary w-full justify-center text-xs py-3">
              Sign In
            </Link>
          )}
          <Link href="/account/wishlist" onClick={onClose} className="btn-outline w-full justify-center text-xs py-3 flex items-center gap-1.5">
            <Heart size={14} />
            <span>Wishlist</span>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="https://www.instagram.com/shyn.ish/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase font-sans text-[#5E564F] hover:text-[#C5A059] transition-colors"
          >
            <InstagramIcon size={15} />
            <span>@shyn.ish</span>
          </Link>
          <Link
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase font-sans text-[#5E564F] hover:text-[#C5A059] transition-colors"
          >
            <MessageCircle size={15} />
            <span>WhatsApp Care</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
