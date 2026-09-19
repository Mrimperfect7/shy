"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Check, Plus, ShoppingBag, Watch } from "lucide-react";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls?: string[];
  images?: { url: string; altText: string }[];
  material?: string;
  handle?: string;
  slug?: string;
}

interface WatchBuilderProps {
  watches: Product[];
  bracelets: Product[];
}

export default function WatchBuilder({ watches, bracelets }: WatchBuilderProps) {
  const { addItem } = useCartStore();
  const [selectedWatch, setSelectedWatch] = useState<Product | null>(watches.length > 0 ? watches[0] : null);
  const [selectedBracelets, setSelectedBracelets] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const toggleBracelet = (bracelet: Product) => {
    setSelectedBracelets((prev) => {
      const isSelected = prev.find((b) => b.id === bracelet.id);
      if (isSelected) {
        return prev.filter((b) => b.id !== bracelet.id);
      } else {
        return [...prev, bracelet];
      }
    });
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    if (selectedWatch) total += typeof selectedWatch.price === 'number' ? selectedWatch.price : parseFloat(selectedWatch.price as any || "0");
    selectedBracelets.forEach((b) => {
      total += typeof b.price === 'number' ? b.price : parseFloat(b.price as any || "0");
    });
    return total;
  }, [selectedWatch, selectedBracelets]);

  const handleAddToCart = () => {
    if (!selectedWatch) {
      toast.error("Please select a watch first.");
      return;
    }

    setIsAdding(true);

    // Add Watch
    const watchImg = selectedWatch.imageUrls?.[0] || selectedWatch.images?.[0]?.url || "/assets/products/necklace-pendant.jpg";
    addItem({
      id: selectedWatch.id || selectedWatch.slug || selectedWatch.handle || "",
      title: selectedWatch.title,
      price: typeof selectedWatch.price === 'number' ? selectedWatch.price : parseFloat(selectedWatch.price as any || "0"),
      image: watchImg,
      imageUrl: watchImg,
      quantity: 1,
      variantTitle: selectedWatch.material || "Watch Base",
    });

    // Add Bracelets
    selectedBracelets.forEach((bracelet) => {
      const braceletImg = bracelet.imageUrls?.[0] || bracelet.images?.[0]?.url || "/assets/products/rings-stack.jpg";
      addItem({
        id: bracelet.id || bracelet.slug || bracelet.handle || "",
        title: bracelet.title,
        price: typeof bracelet.price === 'number' ? bracelet.price : parseFloat(bracelet.price as any || "0"),
        image: braceletImg,
        imageUrl: braceletImg,
        quantity: 1,
        variantTitle: "Matching Bracelet",
      });
    });

    toast.success("Added Custom Watch Set to bag! ✨", {
      style: {
        background: "#141312",
        color: "#FAF8F5",
        border: "1px solid #C5A059",
      },
    });

    setIsAdding(false);
  };

  const watchImageUrl = selectedWatch?.imageUrls?.[0] || selectedWatch?.images?.[0]?.url || "/assets/products/necklace-pendant.jpg";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-20">
      
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl md:text-5xl text-[#141312] mb-4">Build Your Perfect Set</h1>
        <p className="font-sans text-[#5E564F] max-w-2xl mx-auto">
          Select a watch base and pair it with our matching 18K PVD Gold plated bracelets for a complete stacked look.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left Side: Preview (Sticky) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-xl border border-[#C5A059]/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-bl-full -z-10" />
            
            <h2 className="font-serif text-2xl text-[#141312] mb-6 flex items-center gap-2">
              <Watch className="text-[#C5A059]" />
              Your Custom Set
            </h2>

            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#FAF8F5] mb-6 border border-gray-100 group">
              {selectedWatch ? (
                <Image
                  src={watchImageUrl}
                  alt={selectedWatch.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  Select a watch to preview
                </div>
              )}

              {/* Bracelet overlay thumbnails (just for visual flair in preview) */}
              {selectedBracelets.length > 0 && (
                <div className="absolute bottom-4 right-4 flex -space-x-4">
                  {selectedBracelets.map((b, i) => {
                    const bImg = b.imageUrls?.[0] || b.images?.[0]?.url || "/assets/products/rings-stack.jpg";
                    return (
                      <div key={b.id} className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white z-10" style={{ zIndex: selectedBracelets.length - i }}>
                        <Image src={bImg} alt={b.title} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-sans font-semibold text-[#141312]">{selectedWatch?.title || "No watch selected"}</h3>
                  <p className="text-xs text-[#5E564F]">Base Watch</p>
                </div>
                <span className="font-serif font-medium">₹{selectedWatch?.price || 0}</span>
              </div>

              {selectedBracelets.map(b => (
                <div key={b.id} className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="font-sans font-semibold text-[#141312]">{b.title}</h3>
                    <p className="text-xs text-[#5E564F]">Matching Bracelet</p>
                  </div>
                  <span className="font-serif font-medium">₹{b.price}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-2">
              <div className="flex justify-between items-end mb-6">
                <span className="font-sans text-sm text-[#5E564F] uppercase tracking-wider">Total Set Price</span>
                <span className="font-serif text-3xl text-[#141312] font-semibold">₹{totalPrice}</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedWatch}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#141312] to-[#242220] text-[#FAF8F5] font-sans font-semibold tracking-wide shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {isAdding ? "Adding..." : "Add Set to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Steps */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Step 1: Watch */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#141312] text-white flex items-center justify-center font-serif text-sm">1</div>
              <h3 className="font-serif text-2xl text-[#141312]">Choose Your Watch</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {watches.map(watch => {
                const isSelected = selectedWatch?.id === watch.id;
                const img = watch.imageUrls?.[0] || watch.images?.[0]?.url || "/assets/products/necklace-pendant.jpg";
                
                return (
                  <div 
                    key={watch.id}
                    onClick={() => setSelectedWatch(watch)}
                    className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden ${
                      isSelected ? "border-[#C5A059] bg-[#C5A059]/5 shadow-md" : "border-gray-200 bg-white hover:border-[#C5A059]/50"
                    }`}
                  >
                    <div className="aspect-[4/5] relative w-full bg-gray-50">
                      <Image src={img} alt={watch.title} fill className="object-cover" />
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#C5A059] text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-sans font-semibold text-[#141312] text-sm mb-1 truncate">{watch.title}</h4>
                      <p className="font-serif text-[#C5A059]">₹{watch.price}</p>
                    </div>
                  </div>
                );
              })}
              {watches.length === 0 && (
                <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
                  No watches available currently.
                </div>
              )}
            </div>
          </section>

          {/* Step 2: Bracelets */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#141312] text-white flex items-center justify-center font-serif text-sm">2</div>
              <h3 className="font-serif text-2xl text-[#141312]">Select Matching Bracelets</h3>
            </div>
            
            <div className="space-y-4">
              {bracelets.map(bracelet => {
                const isSelected = selectedBracelets.some(b => b.id === bracelet.id);
                const img = bracelet.imageUrls?.[0] || bracelet.images?.[0]?.url || "/assets/products/rings-stack.jpg";
                
                return (
                  <div 
                    key={bracelet.id}
                    onClick={() => toggleBracelet(bracelet)}
                    className={`cursor-pointer flex items-center p-3 rounded-2xl border-2 transition-all ${
                      isSelected ? "border-[#C5A059] bg-[#C5A059]/5 shadow-sm" : "border-gray-200 bg-white hover:border-[#C5A059]/30"
                    }`}
                  >
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={img} alt={bracelet.title} fill className="object-cover" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-sans font-semibold text-[#141312]">{bracelet.title}</h4>
                      <p className="text-xs text-[#5E564F] mt-1">{bracelet.material || "18K PVD Gold"}</p>
                      <p className="font-serif text-[#C5A059] mt-1">₹{bracelet.price}</p>
                    </div>
                    <div className="pr-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                        isSelected ? "bg-[#C5A059] border-[#C5A059] text-white" : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              {bracelets.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
                  No matching bracelets found.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
