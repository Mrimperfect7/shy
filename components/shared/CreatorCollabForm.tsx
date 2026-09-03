"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CreatorCollabForm() {
  const [formData, setFormData] = useState({
    name: "", email: "", instagramHandle: "", followerCount: "", niche: "", phone: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/creator-apply", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      if (res.ok) setStatus("success");
      else {
        const d = await res.json();
        setStatus("error"); setErrorMsg(d.error || "Application failed");
      }
    } catch {
      setStatus("error"); setErrorMsg("Application failed");
    }
  };

  return (
    <div className="p-8 lg:p-12 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
      {status === "success" ? (
        <div className="text-center py-12">
          <CheckCircle2 size={48} strokeWidth={1} className="mx-auto mb-6" style={{ color: "var(--forest)" }} />
          <h2 className="font-serif text-3xl mb-4" style={{ color: "var(--charcoal)" }}>Application Received</h2>
          <p className="font-sans text-sm" style={{ color: "var(--text-muted)" }}>
            Thank you for your interest in Eshara Naturals. Our team will review your application and get back to you within 3-5 business days if there's a fit.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Full Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="form-label">Email Address *</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">Instagram Handle *</label>
              <input type="text" required placeholder="@" value={formData.instagramHandle} onChange={e => setFormData({...formData, instagramHandle: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="form-label">Followers *</label>
              <select required value={formData.followerCount} onChange={e => setFormData({...formData, followerCount: e.target.value})} className="form-input">
                <option value="">Select range</option>
                <option value="Under 10k">Under 10k</option>
                <option value="10k - 50k">10k - 50k</option>
                <option value="50k - 100k">50k - 100k</option>
                <option value="100k+">100k+</option>
              </select>
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input type="tel" placeholder="1234567890" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label">Primary Niche *</label>
            <select required value={formData.niche} onChange={e => setFormData({...formData, niche: e.target.value})} className="form-input">
              <option value="">Select your primary focus</option>
              <option value="Beauty & Skincare">Beauty & Skincare</option>
              <option value="Hair Care">Hair Care</option>
              <option value="Wellness & Lifestyle">Wellness & Lifestyle</option>
              <option value="Ayurveda / Natural Living">Ayurveda / Natural Living</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Why do you want to partner with Eshara Naturals?</label>
            <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="form-input resize-y"></textarea>
          </div>

          {status === "error" && <p className="text-sm font-sans" style={{ color: "#c0392b" }}>{errorMsg}</p>}

          <div className="pt-4">
            <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center disabled:opacity-50">
              {status === "loading" ? "Submitting..." : <>Submit Application <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
