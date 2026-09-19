"use client";

import { useState, useEffect } from "react";
import { X, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";

export default function CustomWatchPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen and closed the popup today
    const lastClosed = localStorage.getItem("shynish_watch_popup_closed");
    
    // If they closed it recently (e.g. within last 24h), don't show it
    if (lastClosed) {
      const closedAt = parseInt(lastClosed, 10);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      if (now - closedAt < oneDay) {
        return;
      }
    }

    // Show popup after 6 seconds of browsing
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("shynish_watch_popup_closed", Date.now().toString());
  };

  const handleEnquire = () => {
    const text = encodeURIComponent("Hi SHYN.ISH! I'm interested in knowing more about your customized watches.");
    window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
    handleClose(); // Close popup after clicking
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-[#FAF8F5] overflow-hidden rounded-sm shadow-2xl animate-in zoom-in-95 duration-500"
        style={{ border: "1px solid rgba(197, 160, 89, 0.3)" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Image Header */}
        <div className="relative h-48 w-full bg-[#181614]">
          <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black/80 to-transparent z-[5]" />
          {/* We'll use a placeholder or gradient if no watch image is immediately available */}
          <div 
            className="w-full h-full object-cover" 
            style={{ 
              background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Clock size={48} className="text-[#C5A059] opacity-70" strokeWidth={1.5} />
          </div>
          
          <div className="absolute bottom-4 left-5 z-10">
            <span className="inline-block px-2.5 py-1 mb-2 text-[10px] font-sans font-bold tracking-widest text-[#2D1A00] bg-[#FFD700] uppercase rounded-sm">
              New Arrival
            </span>
            <h3 className="font-serif text-2xl text-white leading-tight">
              Customized Watches
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-sans text-sm text-[#5C5751] mb-5 leading-relaxed">
            Elevate your everyday style with our premium customized watches. Tailored just for you with precise craftsmanship and timeless elegance.
          </p>

          <button
            onClick={handleEnquire}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-sans text-sm font-semibold tracking-wide rounded-sm transition-all shadow-md hover:shadow-lg group"
          >
            <WhatsAppIcon size={18} fill="#ffffff" />
            <span>Enquire on WhatsApp</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform ml-1" />
          </button>
          
          <button 
            onClick={handleClose}
            className="w-full mt-3 py-2 text-[11px] font-sans text-[#8C857B] hover:text-[#181614] uppercase tracking-wider transition-colors"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
