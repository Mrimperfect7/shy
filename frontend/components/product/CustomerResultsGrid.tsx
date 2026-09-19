"use client";

import Image from "next/image";

type CustomerResult = {
  id: string;
  imageUrl: string;
  description: string | null;
  displayOrder: number;
};

interface Props {
  results: CustomerResult[];
}

export default function CustomerResultsGrid({ results }: Props) {
  if (!results || results.length === 0) return null;

  return (
    <section className="py-10 lg:py-20 bg-ivory text-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <p className="section-eyebrow text-forest mb-4">Real Customers</p>
          <h2 className="font-serif text-3xl md:text-5xl">Real Results</h2>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {results.map((result) => (
            <div 
              key={result.id} 
              className="group relative flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm snap-center lg:snap-start"
            >
              <Image
                src={result.imageUrl}
                alt={result.description || "Customer result"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 75vw, (max-width: 1024px) 30vw, 22vw"
              />
              {result.description && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm font-sans font-medium">{result.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
