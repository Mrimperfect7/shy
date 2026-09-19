import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminAnalytics } from "@/services/influencerService";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = await getAdminAnalytics(startDate, now);
    return NextResponse.json({ analytics });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
