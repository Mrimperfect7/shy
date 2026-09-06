import Link from "next/link";
import JournalGrid from "@/components/home/JournalGrid";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "The Jewellery Journal | Stacking Guides, Metallurgy & Care | SHYN.ISH",
  description: "Explore jewellery styling guides, necklace stacking tutorials, 18K PVD gold metallurgy insights, and anti-tarnish care tips from SHYN.ISH.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "The Jewellery Journal | SHYN.ISH",
    description: "Guides on effortless necklace stacking, fine metallurgy, and everyday shine.",
    url: "/journal",
    siteName: "SHYN.ISH",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "The Jewellery Journal - SHYN.ISH" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Jewellery Journal | SHYN.ISH",
    description: "Guides on effortless necklace stacking, fine metallurgy, and everyday shine.",
    images: ["/og-image.jpg"],
  },
};

export default function JournalPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${siteUrl}/journal`
      }
    ]
  };

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The SHYN.ISH Jewellery Journal",
    description: "Jewellery styling, necklace stacking rules, 18K PVD metallurgy, and care guides.",
    url: `${siteUrl}/journal`,
    publisher: {
      "@type": "Organization",
      name: "SHYN.ISH",
      logo: `${siteUrl}/assets/shyn-logo.png`
    }
  };

  const categories = [
    "Material Science",
    "Styling Guides",
    "Jewellery Care",
    "Stacking 101",
    "Gifting Stories",
    "Behind The Bench"
  ];

  return (
    <div className="pt-6 lg:pt-10 min-h-screen bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      
      {/* Editorial Header */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mb-4">
          <Sparkles size={12} />
          <span>Editorial & Styling</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-6 text-[#141312] leading-[1.1]">
          The Jewellery Journal
        </h1>
        <p className="font-sans text-base sm:text-lg leading-relaxed mx-auto max-w-xl text-[#5E564F]">
          Notes on modern metallurgy, the art of effortless chain stacking, and caring for waterproof everyday jewellery.
        </p>
      </div>

      <JournalGrid />

      {/* Categories Strip */}
      <section className="py-12 lg:py-20 border-t border-[#C5A059]/20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-serif text-2xl mb-6 text-[#141312]">
            Explore by Topic
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#FAF8F5] text-xs font-sans font-medium text-[#141312] hover:bg-[#C5A059] hover:text-white transition-all cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
