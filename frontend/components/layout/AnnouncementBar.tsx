"use client";

const DEFAULT_TEXT = "18K PVD GOLD PLATED · 316/304 STAINLESS STEEL · JEWELLERY UNDER ₹480 · BEST PRICE. HONEST QUALITY · ALL INDIA DELIVERY · COD UNAVAILABLE · SHYN.ISH ";

export default function AnnouncementBar() {
  const items = new Array(10).fill(DEFAULT_TEXT);

  return (
    <div 
      className="announcement-bar overflow-hidden flex items-center whitespace-nowrap bg-[#141312] text-[#FAF8F5] border-b border-[#C5A059]/20" 
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 }}
    >
      <div className="flex animate-marquee min-w-max py-2">
        {items.map((text, i) => (
          <span key={i} className="mx-6 font-sans text-[11px] tracking-[0.2em] uppercase font-medium flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-[#C5A059]" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
