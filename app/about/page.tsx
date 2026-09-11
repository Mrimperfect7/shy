import AboutSection from "@/components/home/AboutSection";
import AboutFounderSection from "@/components/home/AboutFounderSection";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";
import { Sparkles, Shield, Droplets, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("PAGE", "about");
  const title = "Our Story | Everyday Shine & Effortless Style | SHYN.ISH Jewellery";
  const description = "Discover the SHYN.ISH story. 18K PVD gold plated & 316L surgical stainless steel everyday jewellery under ₹480. Anti-tarnish, waterproof, hypoallergenic.";

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
      title: seo?.ogTitle || seo?.title || "Our Story | SHYN.ISH Jewellery",
      description: seo?.ogDescription || seo?.description || description,
      url: "/about",
      siteName: "SHYN.ISH",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Our Story - SHYN.ISH Jewellery" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.title || "Our Story | SHYN.ISH Jewellery",
      description: seo?.twitterDescription || seo?.description || description,
      images: seo?.twitterImage ? [seo.twitterImage] : ["/og-image.jpg"],
    },
  };
}

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About SHYN.ISH Jewellery",
    description: "Everyday shine and effortless style. 18K PVD gold plated jewellery under ₹480.",
    url: `${siteUrl}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "SHYN.ISH",
      url: siteUrl,
      logo: `${siteUrl}/assets/shyn-logo.png`,
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
    <div className="pt-6 lg:pt-10 bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero: Our Philosophy */}
      <section className="py-16 lg:py-28 text-center bg-gradient-to-b from-[#F4EFE6]/60 via-[#FAF8F5] to-[#FAF8F5] border-b border-[#C5A059]/15">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mb-4">
            <Sparkles size={12} />
            <span>Our Philosophy</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-6 tracking-tight text-[#141312] leading-[1.1]">
            Everyday Shine.<br />
            <span className="italic font-normal text-[#C5A059]">Effortless Style.</span>
          </h1>

          <div className="space-y-4 max-w-2xl mx-auto font-sans text-base lg:text-lg leading-relaxed text-[#5E564F]">
            <p>
              We founded <strong className="text-[#141312] font-semibold">SHYN.ISH</strong> on a simple conviction: luxury jewellery should be worn, loved, and lived in every single day—not locked inside a safe or saved only for special occasions.
            </p>
            <p>
              Traditional fine jewellery marks up solid gold by 10x to 20x, while fast-fashion brass tarnishes, chips, and turns fingers green within days. We engineered a better way: medical-grade 316L stainless steel bonded with real 18K gold through high-vacuum Physical Vapor Deposition (PVD).
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-[#C5A059] font-medium pt-3">
              "Waterproof. Sweat-resistant. Hypoallergenic. Everything under ₹480."
            </p>
          </div>
        </div>
      </section>

      {/* About Story & 5-Step Process */}
      <AboutSection />

      {/* The Founder's Journey */}
      <AboutFounderSection />

      {/* Guiding Principles */}
      <section className="py-16 lg:py-24 bg-white" id="materials">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] font-sans font-semibold text-[#C5A059] mb-3">
            THE SHYN.ISH PROMISE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-12 tracking-tight text-[#141312]">
            Our Guiding Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { 
                icon: <Droplets className="w-5 h-5 text-[#C5A059]" />,
                title: "100% ANTI-TARNISH & WATERPROOF", 
                desc: "Shower, sweat, swim, and sleep without removing your favourite pieces. Our 18K PVD gold barrier is impervious to moisture and daily wear." 
              },
              { 
                icon: <Shield className="w-5 h-5 text-[#C5A059]" />,
                title: "SURGICAL STEEL CORE", 
                desc: "Every piece begins with medical-grade 316L/304 stainless steel. 100% nickel-free and hypoallergenic—guaranteed never to turn your skin green." 
              },
              { 
                icon: <Heart className="w-5 h-5 text-[#C5A059]" />,
                title: "RADICAL PRICE ACCESSIBILITY", 
                desc: "By designing in-house and shipping direct-to-consumer across India, we deliver genuine fine-jewellery aesthetics with all pieces under ₹480." 
              },
            ].map(v => (
              <div key={v.title} className="p-8 rounded-2xl border border-[#C5A059]/20 bg-[#FAF8F5] hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#C5A059]/30 mb-5 shadow-xs">
                  {v.icon}
                </div>
                <h3 className="text-xs tracking-[0.18em] uppercase font-sans font-bold mb-3 text-[#141312]">
                  {v.title}
                </h3>
                <p className="font-sans text-sm sm:text-base leading-relaxed text-[#5E564F]">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link href="/shop" className="btn-gold px-8 py-3.5 inline-flex items-center gap-2">
              <Sparkles size={14} />
              <span>Explore The Collection Under ₹480</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
