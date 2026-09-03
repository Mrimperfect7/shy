import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ─── GET /api/reviews?productId=xxx ────────────────────────────────── */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reviewerName: true,
        rating: true,
        title: true,
        body: true,
        createdAt: true,
      },
    });

    const stats =
      reviews.length > 0
        ? {
            avg: parseFloat(
              (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            ),
            count: reviews.length,
            distribution: [5, 4, 3, 2, 1].map((star) => ({
              star,
              count: reviews.filter((r) => r.rating === star).length,
            })),
          }
        : { avg: 0, count: 0, distribution: [] };

    return NextResponse.json({ reviews, stats });
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ─── POST /api/reviews ──────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, reviewerName, email, rating, title, reviewBody } = body;

    if (!productId || !reviewerName || !email || !rating || !title || !reviewBody) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        reviewerName: reviewerName.trim(),
        email: email.trim().toLowerCase(),
        rating: ratingNum,
        title: title.trim(),
        body: reviewBody.trim(),
        status: "PENDING", // Needs admin approval
      },
    });

    return NextResponse.json(
      { success: true, message: "Review submitted! It will appear after moderation.", id: review.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
