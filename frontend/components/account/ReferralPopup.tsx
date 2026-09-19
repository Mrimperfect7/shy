"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { markReferralPopupSeen } from "@/app/actions/customer";

export default function ReferralPopup({ shouldShow }: { shouldShow?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if passed via prop or read directly from lightweight client cookie
    const hasCookie = typeof document !== "undefined" && document.cookie
      .split(";")
      .map(c => c.trim())
      .some(c => c.startsWith("eshara_show_referral_popup=true") || c.startsWith("eshara_show_referral_popup="));

    if (shouldShow || hasCookie) {
      // Small delay for better UX after login/navigation
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const handleClose = async () => {
    setIsOpen(false);
    if (typeof document !== "undefined") {
      document.cookie = "eshara_show_referral_popup=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    await markReferralPopupSeen();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-[#FAF7F2] w-full sm:w-[500px] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-500 ease-out"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative h-40 bg-[#2D4A28] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
             <img src="/assets/amla.PNG" alt="" className="absolute -top-10 -left-10 w-40 h-40 object-contain drop-shadow-xl" />
             <img src="/assets/aloe.PNG" alt="" className="absolute -bottom-10 -right-10 w-40 h-40 object-contain drop-shadow-xl" />
          </div>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors bg-black/10 rounded-full"
          >
            <X size={20} />
          </button>
          <div className="relative z-10 text-center">
            <p className="text-green-100 text-sm tracking-[0.2em] font-sans font-medium uppercase mb-2">Welcome to Eshara</p>
            <h2 className="text-white font-serif text-3xl px-4">Share the Ritual.</h2>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h3 className="font-serif text-2xl text-center mb-4" style={{ color: "var(--charcoal)" }}>
            Unlock up to 20% OFF
          </h3>
          <p className="text-center text-gray-600 font-sans text-sm mb-8">
            Share your ESHARA experience with friends and unlock exclusive rewards as your referral journey grows.
          </p>

          <div className="space-y-6 mb-10">
            <div className="flex gap-4">
              <span className="font-serif text-[#2D4A28] text-xl opacity-50">01</span>
              <div>
                <h4 className="font-medium text-sm tracking-wide uppercase font-sans" style={{ color: "var(--charcoal)" }}>Share</h4>
                <p className="text-sm text-gray-500">Get your personal ESHARA referral link.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-serif text-[#2D4A28] text-xl opacity-50">02</span>
              <div>
                <h4 className="font-medium text-sm tracking-wide uppercase font-sans" style={{ color: "var(--charcoal)" }}>Refer</h4>
                <p className="text-sm text-gray-500">Invite friends to discover our natural ayurvedic herbs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-serif text-[#2D4A28] text-xl opacity-50">03</span>
              <div>
                <h4 className="font-medium text-sm tracking-wide uppercase font-sans" style={{ color: "var(--charcoal)" }}>Reward</h4>
                <p className="text-sm text-gray-500">Reach milestones and unlock up to 20% off.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/account/refer-and-earn" 
              onClick={handleClose}
              className="bg-[#2D4A28] text-white py-4 rounded-md font-sans text-sm tracking-widest uppercase font-medium hover:bg-[#1A2E16] transition-colors text-center w-full"
            >
              Start Referring →
            </Link>
            <button 
              onClick={handleClose}
              className="py-3 text-gray-500 font-sans text-sm hover:text-black transition-colors"
            >
              MAYBE LATER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
