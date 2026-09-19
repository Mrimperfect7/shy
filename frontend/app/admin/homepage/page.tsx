"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sparkles, Save, Shield, MessageCircle, Truck, Package, RefreshCw } from "lucide-react";

export default function AdminHomepageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  const [heroTitle, setHeroTitle] = useState("EVERYDAY SHINE. EFFORTLESS STYLE.");
  const [heroSubtitle, setHeroSubtitle] = useState("Jewellery crafted for modern femininity. 18K PVD gold plated & 316/304 stainless steel pieces designed to make you sparkle every day.");
  const [giftingTitle, setGiftingTitle] = useState("Wrapped to make hearts flutter.");
  const [giftingDesc, setGiftingDesc] = useState("Every SHYN.ISH piece comes wrapped in our signature matte black gift box with gold foil embossing, soft velvet interior, and a handwritten-style note.");

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings) {
          setAnnouncementText(data.settings.announcementText || "");
          setAnnouncementEnabled(data.settings.announcementEnabled ?? true);
          setCodEnabled(data.settings.codEnabled ?? false);
          setWhatsappNumber(data.settings.whatsappNumber || "");
          setInstagramHandle(data.settings.instagramHandle || "");
          setInstagramUrl(data.settings.instagramUrl || "");
        }
        if (data?.hero) {
          if (data.hero.title) setHeroTitle(data.hero.title);
          if (data.hero.subtitle) setHeroSubtitle(data.hero.subtitle);
        }
        if (data?.gifting) {
          if (data.gifting.title) setGiftingTitle(data.gifting.title);
          if (data.gifting.subtitle) setGiftingDesc(data.gifting.subtitle);
        }
      })
      .catch(() => toast.error("Failed to load CMS settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            announcementText,
            announcementEnabled,
            codEnabled,
            whatsappNumber,
            instagramHandle,
            instagramUrl,
          },
          hero: {
            title: heroTitle,
            subtitle: heroSubtitle,
          },
          gifting: {
            title: giftingTitle,
            subtitle: giftingDesc,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Homepage CMS & Site Settings saved successfully! ✨");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch {
      toast.error("Network error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm font-sans text-gray-500">
        Loading CMS configurations...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] font-sans">
            Storefront CMS
          </span>
          <h1 className="font-serif text-3xl text-gray-900 font-medium">
            Homepage & Brand Management
          </h1>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Update marketing headlines, logistics toggles, announcement text, and contact channels.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-gold px-6 py-2.5 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <Save size={15} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Logistics & Policy Toggles */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-gray-900 flex items-center gap-2">
            <Truck size={18} className="text-[#C5A059]" />
            <span>Logistics & Payments</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-900 font-sans">
                  Cash on Delivery (COD)
                </h3>
                <p className="text-[11px] text-gray-500 font-sans">
                  Default disabled per SHYN.ISH Instagram profile. Toggle to enable COD at checkout.
                </p>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-[#C5A059] focus:ring-[#C5A059] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
                Customer Care WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Announcement Strip */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[#C5A059]" />
              <span>Marquee Announcement Bar</span>
            </h2>
            <label className="flex items-center gap-2 text-xs font-sans cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#C5A059]"
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
              Announcement Copy
            </label>
            <textarea
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. 18K PVD GOLD PLATED · JEWELLERY UNDER ₹480 · ALL INDIA DELIVERY"
              className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* Section 3: Hero Scene Copy */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-[#C5A059]" />
            <span>Cinematic Hero Copy</span>
          </h2>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
                Hero Subtitle Description
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: 3D Gifting Story Copy */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h2 className="font-serif text-xl text-gray-900 flex items-center gap-2">
            <Package size={18} className="text-[#C5A059]" />
            <span>3D Gifting Experience Copy</span>
          </h2>

          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
                Gifting Section Headline
              </label>
              <input
                type="text"
                value={giftingTitle}
                onChange={(e) => setGiftingTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 font-sans">
                Gifting Packaging Description
              </label>
              <textarea
                rows={2}
                value={giftingDesc}
                onChange={(e) => setGiftingDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border border-gray-200 outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold px-8 py-3 text-xs font-semibold flex items-center gap-2"
          >
            <Save size={15} />
            <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
