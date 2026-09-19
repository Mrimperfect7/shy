import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // findUnique + update/create instead of upsert to avoid PgBouncer
    // prepared-statement conflicts (code 42P05) on Supabase pooler.
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { isActive: true },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email: normalizedEmail },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
