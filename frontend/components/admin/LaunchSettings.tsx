"use client";

import { useState } from "react";
import { updateLaunchSettings } from "@/app/actions/admin-settings";
import { Settings, Loader2 } from "lucide-react";

export default function LaunchSettings({ initialShampoo, initialSkincare }: { initialShampoo: boolean, initialSkincare: boolean }) {
  const [shampooLaunched, setShampooLaunched] = useState(initialShampoo);
  const [skincareLaunched, setSkincareLaunched] = useState(initialSkincare);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    const res = await updateLaunchSettings(shampooLaunched, skincareLaunched);
    if (res.success) {
      setMessage("Settings saved successfully.");
    } else {
      setMessage(`Error: ${res.error}`);
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mt-8" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Store Launch Settings</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Toggle "Coming Soon" banners on the homepage collections.</p>
        </div>
      </div>

      <div className="space-y-4 max-w-sm">
        <label className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 cursor-pointer">
          <span className="font-medium text-sm text-gray-700">Shampoo Launched</span>
          <input
            type="checkbox"
            checked={shampooLaunched}
            onChange={(e) => setShampooLaunched(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </label>
        
        <label className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 cursor-pointer">
          <span className="font-medium text-sm text-gray-700">Skincare Launched</span>
          <input
            type="checkbox"
            checked={skincareLaunched}
            onChange={(e) => setSkincareLaunched(e.target.checked)}
            className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
          />
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-[#0A2612] text-white rounded-lg text-sm font-medium hover:bg-[#113A1C] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Settings
          </button>
          {message && (
            <span className={`text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
