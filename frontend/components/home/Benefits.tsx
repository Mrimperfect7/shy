import Image from "next/image";

const BENEFITS = [
  { 
    imageSrc: "/images/benefit_nourish.jpg", 
    title: "NOURISH", 
    desc: "A rich Ayurvedic blend that deeply nourishes your hair, leaving every strand softer, healthier and naturally cared for." 
  },
  { 
    imageSrc: "/images/benefit_condition.jpg", 
    title: "CONDITION", 
    desc: "Naturally condition your hair with the goodness of Ayurveda, leaving it softer, smoother and easier to manage." 
  },
  { 
    imageSrc: "/images/benefit_scalp.jpg", 
    title: "SCALP CARE", 
    desc: "Nourish and care for your scalp with a gentle Ayurvedic blend that helps maintain a clean, balanced and healthy-feeling scalp." 
  },
  { 
    imageSrc: "/images/benefit_botanical.jpg", 
    title: "AYURVEDIC CARE", 
    desc: "Carefully selected ayurvedic herbs come together in harmony to nourish your hair and support its natural strength, health and vitality." 
  },
];

export default function Benefits() {
  return (
    <section id="benefits-section" aria-labelledby="benefits-title" className="py-10 lg:py-28" style={{ background: "#fff" }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        
        <div className="flex flex-col mb-10 lg:mb-16">
          <p className="section-eyebrow mb-4">BENEFITS</p>
          <h2 id="benefits-title" className="font-serif leading-tight text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 lg:mb-6" style={{ color: "var(--charcoal)" }}>
            What Your Hair<br />Will Feel Like
          </h2>
          <p className="font-sans text-sm sm:text-base max-w-2xl leading-relaxed text-gray-700">
            Rooted in the wisdom of Ayurveda and made with carefully selected organic ingredients, every Eshara blend is created with a purpose. Together, they nourish your scalp, strengthen your roots, and help restore your hair's natural softness, shine, and vitality.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {BENEFITS.map(({ imageSrc, title, desc }) => (
            <div key={title} className="group flex flex-col rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" style={{ background: "var(--ivory)", border: "1px solid var(--border)" }}>
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                <Image 
                  src={imageSrc} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={title} 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4 lg:p-8 flex-1 flex flex-col">
                <h3 className="text-[10px] lg:text-xs tracking-widest uppercase font-sans font-bold mb-2 lg:mb-3 text-[var(--forest)]">{title}</h3>
                <p className="font-sans text-xs lg:text-sm leading-relaxed text-gray-700 mt-auto">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-[10px] uppercase tracking-wider font-sans mt-12 text-center" style={{ color: "var(--text-muted)" }}>
          * These statements reflect the traditional uses of Ayurvedic botanical ingredients.
        </p>

      </div>
    </section>
  );
}
