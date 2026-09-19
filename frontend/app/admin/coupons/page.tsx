"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/shopify/products";
import { Search, Plus, MoreVertical, Ticket, Calendar, TrendingUp, X, ShoppingBag, Trash2 } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  usageCount: number;
  usageLimit: number | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  expiryDate: string | null;
  influencer?: {
    user: { name: string };
  } | null;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [influencers, setInfluencers] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "10",
    usageLimit: "",
    influencerId: "none"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInfluencers = async () => {
    try {
      const res = await fetch("/api/admin/influencers");
      if (res.ok) {
        const data = await res.json();
        setInfluencers(data.influencers || []);
      }
    } catch (err) {
      console.error("Failed to fetch influencers", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchInfluencers();
  }, []);

  const handleGenerateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCoupon.code,
          discountType: newCoupon.discountType,
          discountValue: parseFloat(newCoupon.discountValue),
          usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : null,
          influencerId: newCoupon.influencerId === "none" ? null : newCoupon.influencerId
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");
      
      setIsModalOpen(false);
      setNewCoupon({ code: "", discountType: "PERCENTAGE", discountValue: "10", usageLimit: "", influencerId: "none" });
      fetchCoupons(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete coupon");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    (c.influencer && c.influencer.user.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Discount Codes</h1>
          <p className="font-sans text-sm text-gray-500">Generate and track affiliate and promotional coupons.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-opacity hover:opacity-90"
          style={{ background: "var(--charcoal)" }}
        >
          <Plus size={16} />
          <span>Generate Code</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border flex flex-col flex-1 overflow-hidden" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-4 bg-gray-50/50" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by code or influencer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border rounded-md outline-none focus:ring-1"
              style={{ borderColor: "rgba(26,26,26,0.2)" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
              ))}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Ticket size={32} className="text-gray-400" />
              </div>
              <h3 className="font-serif text-lg mb-1" style={{ color: "var(--charcoal)" }}>No coupons found</h3>
              <p className="text-sm text-gray-500 max-w-md">Create your first custom discount code to start tracking attribution.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-white border-b sticky top-0 z-10" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500">Code</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Discount</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Performance</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(26,26,26,0.05)" }}>
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium tracking-widest uppercase" style={{ color: "var(--charcoal)" }}>{coupon.code}</div>
                      {coupon.influencer && (
                        <div className="text-xs text-gray-500 mt-1">Assigned to: <span className="font-medium text-gray-700">{coupon.influencer.user.name}</span></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue, "INR")} OFF`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium" style={{ color: "var(--forest-green)" }}>
                        <TrendingUp size={14} />
                        {coupon.usageCount} {coupon.usageCount === 1 ? 'use' : 'uses'}
                      </div>
                      {coupon.usageLimit && (
                        <div className="text-xs text-gray-500 mt-1">Limit: {coupon.usageLimit}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.status === "ACTIVE" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      )}
                      {coupon.status === "INACTIVE" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                      {coupon.status === "EXPIRED" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Expired
                        </span>
                      )}
                      {coupon.expiryDate && (
                         <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500"><Calendar size={12}/> Ends {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders?coupon=${encodeURIComponent(coupon.code)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-sans font-semibold border border-purple-200 transition-colors"
                          title="View all customer orders using this coupon"
                        >
                          <ShoppingBag size={12} className="text-purple-700" />
                          <span>View Orders</span>
                        </Link>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors rounded-md"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Generate Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="font-serif text-2xl mb-1" style={{ color: "var(--charcoal)" }}>Generate Code</h2>
            <p className="text-sm text-gray-500 mb-6">Create a new discount code for your store.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleGenerateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-sans mb-1 text-gray-600">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  className="w-full p-2.5 border rounded-md font-sans text-sm outline-none focus:ring-1"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-sans mb-1 text-gray-600">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
                    className="w-full p-2.5 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-sans mb-1 text-gray-600">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                    className="w-full p-2.5 border rounded-md font-sans text-sm outline-none focus:ring-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-sans mb-1 text-gray-600">Usage Limit (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  min="1"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                  className="w-full p-2.5 border rounded-md font-sans text-sm outline-none focus:ring-1"
                />
              </div>

              <div>
                <label className="block text-sm font-sans mb-1 text-gray-600">Assign to Influencer (Optional)</label>
                <select
                  value={newCoupon.influencerId}
                  onChange={(e) => setNewCoupon({...newCoupon, influencerId: e.target.value})}
                  className="w-full p-2.5 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-white"
                >
                  <option value="none">-- Do not assign --</option>
                  {influencers.map(inf => (
                    <option key={inf.id} value={inf.id}>{inf.user.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-sans border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 text-sm font-sans rounded-md text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--charcoal)" }}
                >
                  {isSubmitting ? "Generating..." : "Generate Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
