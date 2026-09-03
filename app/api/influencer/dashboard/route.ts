import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getInfluencerDashboard } from "@/services/influencerService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "INFLUENCER" || !session.influencerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Server-side: influencer can ONLY see their own data
    const data = await getInfluencerDashboard(session.influencerId);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
