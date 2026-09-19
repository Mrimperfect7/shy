import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { CommissionStatus } from "@prisma/client";
import { createPayout } from "@/services/influencerService";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "INFLUENCER" || !session.influencerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { upiId } = await request.json();

    if (!upiId || typeof upiId !== "string" || upiId.trim() === "") {
      return NextResponse.json({ error: "UPI ID is required" }, { status: 400 });
    }

    // 1. Update Influencer's UPI ID
    await prisma.influencer.update({
      where: { id: session.influencerId },
      data: { upiId: upiId.trim() }
    });

    // 2. Fetch all APPROVED commissions for this influencer that are NOT linked to a payout
    const approvedCommissions = await prisma.commission.findMany({
      where: {
        influencerId: session.influencerId,
        status: CommissionStatus.APPROVED,
        payoutId: null
      }
    });

    if (approvedCommissions.length === 0) {
      return NextResponse.json({ error: "No available balance to withdraw (only approved commissions can be withdrawn)" }, { status: 400 });
    }

    // 3. Create the Payout
    const commissionIds = approvedCommissions.map(c => c.id);
    const payout = await createPayout(session.influencerId, commissionIds);

    return NextResponse.json({ success: true, payout });
  } catch (err: any) {
    console.error("Payout request error:", err);
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 });
  }
}
