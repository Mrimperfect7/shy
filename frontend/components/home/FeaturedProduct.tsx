"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Zap, ChevronLeft, ChevronRight, Minus, Plus, Shield, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shopify/products";


export interface FeaturedProductTheme {
  bg: string;
  textHeading: string;
  textBody: string;
  accent: string;
  buttonBg: string;
  buttonText: string;
  eyebrow: string;
  cursiveText: string;
  imageBg: string;
}

const DEFAULT_THEME: FeaturedProductTheme = {
  bg: "var(--forest)",
  textHeading: "var(--cream)",
  textBody: "var(--bg-mint)",
  accent: "var(--bronze)",
  buttonBg: "var(--bronze)",
  buttonText: "var(--forest)",
  eyebrow: "Signature Formula",
  cursiveText: "Deep Nourishment",
  imageBg: "var(--bg-mint)",
};

export default function FeaturedProduct({ 
  product, 
  theme = {} 
}: { 
  product: any;
  theme?: Partial<FeaturedProductTheme>;
}) {
  const activeTheme = { ...DEFAULT_THEME, ...theme };
  const { addItem, isLoading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? product.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  const price = product.price;
  const compareAt = product.compareAtPrice;
  const currency = "INR";
  const isSale = compareAt && parseFloat(compareAt) > parseFloat(price);

  const handleAdd = async () => {
    setAdding(true);
    await addItem(product, quantity);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    setAdding(true);
    await addItem(product, quantity);
    setAdding(false);
    // Cart will open; user clicks checkout from drawer
  };

  return (
    <section aria-labelledby="featured-product-title" className="py-10 lg:py-28 relative overflow-hidden" style={{ background: activeTheme.bg }}>
      {/* Decorative leaf background */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none w-1/2 h-full">
        <Image src="/assets/leaf.jpg" alt="" fill className="object-cover mix-blend-overlay" />
      </div>

      <div className="max-w-8xl mx-auto px-6 lg:px-12 relative z-10">
        <p className="section-eyebrow mb-12" style={{ color: activeTheme.accent }}>{activeTheme.eyebrow}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-tl-[80px] rounded-br-[80px] border border-[var(--border-dark)]" style={{ background: activeTheme.imageBg }}>
              {product.images[activeImage] ? (
                <Image
                  src={product.images[activeImage].url}
                  alt={product.images[activeImage].altText || product.title}
                  fill className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif text-4xl" style={{ color: "var(--text-muted)" }}>EN</span>
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Previous image">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveImage(i => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Next image">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: any, i: number) => (
                  <button key={img.url} onClick={() => setActiveImage(i)}
                    className="flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors"
                    style={{ borderColor: i === activeImage ? "var(--forest)" : "transparent" }}
                    aria-label={`View image ${i + 1}`}>
                    <Image src={img.url} alt={img.altText || ""} width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={activeTheme.accent} stroke="none" />)}
              </div>
              <span className="text-xs font-sans" style={{ color: activeTheme.textBody, opacity: 0.8 }}>4.9 · 124 reviews</span>
            </div>

            <h2 id="featured-product-title" className="font-serif text-4xl lg:text-5xl font-semibold mb-2" style={{ color: activeTheme.textHeading, lineHeight: 1.1 }}>
              {product.title}
            </h2>
            {activeTheme.cursiveText && (
              <div className="cursive-accent mb-6" style={{ color: activeTheme.accent }}>{activeTheme.cursiveText}</div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-sans text-2xl font-semibold" style={{ color: activeTheme.accent }}>
                {formatPrice(price, currency)}
              </span>
              {isSale && compareAt && (
                <span className="font-sans text-lg line-through" style={{ color: activeTheme.textBody, opacity: 0.7 }}>
                  {formatPrice(compareAt, currency)}
                </span>
              )}
              {isSale && <span className="badge badge-bronze">Sale</span>}
            </div>

            <ul className="font-sans text-base leading-relaxed mb-8 space-y-2 list-disc pl-5" style={{ color: activeTheme.textBody }}>
              {product.description?.split(/(?<=[.!?])\s+/).filter(Boolean).map((point: string, idx: number) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>



            {/* Quantity */}
            <div className="mb-8">
              <label className="form-label">Quantity</label>
              <div className="flex items-center border mt-2 w-fit" style={{ borderColor: activeTheme.textBody, opacity: 0.8, color: activeTheme.textHeading }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease" className="w-11 h-11 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-sans text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} aria-label="Increase" className="w-11 h-11 flex items-center justify-center hover:bg-black/10 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={handleAdd} disabled={adding || isLoading || !product.availableForSale}
                className="btn-primary flex-1 justify-center disabled:opacity-50" style={{ background: activeTheme.buttonBg, color: activeTheme.buttonText }}>
                <ShoppingBag size={15} />
                {adding ? "Adding..." : product.availableForSale ? "Add to Cart" : "Sold Out"}
              </button>
              <button onClick={handleBuyNow} disabled={adding || isLoading || !product.availableForSale}
                className="btn-outline flex-1 justify-center disabled:opacity-50" style={{ borderColor: activeTheme.buttonBg, color: activeTheme.buttonBg }}>
                <Zap size={15} />
                Buy Now
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
              {[
                { icon: Truck, text: "Express delivery" },
                { icon: Shield, text: "100% natural ingredients" },
                { icon: RotateCcw, text: "Easy returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-2">
                  <Icon size={18} strokeWidth={1.5} style={{ color: activeTheme.accent }} />
                  <span className="text-xs font-sans" style={{ color: activeTheme.textBody, opacity: 0.9 }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Link href={`/products/${product.handle}`} className="btn-ghost text-xs" style={{ color: activeTheme.accent }}>
                View full product details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
