"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Star, ShoppingBag, Zap, Minus, Plus, Truck, Shield, Sparkles, MessageCircle, Heart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  product: any;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Indian PIN code validation
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ status: "success" | "error" | null; message: string }>({
    status: null,
    message: "",
  });

  const price = typeof product.price === "number" ? product.price : parseFloat(product.price || "0");
  const compareAt = product.compareAtPrice
    ? typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : parseFloat(product.compareAtPrice)
    : null;
  const isSale = Boolean(compareAt && compareAt > price);
  const discountPercent = isSale && compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const handleAdd = () => {
    setAdding(true);
    addItem({
      id: product.id || product.handle,
      title: product.title,
      price: price,
      image: product.images?.[0]?.url || "/assets/products/necklace-pendant.jpg",
      imageUrl: product.images?.[0]?.url || "/assets/products/necklace-pendant.jpg",
      quantity: quantity,
      variantTitle: product.material || "18K PVD Gold",
    });
    toast.success(`Added ${product.title} to bag! ✨`, {
      style: {
        background: "#141312",
        color: "#FAF8F5",
        border: "1px solid #C5A059",
      },
    });
    setAdding(false);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/checkout");
  };

  const handleCheckPincode = () => {
    if (!pincode.trim()) {
      setPincodeResult({ status: "error", message: "Please enter a 6-digit Indian PIN code" });
      return;
    }
    const isValid = /^[1-9][0-9]{5}$/.test(pincode.trim());
    if (isValid) {
      setPincodeResult({ status: "success", message: "Delivery available across India. Dispatches in 24-48 hours." });
    } else {
      setPincodeResult({ status: "error", message: "Please enter a valid 6-digit Indian postal PIN code." });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi SHYN.ISH! I am interested in ordering the ${product.title} (₹${price}). Can you please assist me?`
  );

  return (
    <div className="flex flex-col pt-2 space-y-6">
      {/* Brand & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-serif text-xl tracking-[0.2em] font-medium text-[#141312]">
            SHYN<span className="text-[#C5A059]">.</span>ISH
          </span>
          <span className="badge-gold text-[10px]">
            18K PVD Gold Plated
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141312] leading-tight">
          {product.title}
        </h1>

        {/* Reviews Summary */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} fill="#C5A059" stroke="#C5A059" />
            ))}
          </div>
          <span className="text-xs font-sans text-[#5E564F]">(4.9 · 28 reviews)</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-4 rounded-2xl bg-white/70 border border-[#C5A059]/20 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-semibold text-[#141312]">
            ₹{price}
          </span>
          {compareAt && (
            <span className="text-base text-[#928980] line-through font-sans">
              ₹{compareAt}
            </span>
          )}
          {isSale && (
            <span className="text-xs font-sans font-semibold text-[#C5A059] bg-[#C5A059]/15 px-2 py-0.5 rounded-full">
              Save {discountPercent}%
            </span>
          )}
        </div>
        <span className="text-xs text-[#5E564F] font-sans font-medium">
          Inclusive of all taxes
        </span>
      </div>

      {/* Specifications pills */}
      <div className="flex flex-wrap gap-2 text-xs font-sans">
        <span className="px-3 py-1 rounded-full bg-white border border-[#C5A059]/25 text-[#141312]">
          ✨ 18K PVD Gold Plated
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-[#C5A059]/25 text-[#141312]">
          🛡️ 316L Stainless Steel
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-[#C5A059]/25 text-[#141312]">
          💧 Water & Sweat Resistant
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-[#C5A059]/25 text-[#141312]">
          🌿 100% Hypoallergenic
        </span>
      </div>

      {/* Quantity & CTAs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest font-sans font-medium text-[#5E564F]">
            Quantity
          </span>
          <div className="flex items-center border border-[#C5A059]/30 rounded-full bg-white px-3 py-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[#5E564F] hover:text-[#141312]"
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="px-4 text-xs font-semibold font-sans">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-[#5E564F] hover:text-[#141312]"
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleAdd}
            disabled={adding}
            className="btn-outline w-full justify-center py-3.5 flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>Add to Bag</span>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={adding}
            className="btn-gold w-full justify-center py-3.5 flex items-center gap-2 font-semibold"
          >
            <Zap size={16} />
            <span>Buy Now</span>
          </button>
        </div>

        {/* WhatsApp Consultation */}
        <Link
          href={`https://wa.me/919876543210?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener"
          className="w-full py-3 px-4 rounded-full border border-emerald-600/30 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 text-xs uppercase tracking-wider font-semibold font-sans flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle size={16} className="text-emerald-600" />
          <span>Ask on WhatsApp · Fast Response</span>
        </Link>
      </div>

      {/* PIN Code Verification */}
      <div className="p-4 rounded-2xl bg-white/60 border border-[#C5A059]/20 space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-semibold text-[#141312]">
          <Truck size={16} className="text-[#C5A059]" />
          <span>Check Delivery to Your PIN Code</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter 6-digit PIN code"
            className="flex-1 px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 bg-white outline-none focus:border-[#C5A059]"
          />
          <button
            onClick={handleCheckPincode}
            className="px-4 py-2 bg-[#141312] text-[#FAF8F5] text-xs font-sans font-semibold rounded-xl hover:bg-black transition-colors"
          >
            Check
          </button>
        </div>
        {pincodeResult.status && (
          <p
            className={`text-xs font-sans ${
              pincodeResult.status === "success" ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {pincodeResult.message}
          </p>
        )}
        <div className="text-[11px] text-[#5E564F] font-sans flex items-center gap-2 pt-1">
          <span>🚚 All India Delivery</span>
          <span>•</span>
          <span>💳 Online Prepaid Orders (COD Unavailable)</span>
        </div>
      </div>
    </div>
  );
}
