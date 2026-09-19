"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const InstagramIcon = ({ size = 24, strokeWidth = 2, className = "", style = {} }: { size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Reel {
  id: string;
  instagramUrl: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  isFeatured?: boolean;
}

export default function InstagramReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [settings, setSettings] = useState({
    sectionHeading: "THE ESHARA RITUAL",
    sectionSubtitle: "Real rituals. Real stories. From our community.",
    instagramUrl: "https://www.instagram.com/eshara_natural/",
    instagramHandle: "@eshara_natural",
    reelsSectionEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reels", { next: { revalidate: 60 } })
      .then(r => r.json())
      .then(d => {
        setReels(d.reels || []);
        if (d.settings) setSettings(d.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    const amount = sliderRef.current.clientWidth * 0.8;
    sliderRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (!settings.reelsSectionEnabled) return null;

  return (
    <section aria-labelledby="reels-title" className="py-8 lg:py-16" style={{ background: "var(--charcoal)" }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="section-eyebrow mb-4" style={{ color: "rgba(250,247,242,0.5)" }}>
              Community
            </p>
            <h2 id="reels-title" className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "var(--ivory)" }}>
              {settings.sectionHeading}
            </h2>
            <p className="font-sans text-sm mt-2" style={{ color: "rgba(250,247,242,0.6)" }}>
              {settings.sectionSubtitle}
            </p>
          </div>
          <Link
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs tracking-widest uppercase font-sans font-medium transition-opacity hover:opacity-70 flex-shrink-0"
            style={{ color: "var(--ivory)" }}
          >
            <InstagramIcon size={14} />
            View All on Instagram
          </Link>
        </div>

        {/* Reels Carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="flex-shrink-0 w-64 h-96 skeleton opacity-20" />
            ))}
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-16" style={{ color: "rgba(250,247,242,0.4)" }}>
            <InstagramIcon size={40} strokeWidth={1} className="mx-auto mb-4" />
            <p className="font-serif text-xl" style={{ color: "rgba(250,247,242,0.6)" }}>Reels coming soon</p>
            <p className="text-sm font-sans mt-2">Follow us on Instagram {settings.instagramHandle}</p>
          </div>
        ) : (
          <div className="relative group">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={18} style={{ color: "var(--ivory)" }} />
            </button>

            <div ref={sliderRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2" style={{ scrollSnapType: "x mandatory" }}>
              {reels.map(reel => (
                <ReelCard key={reel.id} reel={reel} />
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={18} style={{ color: "var(--ivory)" }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Extract Instagram media ID from URL
  const getMediaId = (url: string) => {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match?.[1] ?? null;
  };

  const mediaId = getMediaId(reel.instagramUrl);
  const embedUrl = mediaId ? `https://www.instagram.com/reel/${mediaId}/embed/?hidecaption=true` : null;

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 relative overflow-hidden rounded-xl"
      style={{
        width: "clamp(200px, 30vw, 280px)",
        aspectRatio: "9/16",
        scrollSnapAlign: "start",
        background: "#1a1a1a",
      }}
    >
      {/* Thumbnail fallback */}
      {reel.thumbnailUrl && !embedLoaded && (
        <img
          src={reel.thumbnailUrl}
          alt={reel.title || "Instagram Reel"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Instagram embed */}
      {embedUrl && (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
          style={{ transform: "scale(1.02)", transformOrigin: "center" }}
          allowFullScreen
          scrolling="no"
          title={reel.title || "Instagram Reel"}
          onLoad={() => setEmbedLoaded(true)}
          loading="lazy"
        />
      )}

      {/* Overlay for non-embeddable fallback */}
      {!embedUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <InstagramIcon size={32} strokeWidth={1} style={{ color: "rgba(250,247,242,0.6)" }} />
          {reel.title && <p className="text-sm font-sans font-medium" style={{ color: "var(--ivory)" }}>{reel.title}</p>}
          <a
            href={reel.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs tracking-widest uppercase font-sans mt-2 px-4 py-2 border border-white/20 hover:bg-white/10 transition-colors"
            style={{ color: "var(--ivory)" }}
          >
            Watch on Instagram <ExternalLink size={11} />
          </a>
        </div>
      )}

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
        {reel.title && (
          <p className="text-xs font-sans text-white leading-snug">{reel.title}</p>
        )}
      </div>

      {/* View on Instagram link */}
      <a
        href={reel.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        aria-label="View on Instagram"
      >
        <ExternalLink size={12} style={{ color: "#fff" }} />
      </a>
    </div>
  );
}
