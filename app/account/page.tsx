import { redirect } from "next/navigation";
import { getCustomerToken, customerLogout } from "@/app/actions/customer";
import { verifySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { LogOut, Package, MapPin, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/shopify/products";

export default async function AccountPage() {
  const token = await getCustomerToken();
  if (!token) {
    redirect("/account/login");
  }

  const session = await verifySession(token);
  if (!session || !session.userId) {
    redirect("/account/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string }
  });

  if (!user) {
    redirect("/account/login");
  }

  const profile = await prisma.customerReferralProfile.findUnique({
    where: { email: user.email.toLowerCase() }
  });

  const settings = await prisma.referralSettings.findUnique({ where: { id: "singleton" } });
  const milestones = Array.isArray(settings?.milestones) ? settings.milestones as any[] : [
    { count: 1, discountValue: 5, discountType: 'PERCENTAGE' },
    { count: 3, discountValue: 10, discountType: 'PERCENTAGE' },
    { count: 5, discountValue: 20, discountType: 'PERCENTAGE' }
  ];

  const currentCount = profile?.successfulReferrals || 0;
  const nextMilestone = milestones.find((m: any) => m.count > currentCount) || milestones[milestones.length - 1];
  const stepsAway = Math.max(0, nextMilestone.count - currentCount);

  const orders = await prisma.order.findMany({
    where: { customerEmail: user.email },
    orderBy: { createdAt: 'desc' }
  });

  // We don't have a robust address book yet, we just pull the first order's address as default if possible
  // shippingAddress is stored as Json in Prisma — cast it directly
  const defaultAddress = orders.length > 0 ? (orders[0].shippingAddress as Record<string, string> | null) : null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#E5E5E5]">
          <div>
            <h1 className="font-serif text-4xl mb-2" style={{ color: "var(--charcoal)" }}>My Account</h1>
            <p className="font-sans text-gray-500">Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          <form action={async () => {
            "use server";
            await customerLogout();
            redirect("/account/login");
          }}>
            <button type="submit" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black font-sans transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>

        {/* Refer & Earn Banner */}
        <Link href="/account/refer-and-earn" className="block group">
          <div className="bg-[#2D4A28] rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md transition-colors group-hover:bg-[#253d21]">
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-serif text-2xl mb-1">Refer & Earn</h2>
              <p className="font-sans text-green-100 text-sm">Share ESHARA and unlock up to {settings?.maximumReward ?? 20}% off your next order.</p>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 rounded-xl p-4 sm:p-5 w-full sm:w-auto border border-white/10">
              <div className="text-center shrink-0">
                <p className="font-serif text-3xl font-bold leading-none mb-1 text-[#D4AF37]">{currentCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-green-100 font-sans font-semibold">Total Referrals</p>
              </div>
              <div className="w-[1px] h-10 bg-white/20 shrink-0"></div>
              <div className="text-left flex-1 min-w-[120px]">
                {stepsAway > 0 ? (
                  <>
                    <p className="font-sans text-sm font-medium leading-snug">
                      <span className="text-[#D4AF37] font-bold">{stepsAway}</span> {stepsAway === 1 ? 'step' : 'steps'} away from
                    </p>
                    <p className="font-sans text-xs text-green-100 mt-0.5">{nextMilestone.discountValue}% OFF reward!</p>
                  </>
                ) : (
                  <>
                    <p className="font-sans text-sm font-medium text-[#D4AF37]">Max Reward Unlocked!</p>
                    <p className="font-sans text-xs text-green-100 mt-0.5">Thank you for sharing.</p>
                  </>
                )}
              </div>
              <ArrowRight size={18} className="text-white/50 shrink-0 hidden sm:block transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order History */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
              <Package size={20} className="text-[#2D4A28]" /> Order History
            </h2>
            
            <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Package size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-sans mb-4">You haven't placed any orders yet.</p>
                  <Link href="/shop" className="text-sm font-medium underline" style={{ color: "var(--charcoal)" }}>
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <div key={order.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium font-sans mb-1" style={{ color: "var(--charcoal)" }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 font-sans">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1">
                        <p className="font-medium font-sans" style={{ color: "var(--forest-green)" }}>
                           {formatPrice(order.totalAmount, "INR")}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wide">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-8">
            {/* Profile Info */}
            <div>
              <h2 className="font-serif text-xl flex items-center gap-2 mb-4" style={{ color: "var(--charcoal)" }}>
                <User size={18} className="text-[#2D4A28]" /> Account Details
              </h2>
              <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] space-y-4 font-sans text-sm">
                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Name</p>
                  <p className="font-medium" style={{ color: "var(--charcoal)" }}>{user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Email</p>
                  <p className="font-medium" style={{ color: "var(--charcoal)" }}>{user.email}</p>
                </div>
              </div>
            </div>

            {/* Address Book */}
            <div>
              <h2 className="font-serif text-xl flex items-center gap-2 mb-4" style={{ color: "var(--charcoal)" }}>
                <MapPin size={18} className="text-[#2D4A28]" /> Default Address
              </h2>
              <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] font-sans text-sm text-gray-600">
                {defaultAddress ? (
                  <div className="space-y-1">
                    <p className="font-medium text-black">{defaultAddress.firstName} {defaultAddress.lastName}</p>
                    <p>{defaultAddress.address1}</p>
                    <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-3">No default address saved.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
