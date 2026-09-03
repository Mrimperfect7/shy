export default function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="py-12 lg:py-20" style={{ background: "var(--ivory)" }}>
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="section-eyebrow mb-4">OUR STORY</p>
            <h2 id="about-title" className="font-serif mb-6" style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", color: "var(--charcoal)", lineHeight: 1.1 }}>
              ROOTED IN AYURVEDA,<br />CRAFTED WITH PATIENCE.
            </h2>
            <div className="space-y-4 font-sans text-base leading-relaxed text-gray-700">
              <p>
                At Eshara Naturals, we believe the wisdom of Ayurveda has always understood what healthy hair needs. In a world of synthetic chemicals, quick fixes and fast-made products, we choose to return to a more traditional way of caring for our hair.
              </p>
              <p>
                Our journey began with a simple belief: hair care should begin before the damage does. We want to bring back the ritual of nourishing your hair with natural, carefully chosen ingredients and make it simple enough for everyday life.
              </p>
              <p className="font-medium text-charcoal-800">
                Every Eshara blend is made with intention, patience and purpose. Because true care cannot be rushed.
              </p>
              <p>
                We carefully infuse our Ayurvedic herbs into nourishing oils, allowing time for their natural goodness to come through. The result is a traditional hair-care ritual made for the way we live today.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Process steps */}
            {[
              { 
                step: "01", 
                title: "SELECT", 
                desc: "We carefully select natural Ayurvedic herbs and ingredients chosen for their traditional hair-care benefits." 
              },
              { 
                step: "02", 
                title: "BLEND", 
                desc: "Each ingredient is measured thoughtfully and blended in carefully balanced proportions." 
              },
              { 
                step: "03", 
                title: "SLOW INFUSE", 
                desc: "Our carefully selected herbs are slowly infused in nourishing oils for 24 hours, allowing time for their natural goodness to be gently drawn into the oil." 
              },
              { 
                step: "04", 
                title: "BOTTLE", 
                desc: "Made in small batches and bottled with care to preserve freshness and quality." 
              },
              { 
                step: "05", 
                title: "DELIVER", 
                desc: "From our hands to your home bringing the traditional hair-care ritual closer to you." 
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 p-4 rounded-xl bg-white/70 border border-gray-200/70 shadow-sm transition-all hover:bg-white">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--forest)]/10 text-[var(--forest)] font-serif font-bold text-sm">
                  {step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs tracking-widest uppercase font-sans font-bold mb-1 text-[var(--forest)]">{title}</h3>
                  <p className="text-sm font-sans text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
