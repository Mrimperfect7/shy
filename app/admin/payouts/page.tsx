"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/shopify/products";
import { IndianRupee, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  const fetchPayouts = async () => {
    try {
      const res = await fetch("/api/admin/payouts");
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error("Failed to fetch payouts", err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleMarkAsPaid = async (payoutId: string) => {
    if (!confirm("Are you sure you want to mark this payout as PAID? The influencer should have received the money before you do this.")) return;
    try {
      const res = await fetch(`/api/admin/payouts/${payoutId}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to update payout status");
      toast.success("Payout marked as paid!");
      fetchPayouts(); // refresh
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl mb-2" style={{ color: "var(--charcoal)" }}>Influencer Payouts</h1>
        <p className="text-gray-500 font-sans text-sm">View and manage pending and completed payout requests from influencer partners.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loadingPayouts ? (
            <div className="p-8 text-center text-gray-400 font-sans text-sm">Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div className="p-12 text-center">
              <IndianRupee className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 font-sans text-sm">No payout requests found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-500 font-sans">
                  <th className="px-6 py-4">Influencer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">UPI / Payment Details</th>
                  <th className="px-6 py-4">Requested Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-sm">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {p.influencer?.user?.name || "Unknown User"}
                    </td>
                    <td className="px-6 py-4 font-medium text-[var(--forest-green)]">
                      {formatPrice(p.amount, "INR")}
                    </td>
                    <td className="px-6 py-4">
                      {p.influencer?.upiId ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                            {p.influencer.upiId}
                          </span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(p.influencer.upiId);
                              toast.success("Copied UPI ID!");
                            }}
                            className="text-gray-400 hover:text-[var(--forest-green)]"
                            title="Copy UPI ID"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        p.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => handleMarkAsPaid(p.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--forest)] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
