import { Mail, Phone, MapPin } from "lucide-react";
import WhatsAppIcon from "@/components/shared/WhatsAppIcon";
import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMetadata("PAGE", "contact");
  const title = "Contact Us & FAQ | Eshara Naturals";
  const description = "Get in touch with Eshara Naturals. Have questions about our Ayurvedic hair oil, your ritual, or an order? Find our contact info and FAQs here.";

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
      title: seo?.ogTitle || seo?.title || "Contact Us & FAQ | Eshara Naturals",
      description: seo?.ogDescription || seo?.description || description,
      url: "/contact",
      siteName: "Eshara Naturals",
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Contact Eshara Naturals" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.title || "Contact Us & FAQ | Eshara Naturals",
      description: seo?.twitterDescription || seo?.description || description,
      images: seo?.twitterImage ? [seo.twitterImage] : ["/og-image.jpg"],
    },
  };
}

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";

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
    name: "Contact Eshara Naturals",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "Eshara Naturals",
      telephone: "+919048995577",
      email: "esharanatural@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Naduvattam Paripalana Committee",
        addressLocality: "Kozhikode",
        addressRegion: "Kerala",
        postalCode: "673015",
        addressCountry: "IN"
      }
    }
  };

  return (
    <div className="pt-6 lg:pt-10 min-h-screen" style={{ background: "var(--ivory)" }}>
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
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Info */}
          <div>
            <p className="section-eyebrow mb-6">Get in Touch</p>
            <h1 className="font-serif text-4xl lg:text-5xl mb-8" style={{ color: "var(--charcoal)" }}>We're Here for You.</h1>
            <p className="font-sans text-base leading-relaxed mb-12" style={{ color: "var(--text-secondary)" }}>
              Whether you have a question about our ingredients, your ritual, or an order, our team is happy to help.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <Mail className="mt-1" size={20} strokeWidth={1.5} style={{ color: "var(--forest)" }} />
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1" style={{ color: "var(--charcoal)" }}>Email Us</h3>
                  <a href="mailto:esharanatural@gmail.com" className="font-sans text-sm hover:underline" style={{ color: "var(--text-muted)" }}>esharanatural@gmail.com</a>
                </div>
              </div>
              <div className="flex gap-4">
                <WhatsAppIcon className="mt-1 shrink-0" size={20} fill="#25D366" />
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1" style={{ color: "var(--charcoal)" }}>Call / WhatsApp</h3>
                  <a href="https://wa.me/919048995577" target="_blank" rel="noopener" className="font-sans text-sm hover:underline" style={{ color: "var(--text-muted)" }}>+91 90489 95577</a>
                  <p className="text-xs font-sans mt-1" style={{ color: "var(--text-muted)" }}>Mon - Fri, 9am - 6pm IST</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="mt-1" size={20} strokeWidth={1.5} style={{ color: "var(--forest)" }} />
                <div>
                  <h3 className="text-xs tracking-widest uppercase font-sans font-semibold mb-1" style={{ color: "var(--charcoal)" }}>Headquarters</h3>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Naduvattam Paripalana Committee<br />Kozhikode, Kerala 673015<br />India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq">
            <h2 className="font-serif text-3xl mb-8" style={{ color: "var(--charcoal)" }}>Frequently Asked Questions</h2>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {faqData.map((faq, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-sans font-medium text-sm" style={{ color: "var(--charcoal)" }}>
                    {faq.q}
                    <span className="transition-transform group-open:rotate-45" style={{ color: "var(--forest)" }}>+</span>
                  </summary>
                  <div className="pt-4 pb-2 font-sans text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
    q: "What makes Eshara Naturals Herbal Hair Oil unique?",
    a: "Eshara Naturals Herbal Hair Oil is crafted with carefully selected Ayurvedic herbs and natural oils using traditional Ayurvedic principles. The formulation is designed to nourish the scalp and support overall hair wellness as part of a regular hair care routine."
  },
  {
    q: "Is this herbal hair oil suitable for both men and women?",
    a: "Yes. Eshara Naturals Herbal Hair Oil is suitable for both men and women and can be used as part of any regular hair-care regimen."
  },
  {
    q: "Is this herbal hair oil suitable for all hair types?",
    a: "Yes. The oil can be used on dry, normal, oily, straight, wavy, and curly hair types."
  },
  {
    q: "How often should I use this herbal hair oil?",
    a: "For best results, apply the oil 2–3 times a week or as part of your regular hair care routine."
  },
  {
    q: "Is this herbal hair oil suitable for dry and damaged hair?",
    a: "Yes. The nourishing blend of Ayurvedic herbs and natural oils helps care for dry, rough, and dull-looking hair while improving softness and manageability."
  },
  {
    q: "What is the best herbal oil for hair?",
    a: "The best herbal hair oil is one that combines authentic Ayurvedic herbs with traditional preparation methods. Eshara Naturals Herbal Hair Oil is made with carefully selected herbal ingredients to nourish the scalp, strengthen hair, and support healthy, naturally beautiful hair with regular use."
  }
];
