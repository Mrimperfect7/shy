import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateInfluencer } from "@/services/influencerService";
import { prisma } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const influencer = await updateInfluencer(id, body);
    return NextResponse.json({ influencer });
  } catch (err: any) {
    console.error(err);
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to update influencer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    // Check for existing attributions
    const attributions = await prisma.orderAttribution.count({ where: { influencerId: id } });
    if (attributions > 0) {
       // Just deactivate them if they have orders
       await updateInfluencer(id, { isActive: false });
       return NextResponse.json({ message: "Influencer deactivated due to existing orders" });
    }

    const influencer = await prisma.influencer.findUnique({ where: { id } });
    if (!influencer) {
       return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: influencer.userId } });
    
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err: any) {
    console.error(err);
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete influencer" }, { status: 500 });
  }
}
