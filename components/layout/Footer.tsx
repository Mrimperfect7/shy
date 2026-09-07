import Link from "next/link";
import { Mail, Phone, ArrowUpRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import InstagramIcon from "@/components/shared/InstagramIcon";
import Logo from "@/components/shared/Logo";

const COLUMNS = [
  {
    title: "Shop Collection",
    links: [
      { href: "/shop", label: "All Jewellery" },
      { href: "/collections/bestsellers", label: "Bestsellers" },
      { href: "/collections/under-480", label: "Under ₹480 Tier" },
      { href: "/collections/necklaces", label: "Chains & Necklaces" },
      { href: "/collections/earrings", label: "Earrings & Hoops" },
      { href: "/collections/rings", label: "Rings & Bangles" },
      { href: "/collections/gifts", label: "Gift Boxes" },
    ],
  },
  {
    title: "About SHYN.ISH",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/about#materials", label: "18K PVD Gold & 316L Steel" },
      { href: "/journal", label: "Jewellery Journal" },
      { href: "https://www.instagram.com/shyn.ish/", label: "Instagram @shyn.ish", external: true },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { href: "/track-order", label: "Track Your Order" },
      { href: "/shipping-policy", label: "Shipping Policy (All India)" },
      { href: "/refund-policy", label: "Return & Refund Policy" },
      { href: "/contact", label: "Contact Us" },
      { href: "/contact#faq", label: "Jewellery Care & FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/shipping-policy", label: "Delivery Information" },
    ],
  },
];

export default function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-[#C5A059]/20 bg-[#141312] text-[#FAF8F5]">
      {/* Brand Trust Strip */}
      <div className="border-b border-white/10 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs uppercase tracking-widest font-sans font-medium text-white/90">18K PVD Gold Plated</span>
            <span className="text-[11px] text-white/50 font-light">Anti-tarnish daily wear</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs uppercase tracking-widest font-sans font-medium text-white/90">316/304 Stainless Steel</span>
            <span className="text-[11px] text-white/50 font-light">Honest quality durability</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-5 h-5 text-[#C5A059]" />
            <span className="text-xs uppercase tracking-widest font-sans font-medium text-white/90">All India Delivery</span>
            <span className="text-[11px] text-white/50 font-light">Fast & secure shipping</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-serif text-[#C5A059] font-semibold">₹480</span>
            <span className="text-xs uppercase tracking-widest font-sans font-medium text-white/90">Under ₹480 Tier</span>
            <span className="text-[11px] text-white/50 font-light">Luxury shine without splurge</span>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-5 group">
              <Logo
                variant="horizontal"
                theme="white"
                className="h-10 lg:h-11 w-auto object-contain transition-opacity group-hover:opacity-90"
                alt="SHYN.ISH Luxury Jewellery"
              />
            </Link>
            <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#C5A059] mb-4">
              Everyday Shine. Effortless Style.
            </p>
            <p className="text-sm font-sans leading-relaxed text-white/60 mb-6 max-w-sm">
              Modern fashion jewellery designed to make you sparkle every single day. 18K PVD gold plated & 316/304 stainless steel craftsmanship at honest prices.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/shyn.ish/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram @shyn.ish"
                className="flex items-center gap-2 text-xs tracking-widest uppercase font-sans text-[#C5A059] hover:text-white transition-colors"
              >
                <InstagramIcon size={18} />
                <span>Follow @shyn.ish</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs tracking-[0.2em] uppercase font-sans font-semibold mb-5 text-[#C5A059]">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener" : undefined}
                      className="text-xs font-sans text-white/70 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{link.label}</span>
                      {link.external && <ArrowUpRight size={11} className="opacity-60" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/40">
          <p>© {new Date().getFullYear()} SHYN.ISH. All rights reserved. Best price. Honest quality.</p>
          <div className="flex items-center gap-6">
            <span>Online Prepaid Orders Only · COD Unavailable</span>
            <span>Made with Care for Everyday Shine</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
