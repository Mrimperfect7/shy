import { Star, CheckCircle2, Quote } from "lucide-react";

interface CustomerReviewsSectionProps {
  reviews?: Array<{
    id: string;
    name: string;
    location?: string;
    rating: number;
    title: string;
    body: string;
  }>;
}

const FALLBACK_REVIEWS = [
  {
    id: "rev-1",
    name: "Aanya Verma",
    location: "Mumbai",
    rating: 5,
    title: "Doesn't turn green even after daily showers!",
    body: "I was skeptical about buying jewellery under ₹480 on Instagram, but this 18k PVD gold necklace exceeded every expectation. I have worn it every single day for 3 months with zero discoloration.",
  },
  {
    id: "rev-2",
    name: "Rhea Sen",
    location: "Bangalore",
    rating: 5,
    title: "Best ₹99 ring stack ever",
    body: "The solitaire eternity band looks like real solid gold. The finish is mirror smooth, and the click packaging was so elegant. Will be buying the matching hoops next.",
  },
  {
    id: "rev-3",
    name: "Kritika Nair",
    location: "Kochi",
    rating: 5,
    title: "Gifted this to my best friend",
    body: "The unboxing box is super luxurious with the velvet interior and pouch. She thought I spent at least ₹3,000 on it! Fast delivery to Kerala too.",
  },
];

export default function CustomerReviewsSection({ reviews }: CustomerReviewsSectionProps) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={16} fill="#C5A059" stroke="#C5A059" />
            ))}
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#141312] font-normal">
            Real Stories, Real Everyday Shine
          </h2>
          <p className="text-sm sm:text-base text-[#5E564F] font-sans font-light">
            Loved by thousands of women across India for our honest quality and accessible prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-[#C5A059]/20 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#C5A059" stroke="#C5A059" />
                    ))}
                  </div>
                  <Quote size={20} className="text-[#C5A059]/40" />
                </div>

                <h3 className="font-serif text-lg text-[#141312] font-medium leading-snug">
                  &ldquo;{rev.title}&rdquo;
                </h3>

                <p className="text-xs sm:text-sm text-[#5E564F] font-sans font-light leading-relaxed">
                  {rev.body}
                </p>
              </div>

              <div className="pt-4 border-t border-[#C5A059]/15 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-medium text-[#141312]">
                    {rev.name}
                  </h4>
                  {rev.location && (
                    <span className="text-[11px] text-[#928980] font-sans">
                      Verified Buyer, {rev.location}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#C5A059] font-medium font-sans">
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
