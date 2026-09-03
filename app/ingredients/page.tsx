import IngredientStory from "@/components/home/IngredientStory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Ayurvedic Herbs & Ingredients | Eshara Naturals",
  description: "Every ingredient in Eshara is chosen with purpose, rooted in traditional Ayurvedic hair care. Discover our full formulation transparency.",
  alternates: {
    canonical: "/ingredients",
  },
  openGraph: {
    title: "The Ayurvedic Herbs & Ingredients | Eshara Naturals",
    description: "Every ingredient in Eshara is chosen with purpose, rooted in traditional Ayurvedic hair care. Discover our full formulation transparency.",
    url: "/ingredients",
    siteName: "Eshara Naturals",
    images: [{ url: "/assets/ingredients-circle.png", width: 1200, height: 630, alt: "Ayurvedic Herbs - Eshara Naturals" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Ayurvedic Herbs & Ingredients | Eshara Naturals",
    description: "Every ingredient in Eshara is chosen with purpose, rooted in traditional Ayurvedic hair care.",
    images: ["/assets/ingredients-circle.png"],
  },
};

export default function IngredientsPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: "The Ayurvedic Herbs & Ingredients",
    description: "Full botanical transparency of Eshara Naturals Ayurvedic herbs and cold-pressed oils.",
    url: `${siteUrl}/ingredients`,
    mainEntity: {
      "@type": "ItemList",
      name: "Ayurvedic Herbs",
      itemListElement: [
        "Bhringraj", "Brahmi", "Amla", "Rosemary", "Hibiscus", 
        "Fenugreek", "Curry Leaves", "Neem", "Shikakai", "Tulsi",
        "Jatamansi", "Coconut Oil", "Sesame Oil", "Castor Oil"
      ].map((herb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: herb
      }))
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
        name: "Ingredients",
        item: `${siteUrl}/ingredients`
      }
    ]
  };

  return (
    <div className="pt-6 lg:pt-10" style={{ background: "var(--cream)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Transparency Header */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-12 pb-16 text-center">
        <p className="section-eyebrow justify-center mb-4">TRANSPARENCY</p>
        <h1 className="font-serif text-4xl lg:text-6xl mb-6 tracking-tight" style={{ color: "var(--charcoal)" }}>
          The Ayurvedic Herbs
        </h1>
        <p className="font-sans text-base lg:text-lg leading-relaxed mx-auto max-w-2xl text-gray-700">
          Every ingredient in Eshara is chosen with purpose, rooted in traditional Ayurvedic hair care. We believe you deserve to know what goes into your hair oil and why it belongs there.
        </p>
      </div>

      {/* Ingredient Story / Formula Component */}
      <div style={{ background: "#fff" }}>
        <IngredientStory />
      </div>

      {/* What We Leave Out Section */}
      <section className="py-16 lg:py-24 text-center" style={{ background: "var(--forest)" }}>
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight" style={{ color: "var(--ivory)" }}>
            What We Leave Out
          </h2>
          
          <p className="font-sans text-base sm:text-lg leading-relaxed text-white/90 max-w-xl mx-auto">
            In a world of quick fixes and synthetic-heavy hair products, we choose a simpler approach.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto py-2">
            {[
              "No mineral oils",
              "No silicones",
              "No parabens",
              "No synthetic fragrances",
              "No artificial colours"
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold tracking-wide bg-white/10 text-white border border-white/20 backdrop-blur-sm shadow-sm"
              >
                ✕ {item}
              </span>
            ))}
          </div>

          <p className="font-serif text-lg sm:text-xl italic text-amber-200/90 font-light pt-2 max-w-xl mx-auto">
            Just carefully selected natural ingredients, rooted in traditional Ayurvedic care.
          </p>
        </div>
      </section>
    </div>
  );
}
