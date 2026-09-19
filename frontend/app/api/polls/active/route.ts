import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const activePoll = await prisma.poll.findFirst({
      where: { isActive: true },
      include: {
        options: {
          select: { id: true, text: true } // Don't expose vote counts to clients before they vote if not needed, or do it anyway
        }
      }
    });

    if (!activePoll) {
      return NextResponse.json({ poll: null });
    }

    return NextResponse.json({ poll: activePoll });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}
