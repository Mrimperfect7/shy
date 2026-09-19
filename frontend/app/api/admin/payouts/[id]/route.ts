import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markPayoutPaid } from "@/services/influencerService";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const params = await props.params;
    const payout = await markPayoutPaid(params.id);
    
    return NextResponse.json({ success: true, payout });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to mark payout as paid" }, { status: 500 });
  }
}
