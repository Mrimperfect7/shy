import { Mail, MapPin, Sparkles } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("PAGE", "contact");
  const title = "Contact Us & FAQ | SHYN.ISH Everyday Jewellery";
  const description = "Get in touch with SHYN.ISH. Questions about our 18K PVD gold plated jewellery, order tracking, shipping, or styling? We are here to help.";

  return {
    title: seo?.title || title,
    description: seo?.description || description,
    alternates: {
      canonical: seo?.canonicalUrl || "/contact",
    },
    robots: {
      index: seo?.robotsIndex ?? true,
      follow: seo?.robotsFollow ?? true,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.title || "Contact Us & FAQ | SHYN.ISH",
      description: seo?.ogDescription || seo?.description || description,
      url: "/contact",
      siteName: "SHYN.ISH",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contact SHYN.ISH" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.title || "Contact Us & FAQ | SHYN.ISH",
      description: seo?.twitterDescription || seo?.description || description,
      images: seo?.twitterImage ? [seo.twitterImage] : ["/og-image.jpg"],
    },
  };
}

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
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
        name: "Contact",
        item: `${siteUrl}/contact`
      }
    ]
  };

  const contactLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SHYN.ISH",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "SHYN.ISH",
      telephone: "+919876543210",
      email: "care@shynish.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Fashion Jewellery Hub",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        postalCode: "400001",
        addressCountry: "IN"
      }
    }
  };

  return (
    <div className="pt-6 lg:pt-10 min-h-screen bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={12} />
              <span>Get in Touch</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl mb-6 text-[#141312]">We're Here for You.</h1>
            <p className="font-sans text-base leading-relaxed mb-12 text-[#141312]/70">
              Whether you have a question about sizing, styling recommendations, 18K PVD metallurgy, or order tracking, our team is always ready to assist.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                  <Mail size={18} strokeWidth={1.5} className="text-[#C5A059]" />
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1 text-[#141312]">Email Us</h3>
                  <a href="mailto:care@shynish.com" className="font-sans text-sm hover:underline text-[#141312]/80">care@shynish.com</a>
                  <p className="text-xs font-sans mt-0.5 text-gray-500">Replies usually within 4–6 hours</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="shrink-0" size={18} fill="#25D366" />
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1 text-[#141312]">Call / WhatsApp Support</h3>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener" className="font-sans text-sm hover:underline text-[#141312]/80">+91 98765 43210</a>
                  <p className="text-xs font-sans mt-0.5 text-gray-500">Mon - Sat, 10am - 7pm IST</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} strokeWidth={1.5} className="text-[#C5A059]" />
                </div>
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1 text-[#141312]">Customer Care & Dispatch</h3>
                  <p className="font-sans text-sm leading-relaxed text-[#141312]/80">
                    SHYN.ISH Studio & Fulfillment<br />Mumbai, Maharashtra 400001<br />India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq">
            <h2 className="font-serif text-3xl mb-8 text-[#141312]">Frequently Asked Questions</h2>
            <div className="divide-y divide-[#C5A059]/20">
              {faqData.map((faq, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-sans font-medium text-sm text-[#141312] hover:text-[#C5A059] transition-colors">
                    {faq.q}
                    <span className="transition-transform group-open:rotate-45 text-[#C5A059] text-base">+</span>
                  </summary>
                  <div className="pt-4 pb-2 font-sans text-sm leading-relaxed text-[#141312]/70">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const faqData = [
  {
    q: "Is SHYN.ISH jewellery waterproof and anti-tarnish?",
    a: "Yes. Every piece features genuine 18K PVD gold coating vacuum-bonded over surgical 316L/304 stainless steel. It resists water, sweat, lotions, and daily wear without discoloration."
  },
  {
    q: "Will SHYN.ISH jewellery turn my skin green?",
    a: "Never. Green discoloration is caused by cheap copper and low-grade nickel alloys. Our surgical steel base is 100% hypoallergenic, nickel-free, and lead-free."
  },
  {
    q: "What does 'Jewellery Under ₹480' mean?",
    a: "We cut out traditional middleman markups and expensive retail overheads so you can wear high-end aesthetic jewellery every day with prices mostly under ₹480."
  },
  {
    q: "How long does shipping take across India?",
    a: "Orders are processed within 1–2 business days. Delivery to metro cities takes 3–5 business days, while other destinations arrive within 4–7 business days."
  },
  {
    q: "How should I clean and store my jewellery?",
    a: "Rinse under lukewarm water with a drop of mild dish soap, pat dry with a soft microfiber cloth, and store inside your SHYN.ISH pouch or box to keep it scratch-free."
  },
  {
    q: "What is your exchange and return policy?",
    a: "We offer a 7-day return/exchange policy if your item arrives damaged, defective, or incorrect. Reach out to care@shynish.com with your unboxing video or photo."
  }
];
