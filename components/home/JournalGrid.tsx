import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ARTICLES = [
  {
    slug: "ayurvedic-secrets-scalp-health",
    category: "Ayurvedic Hair Care",
    title: "Ayurvedic Secrets for a Healthy Scalp",
    excerpt: "Ancient Ayurvedic wisdom has long recognised the scalp as the foundation of beautiful hair. Here's what it teaches us about maintaining balance.",
    readTime: "5 min read",
  },
  {
    slug: "bhringraj-herb-of-hair",
    category: "Botanical Ingredients",
    title: "Bhringraj: The Ayurvedic Herb of Hair",
    excerpt: "Known as Eclipta alba in Sanskrit texts, Bhringraj has been prized for centuries. We explore why this botanical remains central to our formula.",
    readTime: "4 min read",
  },
  {
    slug: "building-a-hair-oil-ritual",
    category: "Hair Care Rituals",
    title: "Building a Hair Oil Ritual That Works",
    excerpt: "Consistency transforms routine into ritual. Learn how to integrate natural hair oiling into your week in a way that feels effortless and effective.",
    readTime: "6 min read",
  },
];

export default function JournalGrid() {
  return (
    <section aria-labelledby="journal-title" className="py-10 lg:py-28" style={{ background: "var(--ivory)" }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="section-eyebrow mb-4">Journal</p>
            <h2 id="journal-title" className="font-serif" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", color: "var(--charcoal)" }}>
              Botanical Knowledge
            </h2>
          </div>
          <Link href="/journal" className="btn-ghost text-xs flex-shrink-0">
            All Articles <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group p-8 transition-colors hover:bg-ivory-200"
              style={{ background: "#fff" }}
            >
              <span className="text-[10px] tracking-widest uppercase font-sans font-medium" style={{ color: "var(--forest)" }}>
                {article.category}
              </span>
              <h3 className="font-serif text-xl font-medium mt-3 mb-3 leading-snug group-hover:text-forest-500 transition-colors" style={{ color: "var(--charcoal)" }}>
                {article.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-xs font-sans font-medium" style={{ color: "var(--forest)" }}>
                Read Article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
