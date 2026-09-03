import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (code) {
    // Validate that the code exists
    const profile = await prisma.customerReferralProfile.findUnique({
      where: { referralCode: code.toUpperCase() },
    });

    if (profile) {
      // Set a cookie that expires in 30 days
      const cookieStore = await cookies();
      cookieStore.set("eshara_referral", profile.referralCode, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // Redirect to home page or register page
  // Redirecting to home page is friendlier, they can explore products
  return NextResponse.redirect(new URL("/", request.url));
}
