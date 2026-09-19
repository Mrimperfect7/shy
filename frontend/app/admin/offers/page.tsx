"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Tag, Save, Clock, Leaf, Star, Plus, Trash2, Loader2, CheckCircle2, Upload, ImageIcon } from "lucide-react";
import { uploadOfferImageAction } from "@/app/actions/admin-offer";

/* ─── Types ──────────────────────────────────────────────────────────── */
interface OfferForm {
  label: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  href: string;
  cta: string;
  countdownHours: number;
  items: string[];
  imageUrl: string;
  isActive: boolean;
}

const DEFAULT: OfferForm = {
  label: "Special Launch",
  emoji: "✨",
  title: "18K PVD Gold Herringbone Necklace",
  subtitle: "Everyday Shine Limited Offer",
  description:
    "18K PVD gold plated over 316L stainless steel. Waterproof, anti-tarnish, and hypoallergenic.",
  originalPrice: 799,
  salePrice: 480,
  href: "/products/herringbone-chain-necklace",
  cta: "Shop The Special Deal",
  countdownHours: 48,
  items: [
    "18K PVD Gold Herringbone Chain",
    "Waterproof & Anti-Tarnish Finish",
    "Luxury presentation velvet box",
    "Express delivery across India",
  ],
  imageUrl: "/assets/products/necklace-pendant.jpg",
  isActive: true,
};

function savePct(orig: number, sale: number) {
  if (!orig) return 0;
  return Math.round(((orig - sale) / orig) * 100);
}

/* ─── Live preview card ──────────────────────────────────────────────── */
function OfferPreview({ form }: { form: OfferForm }) {
  const pct = savePct(form.originalPrice, form.salePrice);
  const saved = form.originalPrice - form.salePrice;
  return (
    <div
      className="rounded-2xl overflow-hidden relative shadow-xl"
      style={{
        background: "linear-gradient(130deg, #041707 0%, #0A3B12 45%, #1A4B22 100%)",
        minHeight: 280,
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7">
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,215,0,0.18)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.35)" }}
            >
              {form.emoji} {form.label}
            </span>
            <span
              className="text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Save {pct}%
            </span>
            {!form.isActive && (
              <span
                className="text-[10px] font-sans font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                Paused
              </span>
            )}
          </div>
          <h3 className="font-serif font-bold text-white mb-1" style={{ fontSize: "1.4rem" }}>
            {form.title || "Offer Title"}
          </h3>
          <p className="font-sans text-xs mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
            {form.subtitle}
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif font-bold text-white text-2xl">₹{form.salePrice}</span>
            <span className="font-sans text-sm line-through" style={{ color: "rgba(255,255,255,0.4)" }}>
              ₹{form.originalPrice}
            </span>
            <span className="font-sans text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#FFD700", color: "#2D1A00" }}>
              Save ₹{saved}
            </span>
          </div>
          <ul className="space-y-1 mb-4">
            {form.items.filter(Boolean).map((item, i) => (
              <li key={i} className="flex items-center gap-2 font-sans text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                <Leaf size={11} style={{ color: "#FFD700", flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-bold tracking-wider uppercase"
            style={{ background: "#FFD700", color: "#2D1A00" }}
          >
            {form.cta}
          </div>
        </div>

        {/* Product Image Preview Showcase */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/20 border border-white/10">
          <div className="relative w-36 h-36 mb-2">
            <div className="absolute inset-0 rounded-full bg-[#FFD700]/15 blur-lg" />
            <Image
              src={form.imageUrl || "/assets/products/necklace-pendant.jpg"}
              alt="Offer Product"
              fill
              className="object-contain relative z-10"
              sizes="150px"
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
            <Clock size={11} /> {form.countdownHours}h Countdown Timer
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function AdminOffersPage() {
  const [form, setForm] = useState<OfferForm>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* Load from DB on mount */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/offer-settings");
        const data = await res.json();
        if (data.offer) {
          const o = data.offer;
          setForm({
            label: o.label,
            emoji: o.emoji,
            title: o.title,
            subtitle: o.subtitle,
            description: o.description,
            originalPrice: o.originalPrice,
            salePrice: o.salePrice,
            href: o.href,
            cta: o.cta,
            countdownHours: o.countdownHours,
            items: Array.isArray(o.items) ? o.items : JSON.parse(o.items || "[]"),
            imageUrl: o.imageUrl || "/assets/products/necklace-pendant.jpg",
            isActive: o.isActive,
          });
        }
      } catch (e) {
        setError("Failed to load offer settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (key: keyof OfferForm, val: any) =>
    setForm((f) => ({ ...f, [key]: val }));

  const setItem = (i: number, val: string) =>
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? val : it)) }));

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, ""] }));
  const removeItem = (i: number) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadOfferImageAction(formData);
      if (!res.success || !res.url) {
        throw new Error(res.error || "Failed to upload image");
      }
      set("imageUrl", res.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/offer-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const pct = savePct(form.originalPrice, form.salePrice);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400 font-sans text-sm">
        <Loader2 size={20} className="animate-spin" /> Loading offer settings…
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>
            Offers &amp; Deals
          </h1>
          <p className="font-sans text-sm text-gray-500">
            Edit the home page exclusive offer. Changes save to the database and appear live on the storefront.
          </p>
        </div>
        <button
          id="save-offer-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 font-sans text-sm font-semibold px-6 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex-shrink-0"
          style={{ background: "var(--forest)" }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Saved flash */}
      {saved && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-sans text-sm font-medium"
          style={{ background: "rgba(10,59,18,0.08)", color: "var(--forest)", border: "1px solid rgba(10,59,18,0.15)" }}
        >
          <CheckCircle2 size={15} /> Offer saved! Changes are now live on the storefront.
        </div>
      )}
      {error && (
        <div
          className="px-4 py-3 rounded-xl font-sans text-sm"
          style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
        >
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Sale Price", value: `₹${form.salePrice}`, icon: Tag },
          { label: "Original Price", value: `₹${form.originalPrice}`, icon: Star },
          { label: "Savings", value: `${pct}%`, icon: Leaf },
          { label: "Countdown", value: `${form.countdownHours}h`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border flex items-center gap-3"
            style={{ borderColor: "rgba(26,26,26,0.1)" }}
          >
            <div className="p-2 rounded-lg" style={{ background: "rgba(10,59,18,0.06)", color: "var(--forest)" }}>
              <Icon size={16} />
            </div>
            <div>
              <div className="font-serif text-xl font-bold" style={{ color: "var(--charcoal)" }}>{value}</div>
              <div className="font-sans text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column: form + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form ── */}
        <div
          className="bg-white rounded-xl border p-6 space-y-5"
          style={{ borderColor: "rgba(26,26,26,0.1)" }}
        >
          <h2 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>
            Edit Offer
          </h2>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: form.isActive ? "rgba(10,59,18,0.06)" : "#fef2f2" }}>
            <div>
              <p className="font-sans text-sm font-semibold" style={{ color: "var(--charcoal)" }}>
                {form.isActive ? "🟢 Offer is Live" : "🔴 Offer is Paused"}
              </p>
              <p className="font-sans text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {form.isActive ? "Visible on the home page" : "Hidden from the home page"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className="font-sans text-xs font-semibold px-4 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: form.isActive ? "#ef4444" : "var(--forest)",
                color: form.isActive ? "#ef4444" : "var(--forest)",
              }}
            >
              {form.isActive ? "Pause Offer" : "Activate Offer"}
            </button>
          </div>

          {/* Emoji + Label */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Emoji</label>
              <input
                value={form.emoji}
                onChange={(e) => set("emoji", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none text-center text-xl"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Badge Label</label>
              <input
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Offer Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Subtitle</label>
            <input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none resize-none"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Original ₹</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => set("originalPrice", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Sale Price ₹</label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => set("salePrice", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <div
                className="font-sans text-sm font-bold px-3 py-2.5 rounded-lg text-center"
                style={{ background: "rgba(10,59,18,0.08)", color: "var(--forest)" }}
              >
                Save {pct}%
              </div>
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Countdown (hours)</label>
              <input
                type="number"
                value={form.countdownHours}
                onChange={(e) => set("countdownHours", Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">CTA Button</label>
              <input
                value={form.cta}
                onChange={(e) => set("cta", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none"
                style={{ borderColor: "rgba(26,26,26,0.15)" }}
              />
            </div>
          </div>

          {/* Product link */}
          <div>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Product Link</label>
            <input
              value={form.href}
              onChange={(e) => set("href", e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none font-mono"
              style={{ borderColor: "rgba(26,26,26,0.15)" }}
            />
          </div>

          {/* Included items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-sans text-xs font-semibold uppercase tracking-wider text-gray-500">What's Included</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 font-sans text-xs font-semibold"
                style={{ color: "var(--forest)" }}
              >
                <Plus size={12} /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Leaf size={12} style={{ color: "var(--forest)", flexShrink: 0 }} />
                  <input
                    value={item}
                    onChange={(e) => setItem(i, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 font-sans text-sm focus:outline-none"
                    style={{ borderColor: "rgba(26,26,26,0.15)" }}
                    placeholder="e.g. 18K Gold Plated"
                  />
                  <button type="button" onClick={() => removeItem(i)}>
                    <Trash2 size={13} style={{ color: "#ef4444" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Offer Product Image ── */}
          <div className="border-t pt-5" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
            <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Offer Product Image
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
              {/* Thumbnail preview */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center shrink-0" style={{ borderColor: "rgba(26,26,26,0.15)" }}>
                {form.imageUrl ? (
                  <Image
                    src={form.imageUrl}
                    alt="Offer Preview"
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-semibold border transition-colors hover:bg-gray-50 disabled:opacity-60"
                    style={{ borderColor: "rgba(26,26,26,0.2)", color: "var(--charcoal)" }}
                  >
                    {uploadingImage ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {uploadingImage ? "Uploading…" : "Upload New Image"}
                  </button>

                  <button
                    type="button"
                    onClick={() => set("imageUrl", "/assets/products/necklace-pendant.jpg")}
                    className="px-3 py-2 rounded-lg font-sans text-xs text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="Or paste an image URL (/assets/...) here"
                    className="w-full border rounded-lg px-3 py-1.5 font-sans text-xs focus:outline-none"
                    style={{ borderColor: "rgba(26,26,26,0.15)" }}
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-sans text-gray-400 mr-1">Quick presets:</span>
              {[
                { name: "Necklace", url: "/assets/products/necklace-pendant.jpg" },
                { name: "Ring", url: "/assets/products/ring-solitaire.jpg" },
                { name: "Earrings", url: "/assets/products/earrings-hoop.jpg" },
                { name: "Bracelet", url: "/assets/products/bracelet-chain.jpg" },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => set("imageUrl", preset.url)}
                  className={`text-[11px] font-sans px-2.5 py-1 rounded-md border transition-colors ${
                    form.imageUrl === preset.url
                      ? "bg-forest text-white border-forest"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Save bottom */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ background: "var(--forest)" }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

        {/* ── Live Preview ── */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>
            Live Preview
          </h2>
          <p className="font-sans text-xs text-gray-400">Updates as you type. Click Save to publish.</p>
          <OfferPreview form={form} />
          <p className="font-sans text-xs text-center" style={{ color: "var(--text-muted)" }}>
            This is how the offer card looks on the home page
          </p>
        </div>
      </div>
    </div>
  );
}
