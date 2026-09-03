"use client";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, ThumbsUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

interface Stats {
  avg: number;
  count: number;
  distribution: { star: number; count: number }[];
}

/* ─── Star display helper ────────────────────────────────────────────── */
function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= rating ? "var(--bronze)" : "none"}
          stroke={s <= rating ? "var(--bronze)" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ─── Interactive star picker ────────────────────────────────────────── */
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            fill={(hovered || value) >= s ? "var(--bronze)" : "none"}
            stroke={(hovered || value) >= s ? "var(--bronze)" : "#d1d5db"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Rating bar ─────────────────────────────────────────────────────── */
function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-sans text-xs w-4 text-right flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {star}
      </span>
      <Star size={11} fill="var(--bronze)" stroke="none" className="flex-shrink-0" />
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(10,59,18,0.1)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "var(--bronze)" }}
        />
      </div>
      <span
        className="font-sans text-xs w-6 text-right flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {count}
      </span>
    </div>
  );
}

/* ─── Review card ────────────────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const TRUNCATE = 200;
  const long = review.body.length > TRUNCATE;

  return (
    <div
      className="rounded-2xl p-6 transition-all duration-200 hover:shadow-md"
      style={{
        background: "#fff",
        border: "1px solid rgba(10,59,18,0.1)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <StarRow rating={review.rating} size={13} />
      <h4
        className="font-sans font-bold text-sm mt-3 mb-2"
        style={{ color: "var(--charcoal)" }}
      >
        "{review.title}"
      </h4>
      <p className="font-sans text-sm leading-relaxed" style={{ color: "#6b7280" }}>
        {!expanded && long ? review.body.slice(0, TRUNCATE) + "…" : review.body}
      </p>
      {long && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 font-sans text-xs font-medium mt-2"
          style={{ color: "var(--forest)" }}
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={12} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={12} />
            </>
          )}
        </button>
      )}
      <div
        className="flex items-center gap-2 mt-4 pt-4 text-xs font-sans font-medium"
        style={{ color: "#9ca3af", borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        <CheckCircle2 size={13} style={{ color: "var(--forest)" }} />
        {review.reviewerName} · Verified Buyer ·{" "}
        {new Date(review.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })}
      </div>
    </div>
  );
}

/* ─── Write review form ──────────────────────────────────────────────── */
function WriteReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    reviewerName: "",
    email: "",
    rating: 0,
    title: "",
    reviewBody: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.rating) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star picker */}
      <div>
        <label
          className="block font-sans text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--charcoal)" }}
        >
          Your Rating <span style={{ color: "var(--earth)" }}>*</span>
        </label>
        <StarPicker value={form.rating} onChange={(n) => set("rating", n)} />
      </div>

      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block font-sans text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--charcoal)" }}
          >
            Name <span style={{ color: "var(--earth)" }}>*</span>
          </label>
          <input
            type="text"
            required
            value={form.reviewerName}
            onChange={(e) => set("reviewerName", e.target.value)}
            placeholder="e.g. Anjali S."
            className="w-full rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              border: "1px solid rgba(10,59,18,0.15)",
              background: "#fafafa",
            }}
          />
        </div>
        <div>
          <label
            className="block font-sans text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--charcoal)" }}
          >
            Email <span style={{ color: "var(--earth)" }}>*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              border: "1px solid rgba(10,59,18,0.15)",
              background: "#fafafa",
            }}
          />
          <p className="font-sans text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
            Not published publicly
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          className="block font-sans text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--charcoal)" }}
        >
          Review Title <span style={{ color: "var(--earth)" }}>*</span>
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Transformed my hair!"
          className="w-full rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 transition-shadow"
          style={{
            border: "1px solid rgba(10,59,18,0.15)",
            background: "#fafafa",
          }}
        />
      </div>

      {/* Body */}
      <div>
        <label
          className="block font-sans text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "var(--charcoal)" }}
        >
          Your Review <span style={{ color: "var(--earth)" }}>*</span>
        </label>
        <textarea
          required
          rows={4}
          value={form.reviewBody}
          onChange={(e) => set("reviewBody", e.target.value)}
          placeholder="Tell us about your experience with this product..."
          className="w-full rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 transition-shadow resize-none"
          style={{
            border: "1px solid rgba(10,59,18,0.15)",
            background: "#fafafa",
          }}
        />
        <p className="font-sans text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
          Minimum 20 characters. Reviews are moderated and appear within 24 hours.
        </p>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-xl font-sans text-sm"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        id="submit-review-btn"
        disabled={submitting}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-60"
        style={{ background: "var(--forest)", color: "#fff" }}
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

/* ─── Main section ───────────────────────────────────────────────────── */
export default function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ avg: 0, count: 0, distribution: [] });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { avg: 0, count: 0, distribution: [] });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const paginated = sorted.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < sorted.length;

  const handleSuccess = () => {
    setSubmitted(true);
    setShowForm(false);
  };

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="py-10 lg:py-28"
      style={{ background: "var(--ivory)" }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="section-eyebrow mb-3">Customer Reviews</p>
            <h2
              id="reviews-title"
              className="font-serif"
              style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", color: "var(--charcoal)" }}
            >
              Real Results, Real People
            </h2>
          </div>
          {!showForm && !submitted && (
            <button
              id="write-review-btn"
              onClick={() => setShowForm(true)}
              className="flex-shrink-0 px-6 py-3 rounded-xl font-sans text-sm font-semibold tracking-wider uppercase transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{
                background: "var(--forest)",
                color: "#fff",
              }}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Success toast */}
        {submitted && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-10 font-sans text-sm"
            style={{
              background: "rgba(10,59,18,0.07)",
              border: "1px solid rgba(10,59,18,0.15)",
              color: "var(--forest)",
            }}
          >
            <CheckCircle2 size={18} />
            <div>
              <p className="font-semibold">Thank you for your review!</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                It will appear here after moderation (usually within 24 hours).
              </p>
            </div>
          </div>
        )}

        {/* Stats + form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Summary card */}
          <div
            className="rounded-2xl p-7 flex flex-col"
            style={{
              background: "#fff",
              border: "1px solid rgba(10,59,18,0.1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-28">
                <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
              </div>
            ) : stats.count === 0 ? (
              <div className="text-center py-6">
                <ThumbsUp size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
                <p className="font-sans text-sm" style={{ color: "var(--text-muted)" }}>
                  No reviews yet.
                  <br />
                  Be the first!
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div
                    className="font-serif font-bold"
                    style={{ fontSize: "3.5rem", lineHeight: 1, color: "var(--charcoal)" }}
                  >
                    {stats.avg}
                  </div>
                  <StarRow rating={Math.round(stats.avg)} size={18} />
                  <p className="font-sans text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    Based on {stats.count} review{stats.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-2">
                  {stats.distribution.map((d) => (
                    <RatingBar key={d.star} star={d.star} count={d.count} total={stats.count} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Write review panel */}
          <div
            className="lg:col-span-2 rounded-2xl p-7"
            style={{
              background: "#fff",
              border: "1px solid rgba(10,59,18,0.1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            {showForm ? (
              <>
                <h3
                  className="font-serif text-xl mb-6"
                  style={{ color: "var(--charcoal)" }}
                >
                  Share Your Experience
                </h3>
                <WriteReviewForm productId={productId} onSuccess={handleSuccess} />
                <button
                  onClick={() => setShowForm(false)}
                  className="mt-4 font-sans text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← Cancel
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(10,59,18,0.07)" }}
                >
                  <Star size={26} style={{ color: "var(--forest)" }} />
                </div>
                <h3
                  className="font-serif text-xl mb-2"
                  style={{ color: "var(--charcoal)" }}
                >
                  Loved it? Tell others.
                </h3>
                <p className="font-sans text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
                  Your honest review helps others discover what works. It takes less than 2 minutes.
                </p>
                {!submitted && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-6 px-7 py-3 rounded-xl font-sans text-sm font-semibold tracking-wider uppercase transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "var(--forest)", color: "#fff" }}
                  >
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews list */}
        {!loading && reviews.length > 0 && (
          <>
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-sm" style={{ color: "var(--text-muted)" }}>
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs" style={{ color: "var(--text-muted)" }}>
                  Sort:
                </span>
                {(["newest", "highest", "lowest"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setPage(1); }}
                    className="font-sans text-xs px-3 py-1.5 rounded-lg capitalize transition-colors"
                    style={{
                      background: sortBy === opt ? "var(--forest)" : "transparent",
                      color: sortBy === opt ? "#fff" : "var(--text-muted)",
                      border: "1px solid",
                      borderColor: sortBy === opt ? "var(--forest)" : "rgba(10,59,18,0.15)",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 rounded-xl font-sans text-sm font-semibold uppercase tracking-wider transition-all hover:opacity-90"
                  style={{
                    border: "1.5px solid var(--forest)",
                    color: "var(--forest)",
                  }}
                >
                  Load More Reviews
                </button>
              </div>
            )}
          </>
        )}

        {!loading && reviews.length === 0 && !showForm && (
          <div
            className="text-center py-14 rounded-2xl font-sans text-sm border-2 border-dashed"
            style={{ borderColor: "rgba(10,59,18,0.15)", color: "var(--text-muted)" }}
          >
            No reviews yet. Be the first to share your experience!
          </div>
        )}
      </div>
    </section>
  );
}
