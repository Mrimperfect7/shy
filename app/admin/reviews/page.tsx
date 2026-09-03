"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Trash2, Star, RefreshCw, Filter } from "lucide-react";

interface Review {
  id: string;
  reviewerName: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  product: { title: string; slug: string };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= rating ? "var(--bronze)" : "none"}
          stroke={s <= rating ? "var(--bronze)" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", text: "#92400e" },
  APPROVED: { bg: "rgba(10,59,18,0.08)", text: "var(--forest)" },
  REJECTED: { bg: "#fef2f2", text: "#dc2626" },
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/reviews${q}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await fetchReviews();
    } finally {
      setProcessing(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setProcessing(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchReviews();
    } finally {
      setProcessing(null);
    }
  };

  const counts = {
    ALL: reviews.length,
    PENDING: reviews.filter((r) => r.status === "PENDING").length,
    APPROVED: reviews.filter((r) => r.status === "APPROVED").length,
    REJECTED: reviews.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>
            Customer Reviews
          </h1>
          <p className="font-sans text-sm text-gray-500">
            Moderate reviews before they appear on the product page.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 font-sans text-sm px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
          style={{ borderColor: "rgba(26,26,26,0.15)", color: "var(--charcoal)" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="font-sans text-xs font-semibold px-4 py-2 rounded-lg transition-colors capitalize"
            style={{
              background: filter === f ? "var(--forest)" : "#fff",
              color: filter === f ? "#fff" : "var(--charcoal)",
              border: "1px solid",
              borderColor: filter === f ? "var(--forest)" : "rgba(26,26,26,0.12)",
            }}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
            {filter !== f && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: "rgba(26,26,26,0.07)" }}
              >
                {/* Show count only on PENDING to highlight action needed */}
                {f === "PENDING" ? counts.PENDING : ""}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: "rgba(26,26,26,0.1)" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 lg:py-20 text-gray-400 font-sans text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-sans text-sm">
            No {filter.toLowerCase()} reviews found.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(26,26,26,0.07)" }}>
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-5 hover:bg-gray-50 transition-colors"
                style={{ opacity: processing === review.id ? 0.5 : 1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: review content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <StarRow rating={review.rating} />
                      <span
                        className="font-sans text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: STATUS_COLOR[review.status]?.bg,
                          color: STATUS_COLOR[review.status]?.text,
                        }}
                      >
                        {review.status}
                      </span>
                      <span className="font-sans text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="font-sans font-semibold text-sm mb-1" style={{ color: "var(--charcoal)" }}>
                      "{review.title}"
                    </p>
                    <p className="font-sans text-sm leading-relaxed text-gray-600 line-clamp-3">
                      {review.body}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-3 font-sans text-xs text-gray-400">
                      <span>
                        <strong style={{ color: "var(--charcoal)" }}>{review.reviewerName}</strong> ·{" "}
                        {review.email}
                      </span>
                      <span>
                        Product:{" "}
                        <strong style={{ color: "var(--forest)" }}>{review.product.title}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {review.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(review.id, "APPROVED")}
                        disabled={!!processing}
                        title="Approve"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-colors hover:opacity-90"
                        style={{ background: "rgba(10,59,18,0.09)", color: "var(--forest)" }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                    {review.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(review.id, "REJECTED")}
                        disabled={!!processing}
                        title="Reject"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-sans text-xs font-semibold transition-colors hover:opacity-90"
                        style={{ background: "#fef2f2", color: "#dc2626" }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      disabled={!!processing}
                      title="Delete permanently"
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
