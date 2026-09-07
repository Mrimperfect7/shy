"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/shop/CartDrawer";
import SearchOverlay from "@/components/shop/SearchOverlay";
import MobileMenu from "@/components/layout/MobileMenu";
import { ShoppingBag, Search, User, Menu, LogOut, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/shared/Logo";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/collections/bestsellers", label: "Bestsellers" },
  { href: "/collections/under-480", label: "Under ₹480" },
  { href: "/collections/necklaces", label: "Necklaces" },
  { href: "/collections/earrings", label: "Earrings" },
  { href: "/collections/gifts", label: "Gifting" },
  { href: "/about", label: "Story" },
];

export default function Header({ isLoggedIn: serverLoggedIn = false }: { isLoggedIn?: boolean }) {
  const { cart, isOpen, openCart, closeCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(serverLoggedIn);

  useEffect(() => {
    const check = () => {
      const cookies = document.cookie.split(";").map(c => c.trim());
      setIsLoggedIn(cookies.some(c => c.startsWith("eshara_logged_in=") || c.startsWith("shyn_logged_in=")));
    };
    check();
  }, []);

  const totalQty = cart?.totalQuantity ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const locked = isOpen || searchOpen || mobileOpen;
    if (locked) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add("scroll-locked");
    } else {
      const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10));
      document.body.classList.remove("scroll-locked");
      document.body.style.top = "";
      if (scrollY) window.scrollTo(0, scrollY);
    }
  }, [isOpen, searchOpen, mobileOpen]);

  return (
    <>
      <div style={{ height: "calc(2.5rem + 4.2rem)" }} aria-hidden />

      <header
        ref={headerRef}
        className={`site-header ${scrolled ? "scrolled shadow-sm" : "bg-[#FAF8F5]/90 backdrop-blur-md"}`}
        style={{ top: "2.5rem" }}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Left: Brand Logo */}
            <Link
              href="/"
              aria-label="SHYN.ISH — Everyday Shine. Effortless Style."
              className="flex items-center flex-shrink-0 group py-1 mr-4 lg:mr-8 xl:mr-12"
              data-cursor="SHINE"
            >
              <Logo
                variant="horizontal"
                theme="dark"
                priority
                className="h-7 sm:h-7.5 lg:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            {/* Center: Desktop Nav */}
            <nav
              aria-label="Primary navigation"
              className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] xl:text-[11px] tracking-[0.11em] uppercase font-sans font-medium whitespace-nowrap text-[#181614]/80 hover:text-[#C5A059] transition-colors relative group py-1 px-0.5"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C5A059] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right: Actions & Cart */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                id="search-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="p-2 text-[#181614] hover:text-[#C5A059] transition-colors"
                data-cursor="SEARCH"
              >
                <Search size={19} strokeWidth={1.4} />
              </button>

              <Link
                href="/account/wishlist"
                aria-label="Wishlist"
                className="hidden sm:flex p-2 text-[#181614] hover:text-[#C5A059] transition-colors"
                data-cursor="SAVED"
              >
                <Heart size={19} strokeWidth={1.4} />
              </Link>

              {isLoggedIn ? (
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/account/login';
                  }}
                  aria-label="Logout"
                  className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full font-sans text-[11px] font-medium tracking-wider uppercase border border-[#C5A059]/40 text-[#141312] hover:bg-[#141312] hover:text-[#FAF8F5] transition-all"
                >
                  <LogOut size={13} strokeWidth={1.5} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/account/login"
                  aria-label="Login"
                  className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full font-sans text-[11px] font-medium tracking-wider uppercase border border-[#C5A059]/40 text-[#141312] hover:bg-[#141312] hover:text-[#FAF8F5] transition-all"
                >
                  <User size={13} strokeWidth={1.5} />
                  <span>Sign In</span>
                </Link>
              )}

              <button
                id="cart-btn"
                onClick={openCart}
                aria-label={`Cart with ${totalQty} items`}
                className="relative p-2 text-[#181614] hover:text-[#C5A059] transition-colors"
                data-cursor="CART"
              >
                <motion.div
                  key={totalQty}
                  initial={{ scale: 1 }}
                  animate={totalQty > 0 ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <ShoppingBag size={20} strokeWidth={1.4} />
                </motion.div>
                {totalQty > 0 && (
                  <motion.span
                    key={`badge-${totalQty}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-0 right-0 w-4 h-4 bg-[#C5A059] text-[#141312] text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm"
                  >
                    {totalQty > 9 ? "9+" : totalQty}
                  </motion.span>
                )}
              </button>

              <button
                id="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className="lg:hidden p-2 text-[#181614] hover:text-[#C5A059] transition-colors ml-1"
              >
                <Menu size={22} strokeWidth={1.4} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Overlays */}
      {isOpen && <CartDrawer onClose={closeCart} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} isLoggedIn={isLoggedIn} />}
    </>
  );
}
