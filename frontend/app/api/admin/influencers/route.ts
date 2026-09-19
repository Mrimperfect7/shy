import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getInfluencers, createInfluencer, updateInfluencer } from "@/services/influencerService";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireAdmin();
    const influencers = await getInfluencers();
    return NextResponse.json({ influencers });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Failed to fetch influencers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name, email, password, instagramHandle, phone, commissionRate } = await request.json();

    if (!name || !email || !password || !commissionRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await createInfluencer({
      name, email, passwordHash, instagramHandle, phone,
      commissionRate: parseFloat(commissionRate),
    });

    return NextResponse.json({ influencer: result.influencer }, { status: 201 });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (err.code === "P2002") return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create influencer" }, { status: 500 });
  }
}
