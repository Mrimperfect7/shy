import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAllPayoutRequests } from "@/services/influencerService";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payouts = await getAllPayoutRequests();
    return NextResponse.json({ payouts });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}
