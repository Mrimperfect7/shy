import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function ShopByConcern() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  const CONCERNS = [
    {
      title: "Hair Oils",
      image: "/assets/collection-hairoil-circle.jpg",
      link: "/products/eshara-natural-hair-oil",
      comingSoon: false,
    },
    {
      title: "Shampoos & Cleansers",
      image: "/assets/collection-shampoo-circle.jpg",
      link: "/collections/shampoo",
      comingSoon: settings ? !settings.shampooLaunched : true,
    },
    {
      title: "Nourishing Skincare",
      image: "/assets/collection-skincare-circle.jpg",
      link: "/collections/skincare",
      comingSoon: settings ? !settings.skincareLaunched : true,
    },
    {
      title: "All Products",
      image: "/assets/collection-combo-circle.jpg",
      link: "/shop",
      comingSoon: false,
    },
  ];

  return (
    <section id="our-collections" className="py-6 sm:py-8 lg:py-16" style={{ background: "var(--bg-mint)" }}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <span className="cursive-accent block mb-1 text-center w-full text-sm sm:text-base">Explore by Category</span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-semibold">
            Our Collections
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-12 max-w-5xl mx-auto">
          {CONCERNS.map((concern, i) => {
            const innerContent = (
              <>
                <div className={`relative w-full aspect-square rounded-full overflow-hidden border-2 sm:border-4 border-[var(--cream)] shadow-md sm:shadow-lg transition-all duration-500 bg-white ${concern.comingSoon ? 'opacity-70 grayscale-[0.3]' : 'group-hover:scale-105 group-hover:border-[var(--bronze)]'}`}>
                  <Image 
                    src={concern.image} 
                    alt={concern.title} 
                    fill 
                    className={`object-cover transition-transform duration-700 ${!concern.comingSoon && 'group-hover:scale-110'}`}
                  />
                  {concern.comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                      <span className="bg-[#0A2612] text-white text-[10px] sm:text-xs font-sans font-medium px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                <h3 className={`font-sans font-medium text-sm sm:text-base lg:text-lg tracking-wider uppercase transition-colors ${concern.comingSoon ? 'text-gray-500' : 'text-[var(--forest)] group-hover:text-[var(--bronze)]'}`}>
                  {concern.title}
                </h3>
              </>
            );

            if (concern.comingSoon) {
              return (
                <div key={i} className="flex flex-col items-center text-center space-y-3 sm:space-y-4 cursor-default">
                  {innerContent}
                </div>
              );
            }

            return (
              <Link 
                href={concern.link} 
                key={i} 
                className="group flex flex-col items-center text-center space-y-3 sm:space-y-4"
              >
                {innerContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
