"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const DEFAULT_REVIEWS = [
  { id: "1", name: "Priya M.", location: "Bangalore", rating: 5, text: "I&apos;ve been using this oil for 3 months and the difference in my hair texture is remarkable. It absorbs beautifully without feeling greasy. My scalp feels so much healthier.", date: "Verified Purchase" },
  { id: "2", name: "Aisha R.", location: "Hyderabad", rating: 5, text: "The quality is unmatched. You can actually smell the ayurvedic herbs — it&apos;s nothing like the synthetic oils I&apos;ve used before. My hair feels genuinely nourished.", date: "Verified Purchase" },
  { id: "3", name: "Deepa K.", location: "Chennai", rating: 5, text: "Finally a hair oil that lives up to its promises. I love the ritual of warming it between my palms — it&apos;s become my favorite part of the week.", date: "Verified Purchase" },
  { id: "4", name: "Fatima N.", location: "Kochi", rating: 5, text: "From Kerala, so I take my hair oil seriously. Eshara reminds me of the traditional oil my grandmother used to make — but even better. Absolutely love it.", date: "Verified Purchase" },
  { id: "5", name: "Shruti P.", location: "Mumbai", rating: 5, text: "Ordered on a recommendation and immediately re-ordered when I was halfway through my first bottle. The scent is divine and my hair has never felt softer.", date: "Verified Purchase" },
];

export default function Testimonials({ reviews }: { reviews?: any[] }) {
  const [current, setCurrent] = useState(0);

  const displayReviews = reviews && reviews.length > 0 ? reviews : DEFAULT_REVIEWS;

  const prev = () => setCurrent(i => (i - 1 + displayReviews.length) % displayReviews.length);
  const next = () => setCurrent(i => (i + 1) % displayReviews.length);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(i => (i + 1) % displayReviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayReviews.length]);

  const review = displayReviews[current];

  return (
    <section aria-labelledby="reviews-title" className="py-8 lg:py-16" style={{ background: "var(--cream)" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p className="section-eyebrow justify-center mb-4">Reviews</p>
        <h2 id="reviews-title" className="font-serif mb-8" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "var(--charcoal)" }}>
          What Our Community Says
        </h2>

        <div className="relative min-h-[260px]">
          <div key={current} className="animate-fade-in">
            <div className="stars text-2xl mb-6">
              {"★".repeat(review.rating)}
            </div>
            <blockquote className="font-serif text-2xl lg:text-3xl font-medium leading-relaxed mb-8" style={{ color: "var(--charcoal)" }}>
              &ldquo;<span dangerouslySetInnerHTML={{ __html: review.text }} />&rdquo;
            </blockquote>
            <div>
              <p className="font-sans font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{review.name}</p>
              <p className="font-sans text-xs mt-1" style={{ color: "var(--text-muted)" }}>{review.location} · {review.date}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button onClick={prev} aria-label="Previous review" className="w-10 h-10 border flex items-center justify-center hover:bg-ivory-200 transition-colors" style={{ borderColor: "var(--border-dark)" }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2 flex-wrap max-w-[200px] justify-center">
            {displayReviews.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to review ${i + 1}`}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === current ? "var(--forest)" : "var(--border-dark)" }} />
            ))}
          </div>
          <button onClick={next} aria-label="Next review" className="w-10 h-10 border flex items-center justify-center hover:bg-ivory-200 transition-colors" style={{ borderColor: "var(--border-dark)" }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="var(--bronze)" stroke="none" />)}
          </div>
          <span className="font-sans text-sm" style={{ color: "var(--text-secondary)" }}>
            4.9 out of 5 · Based on 124 reviews
          </span>
        </div>
      </div>
    </section>
  );
}
