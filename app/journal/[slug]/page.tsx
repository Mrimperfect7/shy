import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  "ayurvedic-secrets-scalp-health": {
    slug: "ayurvedic-secrets-scalp-health",
    category: "Ayurvedic Hair Care",
    title: "Ayurvedic Secrets for a Healthy Scalp",
    subtitle: "Ancient wisdom meets modern hair science for root-to-tip vitality.",
    excerpt: "Ancient Ayurvedic wisdom has long recognised the scalp as the foundation of beautiful hair. Here's what it teaches us about maintaining balance.",
    readTime: "5 min read",
    datePublished: "2026-08-15T09:00:00Z",
    author: "Eshara Botanical Care Team",
    imageUrl: "/assets/ingredients-circle.png",
    content: [
      "In Ayurveda, hair is considered a byproduct of bone tissue (Asthi Dhatu) and an indicator of overall bodily equilibrium (Dosha balance). When the scalp is dry, inflamed, or congested, hair health naturally suffers.",
      "Traditional Indian texts describe Shiro Abhyanga—the sacred ritual of warm herbal oil scalp massage. Massaging herbs like Bhringraj, Brahmi, and Amla into the scalp stimulates vital energy points (Marmas), enhances microcirculation to the follicles, and calms an overactive nervous system.",
      "Modern hair science strongly correlates with this Ayurvedic perspective: optimal follicular growth occurs only when scalp micro-inflammation is kept at bay and the skin barrier is adequately hydrated with nutrient-rich plant lipids."
    ],
    keyTakeaways: [
      "Nourish roots weekly with slow-infused botanical oils.",
      "Perform gentle circular scalp massage to encourage blood flow.",
      "Avoid harsh sulfates and synthetic silicones that clog follicular pores.",
      "Balance lifestyle, hydration, and restful sleep for long-term hair resilience."
    ]
  },
  "bhringraj-herb-of-hair": {
    slug: "bhringraj-herb-of-hair",
    category: "Botanical Ingredients",
    title: "Bhringraj: The Ayurvedic 'King of Hair'",
    subtitle: "Why Eclipta Alba remains the cornerstone of our botanical formulation.",
    excerpt: "Known as Eclipta alba in Sanskrit texts, Bhringraj has been prized for centuries. We explore why this botanical remains central to our formula.",
    readTime: "4 min read",
    datePublished: "2026-08-18T10:30:00Z",
    author: "Eshara Formulation Lab",
    imageUrl: "/assets/layered-bottle.png",
    content: [
      "Known in Sanskrit as Keshraj—meaning 'Ruler of Hair'—Bhringraj (Eclipta prostrata / alba) has occupied the pinnacle of Ayurvedic trichology for more than three millennia.",
      "Rich in natural phyto-compounds such as wedelolactone, luteolin, and apigenin, Bhringraj works synergistically to soothe the scalp, deeply condition strands, and revitalize tired roots without heavy synthetic buildup.",
      "In our signature recipe, fresh Bhringraj leaves are slowly brewed with cold-pressed base oils over low, patient heat. This preserves the botanical's bioactive essence, ensuring every drop delivers traditional potency to your daily ritual."
    ],
    keyTakeaways: [
      "Bhringraj helps support natural hair density and strength.",
      "Known for cooling properties that alleviate scalp stress and tension.",
      "Deeply conditions the cuticle to restore natural shine and silkiness.",
      "Prepared via traditional slow-simmer methods to preserve bioactive integrity."
    ]
  },
  "building-a-hair-oil-ritual": {
    slug: "building-a-hair-oil-ritual",
    category: "Hair Care Rituals",
    title: "Building a Hair Oil Ritual That Works",
    subtitle: "Transforming weekly maintenance into a mindful, restorative practice.",
    excerpt: "Consistency transforms routine into ritual. Learn how to integrate natural hair oiling into your week in a way that feels effortless and effective.",
    readTime: "6 min read",
    datePublished: "2026-08-22T11:00:00Z",
    author: "Eshara Wellness Collective",
    imageUrl: "/assets/ingredients-circle.png",
    content: [
      "In our fast-paced modern world, hair care is frequently reduced to quick rinses and chemical fixes. Yet, true hair longevity requires intention and patience.",
      "An Ayurvedic hair oil ritual is not just about aesthetics; it is a grounding self-care practice. Taking 10 minutes, twice a week, to apply warm botanical oil from scalp to ends relieves daily stress while delivering essential nutrients directly to thirsty strands.",
      "For best results, leave the oil on for a minimum of 45 minutes—or overnight—before washing with a mild, sulfate-free cleanser. You will notice immediate softness and, over weeks, enhanced resilience against breakage and split ends."
    ],
    keyTakeaways: [
      "Warm a small amount of botanical hair oil between your palms.",
      "Section hair and apply directly to scalp with fingertips in rhythmic motions.",
      "Work excess oil down through the lengths and dry ends.",
      "Leave on for 1 to 2 hours or overnight for profound hydration."
    ]
  }
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  let title = "Article";
  let description = "Ayurvedic hair care insights from Eshara Naturals.";
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";
  const url = `${siteUrl}/journal/${slug}`;

  return {
    title: `${title} | Eshara Naturals Journal`,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | Eshara Naturals Journal`,
      description,
      url,
      siteName: "Eshara Naturals",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Eshara Naturals`,
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://esharanatural.com";
  const articleUrl = `${siteUrl}/journal/${slug}`;

  const title = dbArticle ? dbArticle.title : staticArticle.title;
  const category = dbArticle ? dbArticle.category.replace(/_/g, " ") : staticArticle.category;
  const excerpt = dbArticle ? dbArticle.excerpt : staticArticle.excerpt;
  const datePublished = dbArticle?.publishedAt ? dbArticle.publishedAt.toISOString() : (staticArticle?.datePublished || new Date().toISOString());
  const authorName = "Eshara Botanical Team";
  const imageUrl = dbArticle?.imageUrl || staticArticle?.imageUrl || "/assets/ingredients-circle.png";

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
      name: "Eshara Naturals",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/logo.png`
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
    <article className="min-h-screen pt-10 pb-20" style={{ background: "var(--ivory)" }}>
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
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-widest text-forest hover:text-charcoal transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Journal
        </Link>
      </div>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-6 lg:px-12 text-center pb-12">
        <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-sans uppercase tracking-widest bg-forest/10 text-forest font-semibold mb-4">
          {category}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-tight">
          {title}
        </h1>
        <p className="font-sans text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed mb-6">
          {excerpt}
        </p>

        <div className="flex items-center justify-center gap-6 text-xs font-sans text-gray-500 pt-2 border-t border-gray-200/80 max-w-md mx-auto">
          <div className="flex items-center gap-1.5">
            <Clock size={14} /> {staticArticle?.readTime || "5 min read"}
          </div>
          <div>·</div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} /> {new Date(datePublished).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm space-y-8">
          {dbArticle ? (
            <div
              className="prose prose-base max-w-none font-sans text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: dbArticle.content }}
            />
          ) : (
            <>
              {staticArticle.content.map((paragraph, index) => (
                <p key={index} className="font-sans text-base sm:text-lg text-gray-800 leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {staticArticle.keyTakeaways && staticArticle.keyTakeaways.length > 0 && (
                <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#0A3B12]/5 border border-[#0A3B12]/15">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-forest" />
                    <h3 className="font-serif text-xl text-charcoal font-semibold">Key Ayurvedic Takeaways</h3>
                  </div>
                  <ul className="space-y-3">
                    {staticArticle.keyTakeaways.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-sans text-gray-700 leading-normal">
                        <CheckCircle2 size={16} className="text-forest shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Call to action */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-serif text-xl text-charcoal mb-1">Experience the Eshara Ritual</h4>
              <p className="font-sans text-xs text-gray-600">Formulated with pure Ayurvedic herbs in small Kerala batches.</p>
            </div>
            <Link
              href="/shop"
              className="btn-primary whitespace-nowrap text-xs px-6 py-3"
            >
              Shop Botanical Oil
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
