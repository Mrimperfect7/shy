import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;

    if (session.userId === id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const { isActive, password } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password) {
      if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    if (err.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
