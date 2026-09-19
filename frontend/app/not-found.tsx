import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center text-center px-6" style={{ background: "var(--ivory)" }}>
      <div className="max-w-xl mx-auto">
        <p className="section-eyebrow justify-center mb-6" style={{ color: "var(--text-muted)" }}>Error 404</p>
        <h1 className="font-serif text-5xl lg:text-7xl mb-6" style={{ color: "var(--charcoal)" }}>Page Not Found</h1>
        <p className="font-sans text-base leading-relaxed mb-10" style={{ color: "var(--text-secondary)" }}>
          The page you are looking for might have been moved or no longer exists. Return to our botanical collections to continue your ritual.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn-primary w-full sm:w-auto justify-center">
            Return Home <ArrowRight size={14} />
          </Link>
          <Link href="/shop" className="btn-outline w-full sm:w-auto justify-center">
            Explore Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
