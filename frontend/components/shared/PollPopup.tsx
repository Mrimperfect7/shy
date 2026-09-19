"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface PollData {
  id: string;
  question: string;
  options: { id: string; text: string }[];
}

export default function PollPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [voted, setVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already interacted with poll this session
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("shyn_poll_dismissed");
      if (dismissed === "true") return;
    }

    // Fetch the active poll
    fetch("/api/polls/active", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data?.poll) {
          setPoll(data.poll);
          
          // Sequencing Logic: Check if Offer Ad was dismissed.
          // OfferAdPopup sets sessionStorage when closed, OR if not active it doesn't set it but it won't render.
          // To be safe, wait a little bit to see if OfferAdPopup renders.
          const offerAdDismissed = sessionStorage.getItem("shyn_offer_ad_dismissed");
          
          // Check if OfferAd is currently active
          fetch("/api/offer-settings", { cache: "no-store" }).then(res => res.json()).then(offerData => {
             const hasActiveOffer = offerData?.offer?.isActive;
             if (hasActiveOffer && offerAdDismissed !== "true") {
               // Wait for offer ad to be closed
               const handleOfferClosed = () => {
                 setTimeout(() => setIsOpen(true), 800); // 800ms delay after closing offer
                 window.removeEventListener("shyn_offer_ad_closed", handleOfferClosed);
               };
               window.addEventListener("shyn_offer_ad_closed", handleOfferClosed);
             } else {
               // Show poll immediately if no offer ad
               setTimeout(() => setIsOpen(true), 2500); 
             }
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("shyn_poll_dismissed", "true");
    }
  };

  const handleVote = async (optionId: string) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId })
      });
      setVoted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !poll) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]" 
        onClick={handleClose}
      />
      
      {/* Popup Container */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
      >
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-6 text-center">
          {!voted ? (
            <>
              <p className="text-xs font-bold text-forest tracking-wider uppercase mb-3">Quick Question</p>
              <h3 className="font-serif text-xl text-charcoal mb-5">{poll.question}</h3>
              
              <div className="space-y-2.5">
                {poll.options.map(opt => (
                  <button
                    key={opt.id}
                    disabled={isSubmitting}
                    onClick={() => handleVote(opt.id)}
                    className="w-full py-3 px-4 bg-gray-50 hover:bg-[#0A2612] hover:text-white border border-gray-100 rounded-xl text-sm font-sans font-medium text-gray-800 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 animate-in fade-in zoom-in-95 duration-500">
              <CheckCircle2 size={48} className="mx-auto text-forest mb-3" />
              <h3 className="font-serif text-xl text-charcoal mb-2">Thank You!</h3>
              <p className="text-sm text-gray-500 font-sans">Your response has been recorded.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
