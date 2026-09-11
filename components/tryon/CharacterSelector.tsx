"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Check, User, Heart } from "lucide-react";
import { AICharacter, JewelryCategory } from "@/lib/tryon/types";
import { AI_CHARACTERS, getRecommendedCharacters } from "@/lib/tryon/characters";

interface CharacterSelectorProps {
  category: JewelryCategory;
  selectedCharacterId: string;
  onSelectCharacter: (character: AICharacter) => void;
  onConfirmTryOn: () => void;
  disabled?: boolean;
}

export default function CharacterSelector({
  category,
  selectedCharacterId,
  onSelectCharacter,
  onConfirmTryOn,
  disabled = false,
}: CharacterSelectorProps) {
  const [filter, setFilter] = useState<"all" | "recommended" | "female" | "male">("recommended");

  const characters = getRecommendedCharacters(category);
  const filteredCharacters = characters.filter((c) => {
    if (filter === "recommended") return c.recommendedFor.includes(category);
    if (filter === "female") return c.gender === "female";
    if (filter === "male") return c.gender === "male";
    return true;
  });

  const activeChar = characters.find((c) => c.id === selectedCharacterId) || characters[0];

  return (
    <div className="space-y-6">
      {/* Category Hint & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C5A059]/20 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-sans font-medium text-[#C5A059]">
            Step 1 · Choose Your AI Model
          </p>
          <h3 className="font-serif text-lg sm:text-xl text-[#141312]">
            Select a realistic character to preview this piece
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-full border border-[#C5A059]/25 text-xs font-sans">
          <button
            type="button"
            onClick={() => setFilter("recommended")}
            className={`px-3 py-1 rounded-full transition-all text-[11px] font-medium ${
              filter === "recommended"
                ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                : "text-[#5E564F] hover:text-[#141312]"
            }`}
          >
            Recommended
          </button>
          <button
            type="button"
            onClick={() => setFilter("female")}
            className={`px-3 py-1 rounded-full transition-all text-[11px] font-medium ${
              filter === "female"
                ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                : "text-[#5E564F] hover:text-[#141312]"
            }`}
          >
            Women
          </button>
          <button
            type="button"
            onClick={() => setFilter("male")}
            className={`px-3 py-1 rounded-full transition-all text-[11px] font-medium ${
              filter === "male"
                ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                : "text-[#5E564F] hover:text-[#141312]"
            }`}
          >
            Men
          </button>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full transition-all text-[11px] font-medium ${
              filter === "all"
                ? "bg-[#141312] text-[#FAF8F5] shadow-xs"
                : "text-[#5E564F] hover:text-[#141312]"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Grid of Characters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {filteredCharacters.map((char) => {
          const isSelected = char.id === selectedCharacterId;
          const isRecommended = char.recommendedFor.includes(category);

          return (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 bg-[#EAE6DF] ${
                isSelected
                  ? "border-[#C5A059] shadow-lg ring-2 ring-[#C5A059]/30 scale-[1.02]"
                  : "border-transparent hover:border-[#C5A059]/50 hover:shadow-md"
              }`}
            >
              {/* Aspect Ratio Container for Portrait */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={char.previewUrl}
                  alt={char.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 160px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#C5A059] text-[#141312] flex items-center justify-center shadow-md animate-in fade-in zoom-in-75">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                {/* Recommended Badge */}
                {isRecommended && !isSelected && (
                  <div className="absolute top-2 left-2 bg-[#141312]/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-[#C5A059]/40 text-[9px] font-sans font-medium text-[#FAF8F5]">
                    Best Fit
                  </div>
                )}

                {/* Character Metadata Overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-sm font-semibold tracking-wide">{char.name}</p>
                    <span className="text-[9px] uppercase tracking-wider font-sans text-[#E8CA82]">
                      {char.faceShape}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 font-sans truncate">{char.skinTone}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Model Confirmation Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 p-4 rounded-2xl border border-[#C5A059]/25">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#C5A059] shadow-xs flex-shrink-0">
            <Image
              src={activeChar.previewUrl}
              alt={activeChar.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-sans text-[#5E564F]">
              Selected Model: <strong className="text-[#141312]">{activeChar.name}</strong> ({activeChar.skinTone} · {activeChar.faceShape})
            </p>
            <p className="text-[11px] text-[#7A726A] font-sans">
              Jewelry will be placed at realistic scale and lighting on {activeChar.name}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirmTryOn}
          disabled={disabled}
          className="btn-gold px-8 py-3.5 text-xs font-semibold shadow-md hover:shadow-xl transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Sparkles size={15} />
          <span>Try On {activeChar.name}</span>
        </button>
      </div>
    </div>
  );
}
