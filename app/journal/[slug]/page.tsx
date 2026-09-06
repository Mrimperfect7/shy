import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

interface StaticArticle {
  slug: string;
  category: string;
  title: string;
  subtitle: string;
  excerpt: string;
  readTime: string;
  datePublished: string;
  author: string;
  imageUrl: string;
  content: string[];
  keyTakeaways: string[];
}

const STATIC_ARTICLES: Record<string, StaticArticle> = {
  "pvd-gold-vs-regular-gold-plating": {
    slug: "pvd-gold-vs-regular-gold-plating",
    category: "Material Science",
    title: "18K PVD Gold vs. Regular Plating: Why It Never Turns Green",
    subtitle: "The metallurgical breakthrough behind waterproof, anti-tarnish everyday jewellery.",
    excerpt: "Ever wonder why typical gold-plated jewellery fades in weeks while PVD coating lasts years? We break down the vacuum deposition science behind sweat-proof, shower-safe gold.",
    readTime: "4 min read",
    datePublished: "2026-08-25T10:00:00Z",
    author: "SHYN.ISH Metallurgy Studio",
    imageUrl: "/assets/hero-jewellery.jpg",
    content: [
      "If you have ever bought a fast-fashion gold necklace only to find your collarbone stained emerald green three days later, you are not alone. Traditional fashion jewellery relies on electroplating—a quick flash bath that leaves an ultra-thin (0.1 to 0.5 micron) layer of gold over cheap base metals like copper, brass, or zinc.",
      "The moment water, sweat, or lotion touches these base metals, galvanic oxidation occurs. Copper and nickel react with skin acidity to form copper carbonate, causing that infamous green residue.",
      "At SHYN.ISH, we engineered a completely different standard: Physical Vapor Deposition (PVD). Under high-vacuum chambers exceeding 400°C, real 18K gold is vaporized into a plasma state and atomically blasted onto medical-grade 316L surgical stainless steel.",
      "Rather than a fragile surface coat that chips away, PVD bonds the gold molecules directly into the lattice of the steel. The resulting barrier is up to 10 times thicker, exceptionally scratch-resistant, and impervious to tap water, gym sweat, sea salt, and perfumes."
    ],
    keyTakeaways: [
      "18K PVD gold uses high-temperature vacuum plasma bonding rather than chemical flash baths.",
      "316L medical stainless steel core is 100% hypoallergenic, nickel-free, and lead-free.",
      "Zero green skin: the surgical steel foundation cannot oxidize or produce copper carbonates.",
      "Safe for daily showers, beach swims, hot yoga, and all-day wear without removal."
    ]
  },
  "art-of-everyday-chain-layering": {
    slug: "art-of-everyday-chain-layering",
    category: "Styling Guide",
    title: "The Art of Layering: How to Stack Necklaces Like a Stylist",
    excerpt: "Master the curated neck stack. Graduated chain lengths, contrasting herringbone with pendants, and effortless balance for daily wear.",
    subtitle: "Effortless stacking rules for herringbone chains, medallion pendants, and dainty chokers.",
    readTime: "5 min read",
    datePublished: "2026-08-28T11:30:00Z",
    author: "SHYN.ISH Styling Team",
    imageUrl: "/assets/products/necklace-pendant.jpg",
    content: [
      "Necklace layering is one of the quickest ways to elevate a simple white tee, an oversized blazer, or evening silk into a styled, intentional silhouette. Yet, many people struggle with tangles, cluttered textures, or necklaces competing for attention.",
      "The secret to a timeless stack is the Rule of Three: one base chain that sits high near the collarbone (14–16 inches), one textural middle piece (18 inches), and one weighted focal anchor (20–22 inches).",
      "Pair a sleek, fluid liquid-gold herringbone snake chain at 16 inches with a delicate textured paperclip or box chain at 18 inches, and anchor the stack with an engraved gold medallion or solitary gemstone pendant at 20 inches. Because each chain has a distinct weight and width, they glide past each other naturally without catching or knotting.",
      "Feel free to mix finishes subtly—a high-polish mirrored chain against a hammered gold pendant adds organic depth and catching facets of sunlight from every angle."
    ],
    keyTakeaways: [
      "Follow the 2-inch graduated rule: 14/16\" choker + 18\" texture chain + 20/22\" pendant anchor.",
      "Mix chain weights: pair a flat snake/herringbone chain with an open-link cable or rope chain.",
      "Pick one hero focal point: let a medallion or gemstone take center stage while supporting chains frame it.",
      "All SHYN.ISH chains feature 2-inch extender clasps for customizable, tangle-resistant layering."
    ]
  },
  "complete-jewellery-care-guide": {
    slug: "complete-jewellery-care-guide",
    category: "Jewellery Care",
    title: "How to Keep Your Waterproof Jewellery Gleaming Forever",
    subtitle: "Simple cleaning, storage, and maintenance rituals for 18K PVD gold and stainless steel.",
    excerpt: "Simple cleaning, storage, and maintenance rituals to preserve your 18K PVD gold and surgical steel pieces in pristine mirror shine for years to come.",
    readTime: "3 min read",
    datePublished: "2026-09-01T09:00:00Z",
    author: "SHYN.ISH Care Lab",
    imageUrl: "/assets/hero-jewellery.jpg",
    content: [
      "One of the greatest luxuries of SHYN.ISH 18K PVD gold jewellery is its freedom: you don't need to baby it, remove it before washing hands, or worry about rain showers. However, like any luxury accessory, everyday oils, soaps, and lotions can form a light surface film over time.",
      "Restoring that brand-new mirror shine takes less than two minutes. Mix lukewarm water with a few drops of mild dish soap, let your pieces soak for 60 seconds, gently wipe with a soft microfiber cloth, and rinse clean.",
      "Avoid harsh industrial abrasive cleaners or jewelry dips meant for sterling silver, as they are unnecessary and can dull polished finishes. When traveling, store each piece in its provided SHYN.ISH velvet pouch to prevent chains from tangling against keys or zippers.",
      "With these effortless micro-habits, your 18K PVD gold pieces will continue shining with mirror radiance season after season."
    ],
    keyTakeaways: [
      "Clean monthly with warm water and mild soap to remove lotion and natural skin oil buildup.",
      "Dry thoroughly with a soft microfiber cloth to restore instant liquid-gold shine.",
      "Avoid harsh silver-dip chemicals; PVD steel does not require chemical tarnish removers.",
      "Store individually in your complimentary SHYN.ISH velvet pouch when traveling."
    ]
  }
};

// Aliases for any legacy slugs so existing bookmarks do not 404
STATIC_ARTICLES["ayurvedic-secrets-scalp-health"] = STATIC_ARTICLES["pvd-gold-vs-regular-gold-plating"];
STATIC_ARTICLES["bhringraj-herb-of-hair"] = STATIC_ARTICLES["art-of-everyday-chain-layering"];
STATIC_ARTICLES["building-a-hair-oil-ritual"] = STATIC_ARTICLES["complete-jewellery-care-guide"];

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  let title = "Article | SHYN.ISH Journal";
  let description = "Jewellery care, styling guides, and metallurgy insights from SHYN.ISH.";
  let imageUrl = "/og-image.jpg";

  let dbArticle = null;
  try {
    dbArticle = await prisma.journalArticle.findUnique({ where: { slug } });
  } catch {}

  if (dbArticle) {
    title = dbArticle.title;
    description = dbArticle.excerpt.slice(0, 160);
    if (dbArticle.imageUrl) imageUrl = dbArticle.imageUrl;
  } else if (STATIC_ARTICLES[slug]) {
    const staticA = STATIC_ARTICLES[slug];
    title = staticA.title;
    description = staticA.excerpt;
    imageUrl = staticA.imageUrl;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const url = `${siteUrl}/journal/${slug}`;

  return {
    title: `${title} | SHYN.ISH Journal`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | SHYN.ISH Journal`,
      description,
      url,
      siteName: "SHYN.ISH",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SHYN.ISH`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function JournalArticlePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  let dbArticle = null;
  try {
    dbArticle = await prisma.journalArticle.findUnique({ where: { slug } });
  } catch {}

  const staticArticle = STATIC_ARTICLES[slug];

  if (!dbArticle && !staticArticle) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shynish.com";
  const articleUrl = `${siteUrl}/journal/${slug}`;

  const title = dbArticle ? dbArticle.title : staticArticle.title;
  const category = dbArticle ? dbArticle.category.replace(/_/g, " ") : staticArticle.category;
  const excerpt = dbArticle ? dbArticle.excerpt : staticArticle.excerpt;
  const datePublished = dbArticle?.publishedAt ? dbArticle.publishedAt.toISOString() : (staticArticle?.datePublished || new Date().toISOString());
  const authorName = staticArticle?.author || "SHYN.ISH Studio";
  const imageUrl = dbArticle?.imageUrl || staticArticle?.imageUrl || "/assets/hero-jewellery.jpg";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image: imageUrl.startsWith("http") ? imageUrl : `${siteUrl}${imageUrl}`,
    datePublished,
    dateModified: dbArticle?.updatedAt ? dbArticle.updatedAt.toISOString() : datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    author: {
      "@type": "Organization",
      name: authorName,
      url: siteUrl
    },
    publisher: {
      "@type": "Organization",
      name: "SHYN.ISH",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/shyn-logo.png`
      }
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
        name: "Journal",
        item: `${siteUrl}/journal`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: articleUrl
      }
    ]
  };

  return (
    <article className="min-h-screen pt-10 pb-20 bg-[#FAF8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 pt-8 pb-4">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#141312] transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Journal
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-12">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-sans uppercase tracking-[0.2em] bg-[#C5A059]/15 text-[#C5A059] font-semibold mb-4">
          {category}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#141312] mb-6 leading-tight">
          {title}
        </h1>
        <p className="font-sans text-base sm:text-lg text-[#5E564F] max-w-2xl mx-auto leading-relaxed mb-6">
          {excerpt}
        </p>

        <div className="flex items-center justify-center gap-6 text-xs font-sans text-[#5E564F]/80 pt-4 border-t border-[#C5A059]/20 max-w-md mx-auto">
          <div className="flex items-center gap-1.5">
            <Clock size={14} /> {staticArticle?.readTime || "4 min read"}
          </div>
          <div>·</div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} /> {new Date(datePublished).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/20 shadow-sm space-y-8">
          {dbArticle ? (
            <div
              className="prose prose-base max-w-none font-sans text-[#141312] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: dbArticle.content }}
            />
          ) : (
            <>
              {staticArticle.content.map((paragraph, index) => (
                <p key={index} className="font-sans text-base sm:text-lg text-[#3E3832] leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {staticArticle.keyTakeaways && staticArticle.keyTakeaways.length > 0 && (
                <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] border border-[#C5A059]/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-[#C5A059]" />
                    <h3 className="font-serif text-xl text-[#141312] font-semibold">Key Jewellery Takeaways</h3>
                  </div>
                  <ul className="space-y-3">
                    {staticArticle.keyTakeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-sans text-[#5E564F] leading-normal">
                        <CheckCircle2 size={16} className="text-[#C5A059] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Call to action */}
          <div className="mt-12 pt-8 border-t border-[#C5A059]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-serif text-xl text-[#141312] mb-1">Explore Everyday Shine</h4>
              <p className="font-sans text-xs text-[#5E564F]">18K PVD gold & 316L stainless steel jewellery under ₹480.</p>
            </div>
            <Link
              href="/shop"
              className="btn-gold whitespace-nowrap text-xs px-6 py-3"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
