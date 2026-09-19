"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, Search, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/shopify/products";
import type { NormalizedProduct } from "@/lib/shopify/types";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 350);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then(r => r.json())
      .then(d => { setResults(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debounced]);

  return (
    <div className="search-overlay" role="dialog" aria-label="Search" aria-modal="true">
      <div className="max-w-2xl mx-auto px-6 pt-20">
        {/* Close */}
        <button onClick={onClose} aria-label="Close search" className="absolute top-6 right-6 p-2 hover:opacity-60 transition-opacity">
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* Input */}
        <div className="relative">
          <label htmlFor="search-input" className="section-eyebrow mb-6 block">Search Ayurvedic Herbs</label>
          <div className="flex items-center border-b-2" style={{ borderColor: "var(--charcoal)" }}>
            <Search size={20} strokeWidth={1.5} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              id="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for hair oil, ayurvedic herbs..."
              className="flex-1 bg-transparent pl-4 py-4 font-serif text-2xl outline-none placeholder:text-charcoal-200"
              style={{ color: "var(--charcoal)" }}
              aria-label="Search products"
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="p-2 hover:opacity-60 transition-opacity">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mt-8">
          {loading && (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="skeleton w-16 h-16 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && debounced && results.length === 0 && (
            <div className="text-center py-12">
              <Package size={40} strokeWidth={1} style={{ color: "var(--text-muted)", margin: "0 auto 1rem" }} />
              <p className="font-serif text-xl mb-2" style={{ color: "var(--charcoal)" }}>No botanical matches found</p>
              <p className="text-sm font-sans mb-6" style={{ color: "var(--text-muted)" }}>
                Try &ldquo;hair oil&rdquo;, &ldquo;bhringraj&rdquo;, or &ldquo;rosemary&rdquo;
              </p>
              <Link href="/shop" onClick={onClose} className="btn-outline">
                Explore All Products <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="space-y-1">
              {results.map(product => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.handle}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-ivory-200 transition-colors group"
                  >
                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden" style={{ background: "var(--cream)" }}>
                      {product.images[0] ? (
                        <Image src={product.images[0].url} alt={product.images[0].altText || product.title} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ background: "var(--cream)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-medium text-sm truncate" style={{ color: "var(--charcoal)" }}>{product.title}</p>
                      <p className="font-sans text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{formatPrice(product.price, product.currencyCode)}</p>
                    </div>
                    <ArrowRight size={14} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!debounced && (
            <div className="mt-4">
              <p className="text-xs tracking-widest uppercase font-sans mb-4" style={{ color: "var(--text-muted)" }}>Popular</p>
              <div className="flex flex-wrap gap-2">
                {["Hair Oil", "Bhringraj", "Rosemary", "Castor Oil", "Scalp Care"].map(t => (
                  <button key={t} onClick={() => setQuery(t)} className="badge badge-cream font-sans cursor-pointer hover:bg-ivory-300 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
