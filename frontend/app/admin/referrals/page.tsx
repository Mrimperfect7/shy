import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  let settings = null;
  let profiles: any[] = [];

  try {
    settings = await prisma.referralSettings.findUnique({
      where: { id: "singleton" },
    });

    profiles = await prisma.customerReferralProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { rewards: true },
    });
  } catch (e) {
    console.error("Error loading referral data:", e);
  }

  const totalReferrals = profiles.reduce((acc, p) => acc + p.successfulReferrals, 0);
  const pendingReferrals = profiles.reduce((acc, p) => acc + p.pendingReferrals, 0);
  const totalRewardsUnlocked = profiles.reduce((acc, p) => acc + p.rewards.length, 0);

  async function updateSettings(formData: FormData) {
    "use server";
    const isEnabled = formData.get("isEnabled") === "true";
    const popupEnabled = formData.get("popupEnabled") === "true";
    const maxReward = parseFloat(formData.get("maximumReward") as string) || 20;

    await prisma.referralSettings.upsert({
      where: { id: "singleton" },
      update: {
        isEnabled,
        popupEnabled,
        maximumReward: maxReward,
      },
      create: {
        id: "singleton",
        isEnabled,
        popupEnabled,
        maximumReward: maxReward,
        milestones: [
          { count: 1, discountValue: 5, discountType: 'PERCENTAGE' },
          { count: 3, discountValue: 10, discountType: 'PERCENTAGE' },
          { count: 5, discountValue: 20, discountType: 'PERCENTAGE' }
        ],
      }
    });

    revalidatePath("/admin/referrals");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Referral Program</h1>
        <p className="text-gray-500 font-sans">Manage customer referrals and rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Referrals</h3>
          <p className="text-3xl font-serif text-black">{totalReferrals}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Referrals</h3>
          <p className="text-3xl font-serif text-black">{pendingReferrals}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Rewards Unlocked</h3>
          <p className="text-3xl font-serif text-black">{totalRewardsUnlocked}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Profiles</h3>
          <p className="text-3xl font-serif text-black">{profiles.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="font-serif text-xl mb-4">Settings</h2>
        <form action={updateSettings} className="space-y-4 max-w-md font-sans">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isEnabled" name="isEnabled" value="true" defaultChecked={settings?.isEnabled ?? true} className="w-5 h-5" />
            <label htmlFor="isEnabled" className="font-medium text-gray-700">Enable Referral Program</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="popupEnabled" name="popupEnabled" value="true" defaultChecked={settings?.popupEnabled ?? true} className="w-5 h-5" />
            <label htmlFor="popupEnabled" className="font-medium text-gray-700">Enable New Customer Popup</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Reward (%)</label>
            <input type="number" name="maximumReward" defaultValue={settings?.maximumReward ?? 20} className="w-full px-4 py-2 border rounded-md" />
          </div>
          <button type="submit" className="bg-[#2D4A28] text-white px-6 py-2 rounded-md">Save Settings</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-serif text-xl">Customer Profiles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Success / Pending</th>
                <th className="px-6 py-3">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{profile.email}</td>
                  <td className="px-6 py-4">{profile.referralCode}</td>
                  <td className="px-6 py-4">{profile.successfulReferrals} / {profile.pendingReferrals}</td>
                  <td className="px-6 py-4">{profile.rewards.length}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No referral profiles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
