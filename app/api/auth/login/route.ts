import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { influencer: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role === "SUPERADMIN" && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Superadmin access is disabled in production" }, { status: 403 });
    }

    const token = await createSession({
      userId: user.id,
      role: user.role,
      influencerId: user.influencer?.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    const redirectPath = (user.role === "ADMIN" || user.role === "SUPERADMIN") ? "/admin" : user.role === "INFLUENCER" ? "/influencer" : "/account";

    return NextResponse.json({ 
      success: true, 
      role: user.role, 
      name: user.name,
      redirect: redirectPath
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
