import Link from "next/link";
import Image from "next/image";
import { Play, ArrowUpRight } from "lucide-react";
import InstagramIcon from "@/components/shared/InstagramIcon";

interface InstagramUgcSectionProps {
  reels?: Array<{
    id: string;
    instagramUrl: string;
    title?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
  }>;
}

const FALLBACK_REELS = [
  {
    id: "r1",
    instagramUrl: "https://www.instagram.com/shyn.ish/",
    title: "Unboxing our ₹199 Herringbone Chain ✨",
    description: "Liquid gold feel on skin. Water-resistant 18K PVD finish.",
    thumbnailUrl: "/assets/products/necklace-pendant.jpg",
    views: "24.5K",
  },
  {
    id: "r2",
    instagramUrl: "https://www.instagram.com/shyn.ish/",
    title: "The ₹99 Ring stack you won't take off 💍",
    description: "No green fingers. 316L medical stainless steel core.",
    thumbnailUrl: "/assets/products/rings-stack.jpg",
    views: "48.2K",
  },
  {
    id: "r3",
    instagramUrl: "https://www.instagram.com/shyn.ish/",
    title: "Twisted Croissant Hoops on ears ✨",
    description: "Lightweight all-day luxury for ₹185.",
    thumbnailUrl: "/assets/products/earrings-hoops.jpg",
    views: "31.9K",
  },
  {
    id: "r4",
    instagramUrl: "https://www.instagram.com/shyn.ish/",
    title: "Luxury gift unboxing box reveal 🎁",
    description: "Velvet interior + anti-tarnish pouch. Perfect ₹480 gift.",
    thumbnailUrl: "/assets/products/necklace-pendant.jpg",
    views: "52.0K",
  },
];

export default function InstagramUgcSection({ reels }: InstagramUgcSectionProps) {
  const displayReels = reels && reels.length > 0 ? reels : FALLBACK_REELS;

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5] border-t border-[#C5A059]/15">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow mb-3">
              <span>Community & Social Proof</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
              Seen on @shyn.ish
            </h2>
          </div>
          <Link
            href="https://www.instagram.com/shyn.ish/"
            target="_blank"
            rel="noopener"
            className="btn-outline flex items-center gap-2 text-xs"
            data-cursor="INSTA"
          >
            <InstagramIcon size={16} />
            <span>Follow @shyn.ish</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Reels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {displayReels.slice(0, 4).map((reel, idx) => (
            <a
              key={reel.id}
              href={reel.instagramUrl || "https://www.instagram.com/shyn.ish/"}
              target="_blank"
              rel="noopener"
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-[#C5A059]/25 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-4 bg-[#141312]"
              data-cursor="PLAY"
            >
              <Image
                src={reel.thumbnailUrl || "/assets/products/necklace-pendant.jpg"}
                alt={reel.title || "SHYN.ISH Instagram Reel"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#141312]/90 via-[#141312]/30 to-transparent" />

              {/* Play Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-[#C5A059] group-hover:text-[#141312] transition-colors">
                <Play size={13} fill="currentColor" />
              </div>

              {/* Reel Info */}
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] text-[#C5A059] font-sans font-semibold uppercase tracking-wider block">
                  Reel {idx + 1}
                </span>
                <p className="font-serif text-sm text-white font-normal line-clamp-2 leading-snug">
                  {reel.title || "Real customer styling on Instagram"}
                </p>
                <p className="text-[11px] text-white/60 font-sans font-light line-clamp-1">
                  {reel.description || "18K PVD Gold Plated"}
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
