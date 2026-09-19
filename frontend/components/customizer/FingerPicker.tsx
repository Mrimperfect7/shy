"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTryOnStore } from "./tryOnStore";
import { FINGERS } from "./tryOnTypes";

export default function FingerPicker() {
  const pendingRing = useTryOnStore((s) => s.pendingRing);
  const resolveFinger = useTryOnStore((s) => s.resolveFinger);
  const cancelFinger = useTryOnStore((s) => s.cancelFinger);

  return (
    <AnimatePresence>
      {pendingRing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          data-testid="finger-picker-modal"
          onClick={cancelFinger}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="bg-[#121215] border border-[#D4AF37]/25 rounded-2xl p-7 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-amber-400/80">Choose finger</p>
              <button
                onClick={cancelFinger}
                data-testid="finger-picker-close"
                aria-label="Close finger picker"
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <h3 className="font-serif text-xl text-zinc-100 mb-1">{pendingRing.title}</h3>
            <p className="text-xs text-zinc-500 mb-5 font-sans">Which finger should it grace?</p>
            <div className="grid grid-cols-5 gap-2">
              {FINGERS.map((f) => (
                <button
                  key={f.id}
                  data-testid={`finger-select-${f.id}`}
                  onClick={() => resolveFinger(f.id)}
                  className="flex flex-col items-center gap-2 py-3 rounded-xl border border-[#D4AF37]/15 bg-[#18181C] hover:border-[#D4AF37]/60 hover:bg-[#222228] transition-all group"
                >
                  <span className="w-2 h-8 rounded-full bg-gradient-to-b from-[#E9E2D4] to-[#c9c0ac] group-hover:from-[#F3E5AB] group-hover:to-[#D4AF37] transition-colors" />
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 group-hover:text-amber-300 font-sans">{f.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
