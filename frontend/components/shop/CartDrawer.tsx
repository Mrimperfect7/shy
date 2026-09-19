"use client";
import { useEffect, useRef, useState } from "react";
import { X, Minus, Plus, ShoppingBag, Tag, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
const formatPrice = (amount: string | number, currencyCode: string = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

const FREE_SHIPPING_THRESHOLD = 480;

const CartTimer = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    let end: number;
    const storedEnd = sessionStorage.getItem("shyn_cart_timer_end");
    
    if (storedEnd) {
      end = parseInt(storedEnd, 10);
      if (end < Date.now()) {
        end = Date.now() + 15 * 60 * 1000;
        sessionStorage.setItem("shyn_cart_timer_end", end.toString());
      }
    } else {
      end = Date.now() + 15 * 60 * 1000;
      sessionStorage.setItem("shyn_cart_timer_end", end.toString());
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(diff);
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return <span>Your cart is waiting! {mins}:{secs.toString().padStart(2, '0')}</span>;
};

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Reconstruct subtotal from lines since cart structure is simplified
  const subtotal = cart?.lines?.reduce((total: number, line: any) => total + (parseFloat(line.price) * line.quantity), 0) || 0;
  const total = subtotal - discountAmount;
  const currency = "INR";

  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    drawerRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Recalculate discount if cart changes
  useEffect(() => {
    if (discountAmount > 0 && subtotal === 0) {
      setDiscountAmount(0);
      setCouponSuccess("");
      setCouponCode("");
    }
  }, [subtotal, discountAmount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setIsValidating(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setDiscountAmount(data.calculatedDiscount);
        setCouponSuccess(`Coupon applied! You saved ${formatPrice(data.calculatedDiscount, currency)}`);
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setDiscountAmount(0);
      }
    } catch (err) {
      setCouponError("Something went wrong. Please try again.");
      setDiscountAmount(0);
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponSuccess("");
    setCouponError("");
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} aria-hidden />
      <div ref={drawerRef} className="cart-drawer" role="dialog" aria-label="Shopping cart" aria-modal="true" tabIndex={-1}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} style={{ color: "var(--charcoal)" }} />
            <span className="text-xs tracking-widest uppercase font-sans font-semibold" style={{ color: "var(--charcoal)" }}>
              Your Ritual Bag
            </span>
            {(cart?.totalQuantity ?? 0) > 0 && (
              <span className="text-xs font-sans px-1.5 py-0.5" style={{ background: "var(--forest)", color: "#fff" }}>
                {cart?.totalQuantity}
              </span>
            )}
          </div>
          <button onClick={onClose} aria-label="Close cart" className="p-1.5 hover:opacity-60 transition-opacity">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Shipping Banner */}
        <div className="px-6 py-2.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--cream)" }}>
          <p className="text-xs font-sans text-[#1A4D2E] font-medium flex items-center gap-1.5">
            <span>🌿</span> <span>Standard Express Delivery across India (₹40)</span>
          </p>
        </div>

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag size={40} strokeWidth={1} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p className="font-serif text-xl mb-2" style={{ color: "var(--charcoal)" }}>Your bag is empty</p>
              <p className="text-sm font-sans mb-6" style={{ color: "var(--text-muted)" }}>Start your ayurvedic ritual today.</p>
              <button onClick={onClose} className="btn-primary">Explore Products</button>
            </div>
          ) : (
            <>
              {/* 15-minute Timer */}
              <div className="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center justify-center gap-2 shadow-sm">
                <span className="text-orange-600 text-xs font-sans font-bold flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  <CartTimer />
                </span>
              </div>
              
              <ul className="space-y-4">
                {cart.lines.map((line: any, idx: number) => (
                  <motion.li 
                    key={line.id} 
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24, delay: idx * 0.1 }}
                    className="flex gap-4 py-4 border-b" 
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md" style={{ background: "var(--cream)" }}>
                      {line.imageUrl ? (
                        <Image src={line.imageUrl} alt={line.title} width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ background: "var(--cream)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium leading-tight mb-2 truncate whitespace-nowrap overflow-hidden text-ellipsis block" style={{ color: "var(--charcoal)" }} title={line.title}>{line.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md" style={{ borderColor: "var(--border-dark)" }}>
                          <button
                            onClick={() => line.quantity > 1 ? updateItem(line.id, line.quantity - 1) : removeItem(line.id)}
                            disabled={isLoading}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center hover:bg-ivory-200 transition-colors disabled:opacity-40 rounded-l-md"
                          >
                            {line.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                          </button>
                          <span className="w-8 text-center text-xs font-sans font-medium">{line.quantity}</span>
                          <button
                            onClick={() => updateItem(line.id, line.quantity + 1)}
                            disabled={isLoading}
                            aria-label="Increase quantity"
                            className="w-7 h-7 flex items-center justify-center hover:bg-ivory-200 transition-colors disabled:opacity-40 rounded-r-md"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-sans font-semibold" style={{ color: "var(--charcoal)" }}>
                          {formatPrice(line.price * line.quantity, currency)}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Coupon + Totals + CTA */}
        {cart && cart.lines.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4 bg-white" style={{ borderColor: "var(--border)" }}>
            {/* Coupon Input */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={discountAmount > 0}
                  placeholder="Gift card or discount code"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-lg text-sm font-sans outline-none transition-all uppercase placeholder:normal-case disabled:opacity-70"
                />
                {discountAmount > 0 ? (
                  <button
                    onClick={removeCoupon}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-sans font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isValidating || !couponCode.trim()}
                    className="px-4 py-2 bg-[#141312] text-white text-sm font-sans font-medium rounded-lg hover:bg-black transition-opacity disabled:opacity-50"
                  >
                    {isValidating ? "..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && <p className="mt-1.5 text-xs text-red-600 font-sans">{couponError}</p>}
              {couponSuccess && <p className="mt-1.5 text-xs text-green-700 font-sans">{couponSuccess}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-sm font-sans">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ color: "var(--charcoal)" }}>{formatPrice(subtotal, currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm font-sans text-green-700">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discountAmount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-sans">
                <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                <span style={{ color: "var(--charcoal)" }}>
                  {formatPrice(40, currency)}
                </span>
              </div>
              <div className="flex justify-between font-sans font-semibold pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--charcoal)" }}>Total</span>
                <span style={{ color: "var(--charcoal)" }}>{formatPrice(total + 40, currency)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <Link
                href={discountAmount > 0 && couponCode ? `/checkout?coupon=${encodeURIComponent(couponCode)}` : "/checkout"}
                onClick={onClose}
                className="btn-primary w-full justify-center text-center py-3 text-[15px]"
              >
                Checkout <ChevronRight size={16} />
              </Link>
            </div>

            <p className="text-center text-xs font-sans" style={{ color: "var(--text-muted)" }}>
              Taxes and final shipping calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
