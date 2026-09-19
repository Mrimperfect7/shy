import { Leaf, FlaskConical, PackageCheck, MapPin } from "lucide-react";

const ITEMS = [
  { icon: Leaf, label: "100% Natural" },
  { icon: FlaskConical, label: "Ayurvedic Herbs" },
  { icon: PackageCheck, label: "Safely Crafted" },
  { icon: MapPin, label: "Made in Kerala" },
];

export default function TrustStrip() {
  return (
    <div className="trust-strip py-5">
      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-3 py-2">
              <Icon size={16} strokeWidth={1.5} style={{ color: "var(--forest-light)", flexShrink: 0 }} />
              <span className="text-xs tracking-widest uppercase font-sans font-medium" style={{ color: "var(--charcoal)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
