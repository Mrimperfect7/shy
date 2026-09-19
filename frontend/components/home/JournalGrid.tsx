import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const JEWELLERY_ARTICLES = [
  {
    slug: "pvd-gold-vs-regular-gold-plating",
    category: "Material Science",
    title: "18K PVD Gold vs. Regular Plating: Why It Never Turns Green",
    excerpt: "The metallurgical breakthrough behind waterproof, anti-tarnish everyday jewellery. Discover why vacuum atomic bonding outperforms traditional flash plating.",
    readTime: "4 min read",
  },
  {
    slug: "art-of-everyday-chain-layering",
    category: "Styling Guide",
    title: "The Art of Layering: How to Stack Necklaces Like a Stylist",
    excerpt: "Master the curated neck stack. Graduated chain lengths, contrasting herringbone with pendants, and effortless balance for daily wear.",
    readTime: "5 min read",
  },
  {
    slug: "complete-jewellery-care-guide",
    category: "Jewellery Care",
    title: "How to Keep Your Waterproof Jewellery Gleaming Forever",
    excerpt: "Simple cleaning, storage, and maintenance rituals to preserve your 18K PVD gold and surgical steel pieces in pristine mirror shine.",
    readTime: "3 min read",
  },
];

export default function JournalGrid() {
  return (
    <section aria-labelledby="journal-title" className="py-16 lg:py-28 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mb-3">
              <Sparkles size={12} />
              <span>The SHYN.ISH Journal</span>
            </div>
            <h2
              id="journal-title"
              className="font-serif text-3xl sm:text-4xl text-[#141312] font-normal"
            >
              Styling & Craftsmanship Notes
            </h2>
          </div>
          <Link
            href="/journal"
            className="btn-outline text-xs px-5 py-2.5 flex-shrink-0 inline-flex items-center gap-1.5 hover:bg-[#141312] hover:text-[#FAF8F5] transition-all"
          >
            <span>All Articles</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {JEWELLERY_ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group flex flex-col justify-between p-8 rounded-2xl bg-white border border-[#C5A059]/20 hover:border-[#C5A059]/60 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-sans font-semibold text-[#C5A059]">
                    {article.category}
                  </span>
                  <span className="text-[11px] text-[#5E564F]/70 font-sans">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-normal mb-3 leading-snug text-[#141312] group-hover:text-[#C5A059] transition-colors">
                  {article.title}
                </h3>
                <p className="font-sans text-sm text-[#5E564F] leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-sans font-medium text-[#C5A059] group-hover:translate-x-1 transition-transform">
                <span>Read Story</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
