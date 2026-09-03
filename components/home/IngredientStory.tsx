"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const INGREDIENTS = [
  {
    number: "01",
    name: "Pure Coconut Oil",
    category: "DEEP-NOURISHING BASE OIL",
    headline: "Traditionally used in Indian hair care to deeply nourish and condition hair, helping reduce dryness and leaving strands soft and smooth.",
    description: "Traditionally used in Indian hair care, coconut oil deeply nourishes and conditions the hair, helping reduce dryness and leaving strands soft, smooth and manageable.",
    benefit: "Helps nourish, soften & protect hair",
    bg: "#E2DFD2",
    image: "/assets/coconut.png",
  },
  {
    number: "02",
    name: "Castor Oil",
    category: "INTENSIVE CONDITIONING OIL",
    headline: "Naturally rich and deeply conditioning, helping nourish dry-feeling hair and supporting softer, stronger-feeling strands.",
    description: "Naturally rich and deeply conditioning, castor oil helps nourish dry-feeling hair and supports softer, stronger-feeling strands while adding richness to the blend.",
    benefit: "Helps condition & nourish hair",
    bg: "#E8D9CC",
    image: "/assets/castor.png",
  },
  {
    number: "03",
    name: "Amla",
    category: "AYURVEDIC HAIR-NOURISHING HERB",
    headline: "A cherished Ayurvedic ingredient used in traditional hair-care rituals to nourish the scalp and support healthier-looking hair.",
    description: "A cherished Ayurvedic ingredient, Amla has long been used in traditional hair-care rituals. It helps nourish the scalp and supports stronger, healthier-looking hair.",
    benefit: "Nourishes the scalp & supports healthy-looking hair",
    bg: "#C9D1C7",
    image: "/assets/amla.PNG",
  },
  {
    number: "04",
    name: "Rosemary",
    category: "SCALP-REVIVING HERB",
    headline: "Known for its refreshing and invigorating qualities, rosemary brings a revitalising touch to the scalp while supporting a fresh, healthy-feeling hair ritual.",
    description: "Known for its refreshing and invigorating qualities, rosemary brings a revitalising touch to the scalp while supporting a fresh, healthy-feeling hair-care ritual.",
    benefit: "Refreshes the scalp & supports healthy-looking hair",
    bg: "#DCE1D5",
    image: "/assets/rosemary.png",
  },
  {
    number: "05",
    name: "Hibiscus",
    category: "NATURAL HAIR CONDITIONER",
    headline: "A traditional favourite in Indian hair care that helps condition and soften the hair, leaving strands smoother and naturally cared for.",
    description: "A traditional favourite in Indian hair care, hibiscus helps condition and soften the hair, leaving strands smoother, more manageable and naturally cared for.",
    benefit: "Helps soften, condition & improve hair feel",
    bg: "#E4D2D4",
    image: "/assets/hibiscus.PNG",
  },
  {
    number: "06",
    name: "Tulasi",
    category: "SCALP-PURIFYING HERB",
    headline: "Also known as Holy Basil, Tulasi's naturally purifying qualities help support a fresh, clean and balanced-feeling scalp.",
    description: "Also known as Holy Basil, Tulasi has a long history in Ayurveda. Its naturally purifying qualities help support a fresh, clean and balanced-feeling scalp.",
    benefit: "Helps maintain a fresh, balanced-feeling scalp",
    bg: "#D5DED3",
    image: "/assets/tulasi.png",
  },
  {
    number: "07",
    name: "Black Cumin",
    category: "SCALP-NOURISHING SEED OIL",
    headline: "Traditionally valued for its nourishing qualities, helping condition hair and supporting a nourished, healthy-feeling scalp.",
    description: "Traditionally valued for its nourishing qualities, black cumin helps condition the hair and supports a nourished, healthy-feeling scalp.",
    benefit: "Nourishes and conditions the scalp & hair",
    bg: "#DCD7CE",
    image: "/assets/black-cumin.png",
  },
  {
    number: "08",
    name: "Aloe Vera",
    category: "SOOTHING & HYDRATING HERB",
    headline: "Naturally soothing and hydrating, Aloe Vera helps refresh the scalp while leaving hair feeling soft, smooth and conditioned.",
    description: "Naturally soothing and hydrating, Aloe Vera helps refresh the scalp while leaving the hair feeling soft, smooth and conditioned.",
    benefit: "Helps hydrate, soothe & refresh the scalp",
    bg: "#D3E2D8",
    image: "/assets/aloe.PNG",
  },
  {
    number: "09",
    name: "Bhringraj",
    category: "AYURVEDIC HAIR-NOURISHING HERB",
    headline: "A treasured herb in traditional Ayurvedic hair care valued for its nourishing and conditioning properties to care for the scalp.",
    description: "A treasured herb in traditional Ayurvedic hair care, Bhringraj is valued for its nourishing and conditioning properties. It helps care for the scalp, strengthen the feel of the hair and support healthier-looking, well-nourished strands.",
    benefit: "Nourishes the scalp & supports stronger, healthier-looking hair",
    bg: "#CBD7CF",
    image: "/assets/bhringraj.png",
  },
];

export default function IngredientStory() {
  return (
    <section id="ingredients" aria-labelledby="ingredients-title">
      <div className="max-w-8xl mx-auto px-6 lg:px-12 pt-20 pb-6">
        <p className="section-eyebrow mb-4">THE FORMULA</p>
        <h2 id="ingredients-title" className="font-serif" style={{ fontSize: "clamp(2rem,4vw,3.5rem)", color: "var(--charcoal)" }}>
          Ayurvedic Herbs.<br />Each With a Purpose.
        </h2>
      </div>

      {/* Desktop: sticky scroll panels */}
      <div className="hidden lg:block">
        {INGREDIENTS.map((ing, i) => (
          <IngredientPanel key={ing.number} ingredient={ing} index={i} />
        ))}
      </div>

      {/* Mobile: vertical accordion */}
      <div className="lg:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {INGREDIENTS.map((ing) => (
          <MobileIngredient key={ing.number} ingredient={ing} />
        ))}
      </div>

      <div className="max-w-8xl mx-auto px-6 lg:px-12 py-12">
        <div className="p-6 md:p-8 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--cream)" }}>
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-[var(--forest)] block mb-2">
            PLUS 12 MORE
          </span>
          <p className="font-sans text-sm md:text-base leading-relaxed" style={{ color: "var(--charcoal)" }}>
            12 more carefully selected Ayurvedic herbs and natural ingredients, each chosen for its role in the Eshara hair-care ritual.
          </p>
        </div>
      </div>
    </section>
  );
}

function IngredientPanel({ ingredient, index }: { ingredient: typeof INGREDIENTS[0]; index: number }) {
  return (
    <div
      className="ingredient-panel py-12 lg:py-24"
      style={{ background: ingredient.bg }}
    >
      <div className="max-w-8xl mx-auto px-12 grid grid-cols-3 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--forest)" }} />
            <span className="text-xs tracking-widest uppercase font-sans" style={{ color: "var(--forest)" }}>{ingredient.category}</span>
          </div>
          <p className="font-serif text-3xl font-medium leading-snug mb-6" style={{ color: "var(--charcoal)" }}>
            {ingredient.headline}
          </p>
        </div>

        {/* Center - large number and transparent botanical image */}
        <div className="flex items-center justify-center relative min-h-[300px]">
          <div className="text-center relative z-10">
            <div className="font-serif font-bold select-none" style={{ fontSize: "clamp(6rem,12vw,14rem)", lineHeight: 1, color: "rgba(44,44,44,0.08)", letterSpacing: "-0.05em" }}>
              {ingredient.number}
            </div>
            <h3 className="font-serif text-4xl font-semibold -mt-8 relative z-20" style={{ color: "var(--charcoal)" }}>{ingredient.name}</h3>
          </div>
          {ingredient.image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 scale-125 drop-shadow-sm">
              <Image src={ingredient.image} alt={ingredient.name} width={380} height={380} className="object-contain" />
            </div>
          )}
        </div>

        {/* Right */}
        <div>
          <div className="mb-6 space-y-1">
            <div className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>Type: <span style={{ color: "var(--charcoal)" }}>Botanical</span></div>
            <div className="text-xs font-sans" style={{ color: "var(--text-muted)" }}>Benefit: <span style={{ color: "var(--charcoal)" }}>{ingredient.benefit}</span></div>
          </div>
          <h4 className="font-sans font-semibold text-sm mb-3" style={{ color: "var(--charcoal)" }}>{ingredient.name} Integration</h4>
          <p className="font-sans text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ingredient.description}</p>
        </div>
      </div>
    </div>
  );
}

function MobileIngredient({ ingredient }: { ingredient: typeof INGREDIENTS[0] }) {
  return (
    <div className="px-5 py-7 relative overflow-hidden" style={{ background: ingredient.bg }}>
      {/* Header row: category + image thumbnail */}
      <div className="flex items-center justify-between gap-3 mb-4 relative z-10">
        <span className="text-[10px] tracking-widest uppercase font-sans font-semibold" style={{ color: "var(--forest)" }}>
          {ingredient.category}
        </span>
        {ingredient.image && (
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white/60 shadow-sm relative bg-white/40 flex items-center justify-center">
            <Image src={ingredient.image} alt={ingredient.name} fill className="object-contain p-1" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-serif text-2xl font-semibold mb-3 relative z-10" style={{ color: "var(--charcoal)" }}>
        {ingredient.name}
      </h3>

      {/* Description below name */}
      <p className="font-sans text-sm leading-relaxed relative z-10" style={{ color: "var(--text-secondary)" }}>
        {ingredient.description}
      </p>

      {/* Benefit tag */}
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-sans font-medium relative z-10 bg-white/40 rounded-full px-3 py-1.5" style={{ color: "var(--forest)" }}>
        <span>✓</span>
        <span>{ingredient.benefit}</span>
      </div>
    </div>
  );
}
