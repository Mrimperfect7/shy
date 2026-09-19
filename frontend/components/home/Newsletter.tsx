"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Thank you for joining our botanical community.");
        setEmail("");
      } else {
        const d = await res.json();
        setStatus("error");
        setMessage(d.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="py-8 lg:py-16" style={{ background: "var(--forest)" }}>
      <div className="max-w-2xl mx-auto px-6 lg:px-12 text-center">
        <p className="section-eyebrow justify-center mb-4" style={{ color: "rgba(250,247,242,0.5)" }}>
          Community
        </p>
        <h2 id="newsletter-title" className="font-serif mb-3" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", color: "var(--ivory)", lineHeight: 1.1 }}>
          STAY CLOSE TO NATURE.
        </h2>
        <p className="font-sans text-sm sm:text-base leading-relaxed mb-6" style={{ color: "rgba(250,247,242,0.7)" }}>
          Join us for ayurvedic rituals, new launches and thoughtful hair-care guidance.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <CheckCircle2 size={20} style={{ color: "var(--bronze)" }} />
            <p className="font-sans text-sm" style={{ color: "var(--ivory)" }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              aria-label="Email address"
              className="flex-1 px-4 py-3.5 font-sans text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-white/50 transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 px-6 py-3.5 font-sans text-xs tracking-widest uppercase font-semibold transition-all disabled:opacity-50"
              style={{ background: "var(--bronze)", color: "#fff" }}
            >
              {status === "loading" ? "..." : <>Subscribe <ArrowRight size={13} /></>}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-xs font-sans mt-3" style={{ color: "rgba(250,247,242,0.6)" }}>{message}</p>
        )}

        <p className="text-xs font-sans mt-6" style={{ color: "rgba(250,247,242,0.4)" }}>
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
