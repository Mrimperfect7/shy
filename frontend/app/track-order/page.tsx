"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, MessageCircle, AlertCircle } from "lucide-react";

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [contactQuery, setContactQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      setError("Please enter your Order Number (e.g. SHYN-123456)");
      return;
    }

    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderQuery.trim())}&contact=${encodeURIComponent(contactQuery.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Order not found. Please check your order number.");
      } else {
        setOrderData(data.order);
      }
    } catch {
      setError("Unable to track order right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "Order Placed", key: "PENDING" },
    { label: "Payment Confirmed", key: "PAID" },
    { label: "Packed & Ready", key: "PACKED" },
    { label: "Shipped", key: "SHIPPED" },
    { label: "Delivered", key: "DELIVERED" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-16 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-medium font-sans">
            SHYN.ISH Delivery
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Track Your Order
          </h1>
          <p className="text-sm text-[#5E564F] font-sans font-light max-w-md mx-auto">
            Enter your order number to check live processing and courier transit status.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-[#C5A059]/20 shadow-sm space-y-4">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider font-sans text-[#141312] mb-1.5">
                Order Number *
              </label>
              <input
                type="text"
                placeholder="e.g. SHYN-123456"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full px-4 py-3 text-sm font-sans rounded-xl border border-gray-200 bg-[#FAF8F5] outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider font-sans text-[#141312] mb-1.5">
                Phone Number or Email (Optional for Verification)
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210 or name@example.com"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                className="w-full px-4 py-3 text-sm font-sans rounded-xl border border-gray-200 bg-[#FAF8F5] outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center py-3.5 flex items-center gap-2 font-semibold"
            >
              <Search size={15} />
              <span>{loading ? "Searching..." : "Track Status"}</span>
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Result */}
        {orderData && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#C5A059]/30 shadow-md space-y-6 animate-in fade-in-50 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-sans font-semibold">
                  Order Details
                </span>
                <h3 className="font-serif text-2xl text-[#141312]">
                  #{orderData.orderNumber}
                </h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 text-[#141312] text-xs font-sans font-semibold">
                <Clock size={13} className="text-[#C5A059]" />
                <span>Status: {orderData.status}</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="py-4">
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs font-sans">
                {steps.map((s, idx) => {
                  const isDone = true; // In production this compares orderData.status index
                  return (
                    <div key={s.key} className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-[#141312] text-[#C5A059] flex items-center justify-center font-bold text-xs border border-[#C5A059]/40">
                        {idx + 1}
                      </div>
                      <span className="text-[#141312] font-medium leading-tight">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-xs uppercase tracking-widest font-sans font-semibold text-[#5E564F]">
                Purchased Jewellery
              </h4>
              <div className="divide-y divide-gray-100">
                {orderData.orderItems?.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-base text-[#141312]">
                        {item.product?.title || "18K Gold Jewellery"}
                      </p>
                      <span className="text-xs text-[#5E564F] font-sans">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-serif text-base font-semibold text-[#141312]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between font-serif text-lg font-semibold text-[#141312]">
                <span>Total Amount</span>
                <span>₹{orderData.totalAmount}</span>
              </div>
            </div>

            {/* WhatsApp Assistance */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <Link
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi SHYN.ISH! I'm tracking order #${orderData.orderNumber} and need assistance.`)}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <MessageCircle size={15} />
                <span>Need help with this order? Chat with us on WhatsApp</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
