import { getCustomerToken } from "@/app/actions/customer";
import { verifySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Copy, Share2, Gift, CheckCircle } from "lucide-react";
import Link from "next/link";
import CopyButton from "./CopyButton"; // We'll create this client component

export default async function ReferAndEarnPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/account/login");

  const session = await verifySession(token);
  if (!session || !session.userId) redirect("/account/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string }
  });
  
  if (!user) redirect("/account/login");

  const profile = await prisma.customerReferralProfile.findUnique({
    where: { email: user.email.toLowerCase() },
    include: { rewards: true }
  });

  if (!profile) {
    // Edge case if they somehow reached here without a profile
    return <div className="pt-32 pb-24 text-center">Referral profile not found. Please log out and log back in.</div>;
  }

  const settings = await prisma.referralSettings.findUnique({ where: { id: "singleton" } });
  
  // Parse milestones or use defaults
  const milestones = Array.isArray(settings?.milestones) ? settings.milestones as any[] : [
    { count: 1, discountValue: 5, discountType: 'PERCENTAGE' },
    { count: 3, discountValue: 10, discountType: 'PERCENTAGE' },
    { count: 5, discountValue: 20, discountType: 'PERCENTAGE' }
  ];

  const currentCount = profile.successfulReferrals;
  const nextMilestone = milestones.find(m => m.count > currentCount) || milestones[milestones.length - 1];
  const maxMilestone = milestones[milestones.length - 1].count;
  
  const progressPercentage = Math.min((currentCount / nextMilestone.count) * 100, 100);
  
  // Base URL for referral link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eshara.com";
  const referralLink = `${appUrl}/ref/${profile.referralCode}`;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <Link href="/account" className="text-sm text-gray-500 hover:text-black transition-colors mb-4 inline-block">
            ← Back to Account
          </Link>
          <h1 className="font-serif text-4xl mb-4" style={{ color: "var(--charcoal)" }}>Refer & Earn</h1>
          <p className="font-sans text-gray-600 max-w-xl text-lg">
            Share your ESHARA experience with friends and unlock exclusive rewards up to {settings?.maximumReward ?? 20}% off as your referral journey grows.
          </p>
        </div>

        {/* Link Section */}
        <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="flex-1">
            <h3 className="font-serif text-xl mb-2" style={{ color: "var(--charcoal)" }}>Your Unique Referral Link</h3>
            <p className="text-sm text-gray-500 font-sans mb-4">Share this link with your friends to give them a warm welcome and earn your rewards.</p>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="bg-transparent flex-1 outline-none px-2 text-gray-700 font-sans text-sm"
              />
              <CopyButton textToCopy={referralLink} />
            </div>
          </div>
          <div className="flex gap-3">
            <a 
              href={`https://wa.me/?text=Discover%20ESHARA%20Naturals!%20Use%20my%20link%20to%20explore:%20${encodeURIComponent(referralLink)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-md font-sans text-sm font-medium hover:bg-[#128C7E] transition-colors flex items-center gap-2"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl" style={{ color: "var(--charcoal)" }}>Your ESHARA Reward Journey</h2>
          <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            {/* Ayurvedic Herbs Background (subtle) */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
              <img src="/assets/amla.PNG" alt="" className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-3xl font-serif" style={{ color: "var(--charcoal)" }}>
                    {currentCount} <span className="text-lg text-gray-400">/ {nextMilestone.count}</span>
                  </p>
                  <p className="text-sm uppercase tracking-wider text-gray-500 font-sans mt-1">Successful Referrals</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#2D4A28] font-sans">Next Reward: {nextMilestone.discountValue}% OFF</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-[#2D4A28] transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-6">
                <div>
                  <p className="text-2xl font-serif">{profile.pendingReferrals}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-serif">{profile.successfulReferrals}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-[#2D4A28]">{profile.rewards.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl flex items-center gap-2" style={{ color: "var(--charcoal)" }}>
            <Gift size={24} className="text-[#2D4A28]" /> Your Rewards
          </h2>
          
          <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-sm">
            {profile.rewards.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Gift size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-500 font-sans">You haven't unlocked any rewards yet.<br/>Share your link to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {profile.rewards.map((reward) => (
                  <div key={reward.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle size={24} className="text-[#2D4A28]" />
                      </div>
                      <div>
                        <p className="font-serif text-lg" style={{ color: "var(--charcoal)" }}>{reward.discountValue}% OFF</p>
                        <p className="text-sm text-gray-500 font-sans">Unlocked at {reward.milestone} referrals</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm tracking-wider text-black border border-gray-200">
                        {reward.couponCode}
                      </div>
                      <span className={`text-xs font-medium uppercase tracking-wide ${reward.isRedeemed ? 'text-gray-400' : 'text-[#2D4A28]'}`}>
                        {reward.isRedeemed ? 'Redeemed' : 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
