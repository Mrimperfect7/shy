import CreatorCollabForm from "@/components/shared/CreatorCollabForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Collab & Partnerships | Eshara Naturals",
  description: "Partner with Eshara Naturals. We collaborate with creators who share our passion for Ayurvedic wellness, botanical hair care, and natural beauty.",
  alternates: {
    canonical: "/creator-collab",
  },
  openGraph: {
    title: "Creator Collab & Partnerships | Eshara Naturals",
    description: "Partner with Eshara Naturals. Share the Eshara Ayurvedic ritual with your community.",
    url: "/creator-collab",
    siteName: "Eshara Naturals",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Creator Collab - Eshara Naturals" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Collab | Eshara Naturals",
    description: "Partner with Eshara Naturals. Share the Eshara Ayurvedic ritual with your community.",
    images: ["/og-image.jpg"],
  },
};

export default function CreatorCollabPage() {
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
        name: "Creator Collab",
        item: `${siteUrl}/creator-collab`
      }
    ]
  };

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: "var(--ivory)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="section-eyebrow justify-center mb-4">Partnerships</p>
          <h1 className="font-serif text-4xl lg:text-5xl mb-6" style={{ color: "var(--charcoal)" }}>Creator Collab</h1>
          <p className="font-sans text-base leading-relaxed max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            We're looking for authentic voices who share our love for natural beauty, slow rituals, and genuine care. Partner with us to share the Eshara ritual with your community.
          </p>
        </div>

        <CreatorCollabForm />
      </div>
    </div>
  );
}
