import CreatorCollabForm from "@/components/shared/CreatorCollabForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Collab & Partnerships | SHYN.ISH",
  description: "Partner with SHYN.ISH. We collaborate with fashion, styling, and jewellery creators across India who love everyday luxury and honest pricing.",
  alternates: {
    canonical: "/creator-collab",
  },
  openGraph: {
    title: "Creator Collab & Partnerships | SHYN.ISH",
    description: "Partner with SHYN.ISH. Share everyday shine & effortless styling with your audience.",
    url: "/creator-collab",
    siteName: "SHYN.ISH",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Creator Collab - SHYN.ISH" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Collab | SHYN.ISH",
    description: "Partner with SHYN.ISH. Share everyday shine & effortless styling with your audience.",
    images: ["/og-image.jpg"],
  },
};

export default function CreatorCollabPage() {
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
        name: "Creator Collab",
        item: `${siteUrl}/creator-collab`
      }
    ]
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="section-eyebrow justify-center mb-4">Partnerships</p>
          <h1 className="font-serif text-4xl lg:text-5xl mb-6 text-[#141312]">Creator Collab</h1>
          <p className="font-sans text-base leading-relaxed max-w-xl mx-auto text-[#141312]/70">
            We are looking for creative stylists, fashion enthusiasts, and everyday aesthetic creators who love effortless jewellery. Partner with SHYN.ISH and bring everyday sparkle to your community.
          </p>
        </div>

        <CreatorCollabForm />
      </div>
    </div>
  );
}
