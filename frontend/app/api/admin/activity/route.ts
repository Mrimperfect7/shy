import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSuperAdmin();

    const logs = await prisma.adminActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (err: any) {
    if (err.message === "Unauthorized" || err.message.includes("disabled in production")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
