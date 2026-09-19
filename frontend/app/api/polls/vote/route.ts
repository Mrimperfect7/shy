import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { optionId } = await request.json();

    if (!optionId) {
      return NextResponse.json({ error: "Option ID required" }, { status: 400 });
    }

    // Increment votes safely
    await prisma.pollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Poll vote error:", err);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
