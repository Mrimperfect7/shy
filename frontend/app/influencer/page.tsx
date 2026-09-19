"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/shopify/products";
import { TrendingUp, ShoppingBag, IndianRupee, Ticket } from "lucide-react";

export default function InfluencerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [upiId, setUpiId] = useState("");
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/influencer/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (json?.influencer?.upiId) {
            setUpiId(json.influencer.upiId);
          }
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to load dashboard");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handlePayoutRequest = async () => {
    if (!upiId) {
      setPayoutMessage("Please enter your UPI ID");
      return;
    }
    
    setRequestingPayout(true);
    setPayoutMessage("");
    
    try {
      const res = await fetch("/api/influencer/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId }),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to request payout");
      
      setPayoutMessage("✅ Payout requested successfully! It will be processed soon.");
      
      // Update local state to reflect new pending payout
      setData((prev: any) => ({
        ...prev,
        commissions: {
          ...prev.commissions,
          approved: 0,
          pending: prev.commissions.pending + prev.commissions.approved // wait, payout is pending, commission is now linked to payout but its status stays APPROVED until payout is paid? Actually, it just links to payout. For simplicity, we just trigger a full re-fetch.
        }
      }));
      
      // Better to just refresh the page data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      setPayoutMessage(`❌ ${err.message}`);
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full">
      <div>
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Welcome, {data?.influencer?.name}</h1>
        <p className="font-sans text-sm text-gray-500">Track your performance and earnings securely.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Sales" 
          value={formatPrice(data?.stats?.totalSales || 0, "INR")} 
          icon={IndianRupee}
          trend="Generated via your coupons"
        />
        <MetricCard 
          title="Total Orders" 
          value={(data?.stats?.totalOrders || 0).toString()} 
          icon={ShoppingBag}
          trend="Using your coupons"
        />
        <MetricCard 
          title="Total Earnings" 
          value={formatPrice(data?.commissions?.total || 0, "INR")} 
          icon={TrendingUp}
          trend={`${data?.influencer?.commissionRate}% commission rate`}
        />
        <MetricCard 
          title="Pending Payouts" 
          value={formatPrice(data?.commissions?.pending || 0, "INR")} 
          icon={IndianRupee}
          trend="Awaiting approval"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          <h2 className="font-serif text-xl mb-6" style={{ color: "var(--charcoal)" }}>Recent Orders</h2>
          
          {!data?.recentOrders || data.recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-sans text-sm border-2 border-dashed rounded-lg">
              No orders attributed to your coupons yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="border-b" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                  <tr>
                    <th className="pb-3 font-medium text-gray-500">Order ID</th>
                    <th className="pb-3 font-medium text-gray-500">Sale Amount</th>
                    <th className="pb-3 font-medium text-gray-500">Your Earning</th>
                    <th className="pb-3 font-medium text-gray-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(26,26,26,0.05)" }}>
                  {data.recentOrders.map((order: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium" style={{ color: "var(--charcoal)" }}>
                        {order.shopifyOrderName || order.shopifyOrderId}
                        {order.refunded && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Refunded</span>}
                      </td>
                      <td className="py-4" style={{ color: "var(--charcoal)" }}>
                        {formatPrice(order.netOrderValue, "INR")}
                      </td>
                      <td className="py-4 font-medium" style={{ color: "var(--forest-green)" }}>
                        {formatPrice(order.commissionValue, "INR")}
                      </td>
                      <td className="py-4 text-right text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Your Coupons */}
        <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          <h2 className="font-serif text-xl mb-6" style={{ color: "var(--charcoal)" }}>Your Coupons</h2>
          
          {!data?.coupons || data.coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-sans text-sm border-2 border-dashed rounded-lg">
              No active coupons assigned.
            </div>
          ) : (
            <div className="space-y-4">
              {data.coupons.map((coupon: any) => (
                <div key={coupon.id} className="p-4 rounded-lg border bg-gray-50 flex items-center justify-between" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                  <div>
                    <div className="font-mono font-bold text-lg mb-1" style={{ color: "var(--charcoal)" }}>{coupon.code}</div>
                    <div className="text-xs text-gray-500 font-sans">
                      {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium font-sans text-sm" style={{ color: "var(--forest-green)" }}>{coupon.usageCount} Uses</div>
                    <div className="text-xs text-gray-400 mt-1">{coupon.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payouts & Withdrawals */}
        <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
          <h2 className="font-serif text-xl mb-6" style={{ color: "var(--charcoal)" }}>Payouts & Withdrawals</h2>
          
          <div className="mb-6 p-4 rounded-lg flex items-center justify-between" style={{ background: "rgba(58, 75, 58, 0.05)" }}>
            <div>
              <div className="text-sm text-gray-500 font-sans mb-1">Available Balance</div>
              <div className="font-serif text-2xl" style={{ color: "var(--forest-green)" }}>
                {formatPrice(data?.commissions?.approved || 0, "INR")}
              </div>
            </div>
            <IndianRupee size={24} style={{ color: "var(--forest-green)", opacity: 0.5 }} />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. name@okhdfcbank"
                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:outline-none transition-colors"
                style={{ borderColor: "rgba(26,26,26,0.1)" }}
              />
              <p className="text-xs text-gray-500 mt-1">Earnings will be transferred to this UPI address.</p>
            </div>
            
            <button
              onClick={handlePayoutRequest}
              disabled={requestingPayout || (data?.commissions?.approved || 0) <= 0}
              className="w-full py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--forest-green)" }}
            >
              {requestingPayout ? "Requesting..." : "Request Payout"}
            </button>
            
            {(data?.commissions?.approved || 0) <= 0 && (
              <p className="text-xs text-red-500 text-center mt-2">
                You need an approved balance greater than ₹0 to request a payout.
              </p>
            )}
            
            {payoutMessage && (
              <div className={`text-sm p-3 rounded-lg ${payoutMessage.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {payoutMessage}
              </div>
            )}
          </div>
          
          {/* Payout History Mini-list */}
          {data?.payouts && data.payouts.length > 0 && (
            <div className="mt-8 border-t pt-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Payouts</h3>
              <div className="space-y-3">
                {data.payouts.slice(0, 3).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{formatPrice(p.amount, "INR")}</div>
                      <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                      p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border flex flex-col relative overflow-hidden" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-sans text-sm text-gray-500 tracking-wide uppercase">{title}</h3>
        <div className="p-2 rounded-full" style={{ background: "rgba(58, 75, 58, 0.05)", color: "var(--forest-green)" }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="font-serif text-3xl mb-1" style={{ color: "var(--charcoal)" }}>{value}</div>
      <div className="text-xs text-gray-400 font-sans mt-auto">{trend}</div>
    </div>
  );
}
