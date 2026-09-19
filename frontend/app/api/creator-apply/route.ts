import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, instagramHandle, followerCount, niche, phone, message } = body;

    if (!name || !email || !instagramHandle || !followerCount || !niche) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await prisma.influencerApplication.create({
      data: { name, email: email.toLowerCase(), instagramHandle, followerCount, niche, phone, message },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Creator apply error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
