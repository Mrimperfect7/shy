"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Loader2,
  Check,
  Lock,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CreditCard,
  Package,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import { validateCouponAction } from "@/app/actions/checkout";
import { createRazorpayOrderAction, verifyRazorpayPaymentAction } from "@/app/actions/razorpay";
import { trackInitiateCheckout, trackAddPaymentInfo } from "@/lib/tracking";

declare global {
  interface Window { Razorpay: any; }
}

type Step = "delivery" | "payment";

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "delivery", label: "Delivery", num: 1 },
  { id: "payment", label: "Payment", num: 2 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("delivery");

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [initialCouponChecked, setInitialCouponChecked] = useState(false);

  // Delivery fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddress, setSavedAddress] = useState<{
    name: string; phone: string; email?: string;
    address: string; city: string; state: string; pinCode: string;
  } | null>(null);

  // Summary sidebar toggle on mobile
  const [summaryOpen, setSummaryOpen] = useState(true);

  const SHIPPING_FEE = 40;
  const subtotal = getCartTotal();
  const finalTotal = Math.max(0, subtotal - discountAmount) + SHIPPING_FEE;

  // Load Razorpay script
  useEffect(() => {
    if (!document.getElementById("razorpay-js")) {
      const s = document.createElement("script");
      s.id = "razorpay-js";
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // Load saved address
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shyn_saved_delivery_address");
      if (saved) {
        const p = JSON.parse(saved);
        if (p?.name && p?.phone && p?.address) setSavedAddress(p);
      }
    } catch {}
  }, []);

  // Redirect if empty cart
  useEffect(() => {
    if (items.length === 0 && !loading) router.push("/shop");
  }, [items, router, loading]);

  // Track InitiateCheckout
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(items.map(i => i.id), finalTotal, items.reduce((acc, i) => acc + i.quantity, 0), "INR");
    }
  }, [items.length]); // fire once when items are loaded

  // Read coupon from URL
  useEffect(() => {
    if (typeof window !== "undefined" && !initialCouponChecked) {
      const params = new URLSearchParams(window.location.search);
      const coupon = params.get("coupon");
      if (coupon && !couponCode) {
        setCouponInput(coupon);
        setInitialCouponChecked(true);
      }
    }
  }, [initialCouponChecked, couponCode]);

  if (items.length === 0) return null;

  const getStepState = (stepId: Step) => {
    const order: Step[] = ["delivery", "payment"];
    const curr = order.indexOf(currentStep);
    const idx = order.indexOf(stepId);
    if (idx < curr) return "done";
    if (idx === curr) return "active";
    return "upcoming";
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError("");
    const res = await validateCouponAction(code, subtotal);
    if (res.success) {
      setCouponCode(code.toUpperCase());
      if (res.discountType === "PERCENTAGE") {
        let d = (subtotal * res.discountValue!) / 100;
        if (res.maximumDiscount && d > res.maximumDiscount) d = res.maximumDiscount;
        setDiscountAmount(d);
      } else {
        setDiscountAmount(res.discountValue!);
      }
    } else {
      setCouponError(res.error || "Invalid coupon");
      setCouponCode("");
      setDiscountAmount(0);
    }
    setApplyingCoupon(false);
  };

  // Auto apply coupon if present in URL
  useEffect(() => {
    if (initialCouponChecked && couponInput && !couponCode && !couponError && !applyingCoupon) {
      handleApplyCoupon(couponInput);
    }
  }, [initialCouponChecked, couponInput, couponCode, couponError, applyingCoupon]);

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setDiscountAmount(0);
    setCouponError("");
  };

  const handleContinueToPayment = () => {
    const missing = !name.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pinCode.trim();
    if (missing) {
      setError("Please fill in all required delivery fields.");
      return;
    }
    setError("");
    if (saveAddress && typeof window !== "undefined") {
      try {
        const fields = { name, phone, email, address, city, state, pinCode };
        localStorage.setItem("shyn_saved_delivery_address", JSON.stringify(fields));
        setSavedAddress(fields);
      } catch {}
    }
    
    // Track AddPaymentInfo when proceeding to payment step
    trackAddPaymentInfo(items.map(i => i.id), finalTotal, "INR");
    
    setCurrentStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplySavedAddress = () => {
    if (!savedAddress) return;
    setName(savedAddress.name || "");
    setPhone(savedAddress.phone || "");
    setEmail(savedAddress.email || "");
    setAddress(savedAddress.address || "");
    setCity(savedAddress.city || "");
    setState(savedAddress.state || "");
    setPinCode(savedAddress.pinCode || "");
  };

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await createRazorpayOrderAction({
        name, email, phone, address, city, state, pinCode,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity, title: i.title, price: i.price })),
        couponCode: couponCode || null,
      });

      if (!res.success || !res.orderNumber) {
        setError(res.error || "Could not initialize payment.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const opts = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency,
          name: "SHYN.ISH",
          description: `Jewellery Order #${res.orderNumber}`,
          image: "/assets/products/necklace-pendant.jpg",
          order_id: res.razorpayOrderId?.startsWith("order_") ? res.razorpayOrderId : undefined,
          prefill: { name, email: email || "care@shynish.com", contact: phone },
          notes: { orderNumber: res.orderNumber },
          theme: { color: "#141312" },
          modal: { ondismiss: () => setLoading(false) },
          handler: async (response: any) => {
            setLoading(true);
            try {
              const vr = await verifyRazorpayPaymentAction({
                orderNumber: res.orderNumber!,
                razorpayOrderId: response.razorpay_order_id || res.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              if (vr.success) {
                clearCart();
                router.push(`/checkout/success?orderNumber=${res.orderNumber}&amount=${finalTotal}&method=RAZORPAY&status=PAID`);
              } else {
                setError(vr.error || "Payment verification failed.");
                setLoading(false);
              }
            } catch { setError("An error occurred confirming payment."); setLoading(false); }
          },
        };
        const rp = new window.Razorpay(opts);
        rp.on("payment.failed", (r: any) => {
          setError(r.error?.description || "Payment failed.");
          setLoading(false);
        });
        rp.open();
      } else {
        setError("Payment gateway loading. Please try again.");
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error.");
      setLoading(false);
    }
  };

  // ─── Stepper ─────────────────────────────────────────────────────────────
  const Stepper = () => (
    <div className="flex items-center justify-center gap-0 mb-8 select-none">
      {STEPS.map((step, i) => {
        const state = getStepState(step.id);
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all font-sans font-bold text-sm ${
                state === "done"
                  ? "bg-[#141312] border-[#C5A059] text-[#C5A059]"
                  : state === "active"
                  ? "bg-white border-[#141312] text-[#141312]"
                  : "bg-white border-gray-300 text-gray-400"
              }`}>
                {state === "done" ? <Check size={15} strokeWidth={2.5} /> : step.num}
              </div>
              <span className={`text-[11px] font-sans font-semibold uppercase tracking-wider ${
                state === "active" ? "text-[#141312]" : state === "done" ? "text-[#C5A059]" : "text-gray-400"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-[2px] w-16 sm:w-24 mx-1 mb-5 transition-all ${
                getStepState(STEPS[i + 1].id) === "upcoming" ? "bg-gray-200" : "bg-[#C5A059]"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const CouponSection = () => (
    <div className="px-4 py-3">
      {couponCode ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <div>
              <p className="font-sans font-bold text-[#0A2612] text-sm tracking-widest">{couponCode}</p>
              <p className="font-sans text-xs text-green-700">Saved ₹{discountAmount}</p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-xs font-sans font-semibold text-gray-500 hover:text-gray-800 underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-1.5 bg-white border border-gray-200 focus:border-[#0A2612] rounded-lg text-sm font-sans tracking-wider outline-none transition-all uppercase placeholder:normal-case placeholder:text-gray-400"
            />
            <button
              onClick={() => handleApplyCoupon()}
              disabled={applyingCoupon || !couponInput.trim()}
              className="px-3 py-1.5 bg-[#0A2612] hover:bg-[#133E20] disabled:opacity-50 text-white font-sans font-semibold text-xs rounded-lg transition-all"
            >
              {applyingCoupon ? "..." : "Apply"}
            </button>
          </div>
          {couponError && (
            <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600 font-sans">
              <AlertCircle size={12} /> {couponError}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // ─── Order Summary Sidebar ────────────────────────────────────────────────
  const OrderSummary = ({ compact = false }: { compact?: boolean }) => (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden ${compact ? "" : "sticky top-6"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer lg:cursor-default border-b border-gray-100"
        onClick={() => setSummaryOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-sm text-[#1A1A1A]">
            Bag{" "}
            <span className="text-gray-500 font-normal">{items.length} {items.length === 1 ? "item" : "items"}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans font-bold text-sm text-[#0A2612]">₹{finalTotal}</span>
          <div className="lg:hidden">
            {summaryOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
          </div>
        </div>
      </div>

      <div className={`${compact ? (summaryOpen ? "block" : "hidden") : "block"} lg:block`}>
        {/* Items */}
        <div className="px-4 py-2 divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="py-2 flex items-center gap-3 first:pt-0">
              <div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                )}
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A2612] text-white text-[10px] font-bold flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-xs text-[#1A1A1A] truncate">{item.title}</p>
                <p className="font-sans text-[11px] text-gray-400 mt-0.5">
                  {item.quantity} × ₹{item.price}
                </p>
              </div>
              <span className="font-sans font-semibold text-sm text-[#1A1A1A] shrink-0">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Coupon Card */}
        <div className="border-t border-gray-100">
          {CouponSection()}
        </div>

        {/* Price Breakdown */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-sm font-sans">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium text-[#1A1A1A]">₹{subtotal}</span>
          </div>
          {discountAmount > 0 && couponCode && (
            <div className="flex justify-between text-green-600 font-medium">
              <span>Discount ({couponCode})</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="font-medium text-[#1A1A1A]">₹{SHIPPING_FEE}</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-bold text-[#1A1A1A] text-base">Grand total</span>
              <span className="text-[10px] text-gray-500 font-normal mt-0.5">(Includes all taxes and services)</span>
            </div>
            <span className="font-bold text-[#0A2612] text-xl">₹{finalTotal}</span>
          </div>
        </div>

        {/* Secure checkout badge */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-center gap-1.5 text-xs font-sans text-green-700">
            <ShieldCheck size={14} className="text-green-600" />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step: Delivery ───────────────────────────────────────────────────────
  const StepDelivery = () => (
    <div className="space-y-3">
      {/* Shipping Method */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h2 className="font-sans font-bold text-sm text-[#1A1A1A] mb-3">Shipping Method</h2>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 border-2 border-[#0A2612] bg-green-50/40 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[#0A2612] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#0A2612]" />
              </div>
              <div>
                <p className="font-sans font-semibold text-sm text-[#1A1A1A]">Standard Delivery</p>
                <p className="font-sans text-xs text-gray-500">3–5 business days</p>
              </div>
            </div>
            <span className="font-sans font-bold text-sm text-[#1A1A1A]">₹{SHIPPING_FEE}</span>
          </label>
        </div>
        <p className="text-[11px] font-sans text-gray-400 text-center mt-3">
          Estimated delivery: <span className="text-[#0A2612] font-semibold">3–5 business days</span>
        </p>
      </div>

      {/* Saved address pill */}
      {savedAddress && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-green-600 shrink-0" />
            <div>
              <p className="font-sans font-semibold text-sm text-[#1A1A1A]">{savedAddress.name}</p>
              <p className="font-sans text-xs text-gray-500 truncate max-w-xs">
                {savedAddress.address}, {savedAddress.city} - {savedAddress.pinCode}
              </p>
            </div>
          </div>
          <button
            onClick={handleApplySavedAddress}
            className="text-xs font-sans font-bold text-green-700 border border-green-300 bg-white px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap"
          >
            Use this
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sans">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <h2 className="font-sans font-bold text-sm text-[#1A1A1A]">Delivery Address</h2>

        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="e.g. Anjali Sharma" autoComplete="name"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
              placeholder="9876543210" autoComplete="tel"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
              Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
            Street Address <span className="text-red-500">*</span>
          </label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2}
            placeholder="House/Flat No., Building Name, Street, Landmark" autoComplete="street-address"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required
              placeholder="e.g. Kochi" autoComplete="address-level2"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required
              placeholder="e.g. Kerala" autoComplete="address-level1"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 mb-1">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required
            placeholder="e.g. 682001" autoComplete="postal-code"
            className="w-full sm:w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#0A2612] focus:bg-white rounded-xl text-sm outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input type="checkbox" id="save-addr" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)}
            className="w-4 h-4 text-[#0A2612] border-gray-300 rounded" />
          <label htmlFor="save-addr" className="text-xs font-sans text-gray-600 cursor-pointer select-none">
            Save for faster checkout next time
          </label>
        </div>
      </div>

      <button
        onClick={handleContinueToPayment}
        className="w-full py-3 bg-[#0A2612] hover:bg-[#133E20] text-white font-sans font-bold text-sm rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={16} />
      </button>
      <Link href="/cart" className="block text-center text-sm font-sans text-gray-500 hover:text-[#0A2612] transition-colors">
        ← Back to Cart
      </Link>
    </div>
  );

  // ─── Step: Payment ────────────────────────────────────────────────────────
  const StepPayment = () => (
    <div className="space-y-4">
      {/* Delivery summary pill */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[#0A2612] shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-semibold text-sm text-[#1A1A1A]">{name} · {phone}</p>
              <p className="font-sans text-xs text-gray-500">{address}, {city}, {state} - {pinCode}</p>
            </div>
          </div>
          <button onClick={() => setCurrentStep("delivery")} className="text-xs font-sans font-bold text-[#0A2612] border border-[#0A2612]/20 px-3 py-1 rounded-lg hover:bg-[#0A2612]/5">
            Edit
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-sans">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-4 bg-[#0A2612] hover:bg-[#133E20] disabled:opacity-75 text-white font-sans font-bold text-sm rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg mt-4"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Opening Secure Payment…</>
        ) : (
          <><Lock size={15} /> Proceed via UPI (₹{finalTotal}) <ArrowRight size={16} /></>
        )}
      </button>
      <p className="text-center text-[11px] font-sans text-gray-400 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} className="text-green-500" /> Powered by Razorpay · 256-bit SSL Encrypted
      </p>
      <button onClick={() => setCurrentStep("delivery")} className="block w-full text-center text-sm font-sans text-gray-500 hover:text-[#0A2612] transition-colors">
        ← Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.2em] font-medium text-[#141312]">
              SHYN<span className="text-[#C5A059]">.</span>ISH
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-sans text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <Lock size={11} className="text-green-600" /> Secure Checkout
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Stepper */}
        {Stepper()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left — Steps (7 cols) */}
          <div className="lg:col-span-7">
            {/* Mobile summary toggle */}
            <div className="lg:hidden mb-4 space-y-4">
              {OrderSummary({ compact: true })}
            </div>

            {currentStep === "delivery" && StepDelivery()}
            {currentStep === "payment" && StepPayment()}
          </div>

          {/* Right — Order Summary (5 cols) */}
          <div className="hidden lg:block lg:col-span-5">
            {OrderSummary({ compact: false })}
          </div>
        </div>
      </main>
    </div>
  );
}
