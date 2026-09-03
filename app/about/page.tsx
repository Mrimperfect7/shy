import AboutSection from "@/components/home/AboutSection";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("PAGE", "about");
  const title = "Our Story | Rooted in Ayurveda, Crafted with Patience | Eshara Naturals";
  const description = "At Eshara Naturals, we believe the wisdom of Ayurveda has always understood what healthy hair needs. Discover our slow-crafted Ayurvedic hair care story.";

  return {
    title: seo?.title || title,
    description: seo?.description || description,
    alternates: {
      canonical: seo?.canonicalUrl || "/about",
    },
    robots: {
      index: seo?.robotsIndex ?? true,
      follow: seo?.robotsFollow ?? true,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.title || "Our Story | Eshara Naturals",
      description: seo?.ogDescription || seo?.description || description,
      url: "/about",
      siteName: "Eshara Naturals",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Our Story - Eshara Naturals" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.title || "Our Story | Eshara Naturals",
      description: seo?.twitterDescription || seo?.description || description,
      images: seo?.twitterImage ? [seo.twitterImage] : ["/og-image.jpg"],
    },
  };
}

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Eshara Naturals",
    description: "At Eshara Naturals, we believe the wisdom of Ayurveda has always understood what healthy hair needs.",
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "Eshara Naturals",
      url: siteUrl,
      logo: `${siteUrl}/assets/logo.png`,
    }
  };

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
        name: "About",
        item: `${siteUrl}/about`
      }
    ]
  };

  return (
    <div className="pt-6 lg:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Hero: Our Philosophy */}
      <section className="py-16 lg:py-28 text-center" style={{ background: "var(--cream)" }}>
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="section-eyebrow justify-center mb-4">OUR PHILOSOPHY</p>
          <h1 className="font-serif text-4xl lg:text-6xl mb-6 tracking-tight" style={{ color: "var(--charcoal)", lineHeight: 1.1 }}>
            A Return to<br />Traditional Hair Care.
          </h1>
          <div className="space-y-4 max-w-2xl mx-auto font-sans text-base lg:text-lg leading-relaxed text-gray-700">
            <p>
              Inspired by the timeless wisdom of Ayurveda, Eshara brings traditional hair-care rituals back into our everyday lives in a world increasingly filled with synthetic chemicals, quick fixes and fast-made products.
            </p>
            <p>
              We believe hair care should begin before the damage does. Start your journey early with natural nourishment, mindful care and a ritual rooted in generations of Ayurvedic wisdom.
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-[var(--forest)] font-medium pt-3">
              Start early. Nourish naturally. Make healthy hair a ritual.
            </p>
          </div>
        </div>
      </section>

      {/* About Story & 5-Step Process */}
      <AboutSection />

      {/* Guiding Principles */}
      <section className="py-16 lg:py-24" style={{ background: "#fff" }}>
        <div className="max-w-8xl mx-auto px-6 lg:px-12 text-center">
          <p className="section-eyebrow justify-center mb-3">CORE VALUES</p>
          <h2 className="font-serif text-3xl lg:text-4xl mb-12 tracking-tight" style={{ color: "var(--charcoal)" }}>
            OUR GUIDING PRINCIPLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { 
                title: "TRANSPARENCY", 
                desc: "Every ingredient has a purpose. No unnecessary fillers, no shortcuts." 
              },
              { 
                title: "PATIENCE", 
                desc: "Good things take time. Our slow-crafted process is never rushed." 
              },
              { 
                title: "RESPECT", 
                desc: "We respect nature, traditional Ayurvedic wisdom and the ingredients that make every Eshara blend possible." 
              },
            ].map(v => (
              <div key={v.title} className="p-8 rounded-2xl border border-gray-200 bg-[var(--ivory)] hover:shadow-md transition-shadow">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--forest)] block mb-4" />
                <h3 className="text-sm tracking-widest uppercase font-sans font-bold mb-3 text-[var(--forest)]">
                  {v.title}
                </h3>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-gray-700">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
