import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (err) {
    console.error("Auth session error:", err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
