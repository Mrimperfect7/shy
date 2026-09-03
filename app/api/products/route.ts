import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "";
  const q = searchParams.get("q") || "";

  let orderBy: any = { createdAt: 'desc' };

  switch (sort) {
    case "PRICE_ASC":
      orderBy = { price: 'asc' };
      break;
    case "PRICE_DESC":
      orderBy = { price: 'desc' };
      break;
    case "CREATED_AT_DESC":
      orderBy = { createdAt: 'desc' };
      break;
  }

  let whereClause: any = { status: "ACTIVE" };
  if (q) {
    whereClause.title = { contains: q, mode: 'insensitive' };
  }
  const slugs = searchParams.get("slugs");
  if (slugs) {
    const list = slugs.split(",").map(s => s.trim()).filter(Boolean);
    if (list.length > 0) {
      whereClause.slug = { in: list };
    }
  }

  try {
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy
    });
    
    const offer = await prisma.offerSettings.findUnique({ where: { id: "singleton" } });

    // Format to match the previous NormalizedProduct type so the frontend doesn't break too much yet
    const normalizedProducts = products.map(p => {
      let finalPrice = p.price;
      let finalCompareAtPrice = p.compareAtPrice;

      if (offer?.isActive && (offer.href.includes(p.slug) || offer.href.includes("shop"))) {
        finalPrice = offer.salePrice;
        finalCompareAtPrice = offer.originalPrice;
      }

      return {
        id: p.id,
        handle: p.slug,
        slug: p.slug,
        title: p.title,
        description: p.descriptionHtml.replace(/<[^>]*>?/gm, ''),
        descriptionHtml: p.descriptionHtml,
        price: finalPrice,
        compareAtPrice: finalCompareAtPrice ? finalCompareAtPrice : null,
        featuredImage: p.imageUrls.length > 0 ? { url: p.imageUrls[0], altText: p.title } : null,
        images: p.imageUrls.map(url => ({ url, altText: p.title })),
        imageUrls: p.imageUrls,
        material: p.material,
        plating: p.plating,
        availableForSale: p.inventory > 0,
        variants: [{ id: p.id }]
      };
    });

    return NextResponse.json({ 
      products: normalizedProducts,
      pageInfo: { hasNextPage: false, endCursor: null } // No pagination for now
    });
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json({ products: [], pageInfo: { hasNextPage: false, endCursor: null } });
  }
}
