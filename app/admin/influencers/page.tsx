"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/shopify/products";
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  Mail, 
  AtSign, 
  Users, 
  X, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  KeyRound,
  Sparkles,
  ExternalLink,
  IndianRupee
} from "lucide-react";
import toast from "react-hot-toast";

type Influencer = {
  id: string;
  userId: string;
  instagramHandle: string | null;
  phone: string | null;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  totalCommission: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    isActive: boolean;
  };
};

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(true); // Default visible to admins as requested
  const [newPartner, setNewPartner] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    commissionRate: "10",
    phone: "",
    instagramHandle: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Credentials Success Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    commissionRate: string;
    portalUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchInfluencers = async () => {
    try {
      const res = await fetch("/api/admin/influencers");
      if (res.ok) {
        const data = await res.json();
        setInfluencers(data.influencers || []);
      }
    } catch (err) {
      console.error("Failed to fetch influencers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const generateRandomPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    const generated = `Eshara${char}@${randomNum}`;
    setNewPartner(prev => ({ ...prev, password: generated }));
    toast.success("Generated secure password!");
  };

  const handleInvitePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const portalUrl = "https://influencer.esharanatural.com";
      
      const res = await fetch("/api/admin/influencers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPartner.name,
          email: newPartner.email,
          password: newPartner.password,
          commissionRate: parseFloat(newPartner.commissionRate),
          phone: newPartner.phone,
          instagramHandle: newPartner.instagramHandle
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create partner");
      
      // Store credentials to display to admin
      setCreatedCredentials({
        name: newPartner.name,
        email: newPartner.email,
        password: newPartner.password,
        commissionRate: newPartner.commissionRate,
        portalUrl
      });

      setIsModalOpen(false);
      setNewPartner({ name: "", email: "", password: "", commissionRate: "10", phone: "", instagramHandle: "" });
      fetchInfluencers(); // Refresh list
      toast.success("Influencer account created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentialsToClipboard = () => {
    if (!createdCredentials) return;
    const text = `🌿 *Eshara Naturals - Influencer Portal Credentials* 🌿\n\n👤 *Partner Name:* ${createdCredentials.name}\n📧 *Email:* ${createdCredentials.email}\n🔑 *Password:* ${createdCredentials.password}\n💰 *Commission Rate:* ${createdCredentials.commissionRate}%\n🔗 *Login Portal:* ${createdCredentials.portalUrl}\n\nPlease log in and update your payout UPI/Bank details in your dashboard.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied credentials to clipboard! Ready to share.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleEdit = (inf: Influencer) => {
    setEditingPartner({
      id: inf.id,
      name: inf.user.name,
      email: inf.user.email,
      commissionRate: inf.commissionRate.toString(),
      phone: inf.phone || "",
      instagramHandle: inf.instagramHandle || "",
      isActive: inf.user.isActive
    });
    setError("");
    setIsEditModalOpen(true);
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/influencers/${editingPartner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate: parseFloat(editingPartner.commissionRate),
          phone: editingPartner.phone,
          instagramHandle: editingPartner.instagramHandle,
          isActive: editingPartner.isActive
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update partner");

      setIsEditModalOpen(false);
      fetchInfluencers();
      toast.success("Partner updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate/delete this influencer partner?")) return;
    setIsDeleting(id);

    try {
      const res = await fetch(`/api/admin/influencers/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete partner");
      }

      fetchInfluencers();
      toast.success("Partner removed successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredInfluencers = influencers.filter(inf => 
    inf.user.name.toLowerCase().includes(search.toLowerCase()) ||
    inf.user.email.toLowerCase().includes(search.toLowerCase()) ||
    (inf.instagramHandle && inf.instagramHandle.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2" style={{ color: "var(--charcoal)" }}>Influencer Partners</h1>
          <p className="text-gray-500 font-sans text-sm">Manage affiliates, track sales attribution, and view creator accounts.</p>
        </div>

        <button 
          onClick={() => {
            setIsModalOpen(true);
            generateRandomPassword();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-sans text-sm transition-opacity hover:opacity-90 shadow-sm"
          style={{ background: "var(--forest)" }}
        >
          <Plus size={16} /> Create Partner
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, email, or @handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm font-sans rounded-lg border border-gray-200 outline-none focus:border-[var(--forest)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading partners...</div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 font-sans text-sm">No influencer partners found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans">
                  <th className="px-6 py-4">Partner</th>
                  <th className="px-6 py-4">Social / Phone</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Total Sales</th>
                  <th className="px-6 py-4">Total Earned</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-sm">
                {filteredInfluencers.map((inf) => (
                  <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inf.user.name}</div>
                      <div className="text-xs text-gray-400">{inf.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {inf.instagramHandle && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                          <AtSign size={12} className="text-pink-500" /> {inf.instagramHandle}
                        </div>
                      )}
                      {inf.phone && <div className="text-xs text-gray-400">{inf.phone}</div>}
                      {!inf.instagramHandle && !inf.phone && <span className="text-xs text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-800">
                      {inf.commissionRate}%
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{inf.totalSales.toLocaleString("en-IN")}
                      <div className="text-[11px] text-gray-400">{inf.totalOrders} orders</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--forest)]">
                      ₹{inf.totalCommission.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      {inf.user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                      <button onClick={() => handleEdit(inf)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50" title="Edit Partner">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(inf.id)} disabled={isDeleting === inf.id} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 disabled:opacity-50" title="Delete/Deactivate Partner">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── 1. Create Partner Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[var(--forest)] flex items-center justify-center font-bold">
                <Plus size={18} />
              </div>
              <h2 className="font-serif text-2xl font-bold" style={{ color: "var(--charcoal)" }}>Create Influencer Partner</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">Create credentials and assign custom commission rates.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleInvitePartner} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)]"
                />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Login Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="partner@gmail.com"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)]"
                />
              </div>

              {/* Password Field with Show/Hide & Auto-generate */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider font-bold font-sans text-amber-900 flex items-center gap-1.5">
                    <KeyRound size={14} className="text-amber-700" /> Account Password (Visible to Admin)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-[var(--forest)] hover:underline font-bold flex items-center gap-1"
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter password (min 6 chars)"
                    value={newPartner.password}
                    onChange={(e) => setNewPartner({...newPartner, password: e.target.value})}
                    className="w-full p-2.5 pr-10 border border-amber-300 bg-white rounded-lg font-mono text-sm font-semibold text-gray-900 outline-none focus:ring-1 focus:ring-[var(--forest)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  💡 This password will be saved for the influencer and shown after creation so you can share it with them.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Commission Rate (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={newPartner.commissionRate}
                    onChange={(e) => setNewPartner({...newPartner, commissionRate: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Instagram Handle</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={newPartner.instagramHandle}
                    onChange={(e) => setNewPartner({...newPartner, instagramHandle: e.target.value})}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-sans border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-sm font-sans font-semibold rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--forest)" }}
                >
                  {isSubmitting ? "Creating Partner..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. Credentials Confirmation & Sharing Modal ── */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setCreatedCredentials(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-[var(--forest)] rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={26} />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Partner Created!</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">
                Here are the login credentials for this influencer. Copy and share them via WhatsApp or Email.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#EAE5DC] space-y-3 mb-6 font-sans">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Partner Name:</span>
                <span className="font-bold text-gray-900">{createdCredentials.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Login Email:</span>
                <span className="font-mono font-bold text-gray-900">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200 bg-amber-50/80 p-2 rounded">
                <span className="text-amber-900 font-bold flex items-center gap-1">
                  <KeyRound size={14} /> Password:
                </span>
                <span className="font-mono font-bold text-base text-[var(--forest)] tracking-wide">
                  {createdCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Commission Rate:</span>
                <span className="font-bold text-emerald-800">{createdCredentials.commissionRate}% per sale</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Login Portal:</span>
                <a href={createdCredentials.portalUrl} target="_blank" rel="noreferrer" className="text-[var(--forest)] hover:underline flex items-center gap-1 font-semibold">
                  Open Portal <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={copyCredentialsToClipboard}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-sans font-semibold rounded-xl text-white transition-opacity hover:opacity-95 shadow-sm"
                style={{ background: "var(--forest)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied to Clipboard!" : "Copy WhatsApp/Email Message"}
              </button>

              <button
                onClick={() => setCreatedCredentials(null)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-black font-sans font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Edit Modal ── */}
      {isEditModalOpen && editingPartner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "var(--charcoal)" }}>Edit Partner</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">Update settings for {editingPartner.name} ({editingPartner.email}).</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Commission Rate (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={editingPartner.commissionRate}
                  onChange={(e) => setEditingPartner({...editingPartner, commissionRate: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Instagram Handle</label>
                <input
                  type="text"
                  value={editingPartner.instagramHandle}
                  onChange={(e) => setEditingPartner({...editingPartner, instagramHandle: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold font-sans mb-1 text-gray-700">Phone</label>
                <input
                  type="text"
                  value={editingPartner.phone}
                  onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg font-sans text-sm outline-none focus:border-[var(--forest)]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={editingPartner.isActive}
                  onChange={(e) => setEditingPartner({...editingPartner, isActive: e.target.checked})}
                  className="rounded w-4 h-4 text-[var(--forest)] focus:ring-[var(--forest)]"
                />
                <label htmlFor="isActive" className="text-sm font-sans text-gray-700 font-medium">Account is Active</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-sans border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-sm font-sans font-semibold rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--forest)" }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
