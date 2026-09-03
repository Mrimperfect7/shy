import Link from "next/link";
import JournalGrid from "@/components/home/JournalGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Journal | Ayurvedic Hair Care Wisdom & Ayurvedic Herbs | Eshara Naturals",
  description: "Explore Ayurvedic wisdom, traditional hair rituals, botanical ingredient spotlights, and natural beauty insights from Eshara Naturals.",
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "The Journal | Eshara Naturals",
    description: "Thoughts on slow rituals, natural beauty, and the Ayurvedic botanical wisdom that guides us.",
    url: "/journal",
    siteName: "Eshara Naturals",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "The Journal - Eshara Naturals" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Journal | Eshara Naturals",
    description: "Thoughts on slow rituals, natural beauty, and the Ayurvedic botanical wisdom that guides us.",
    images: ["/og-image.jpg"],
  },
};

export default function JournalPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";

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
    name: "Eshara Naturals Botanical Journal",
    description: "Insights into Ayurveda, natural hair care rituals, and botanical transparency.",
    url: `${siteUrl}/journal`,
    publisher: {
      "@type": "Organization",
      name: "Eshara Naturals",
      logo: `${siteUrl}/assets/logo.png`
    }
  };

  return (
    <div className="pt-6 lg:pt-10 min-h-screen" style={{ background: "var(--ivory)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-12 pb-16 text-center">
        <p className="section-eyebrow justify-center mb-6">Editorial</p>
        <h1 className="font-serif text-4xl lg:text-5xl mb-8" style={{ color: "var(--charcoal)" }}>The Journal</h1>
        <p className="font-sans text-base leading-relaxed mx-auto max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Thoughts on slow rituals, natural beauty, and the botanical wisdom that guides us.
        </p>
      </div>

      <JournalGrid />

      {/* Categories */}
      <section className="py-10 lg:py-20 border-t" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <h2 className="font-serif text-2xl mb-8" style={{ color: "var(--charcoal)" }}>Explore by Category</h2>
          <div className="flex flex-wrap gap-4">
            {["Ayurvedic Hair Care", "Botanical Ingredients", "Hair Care Rituals", "Brand Story", "Founder's Note"].map(cat => (
              <Link key={cat} href={`/journal?category=${encodeURIComponent(cat)}`} className="btn-outline text-xs px-4 py-2">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
