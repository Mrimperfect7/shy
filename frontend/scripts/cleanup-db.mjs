import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Starting cleanup of SHYN.ISH products from shared DB...");

  const shynishSlugs = [
    "minimalist-solitaire-eternity-band",
    "luxe-twisted-croissant-hoops",
    "liquid-gold-herringbone-chain",
    "lucky-four-leaf-clover-huggies",
    "aura-interlocking-18k-gold-pendant",
    "classic-roman-numeral-cuff-bangle",
    "classic-champagne-mesh-watch",
    "shynish-signature-velvet-gift-box",
    "anti-tarnish-daily-wear-gift-set",
  ];

  for (const slug of shynishSlugs) {
    const prod = await prisma.product.findUnique({ where: { slug } });
    if (prod) {
      await prisma.review.deleteMany({ where: { productId: prod.id } });
      await prisma.orderItem.deleteMany({ where: { productId: prod.id } });
      await prisma.product.delete({ where: { id: prod.id } });
      console.log(`Deleted product: ${slug}`);
    }
  }

  const shynishCategories = [
    "necklaces",
    "earrings",
    "rings",
    "bracelets",
    "watches-sets",
    "gifts",
  ];

  for (const catSlug of shynishCategories) {
    const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (cat) {
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`Deleted category: ${catSlug}`);
    }
  }

  const deletedReels = await prisma.instagramReel.deleteMany({
    where: {
      instagramUrl: { contains: "shyn.ish" }
    }
  });
  console.log(`Deleted ${deletedReels.count} SHYN.ISH reels`);

  try {
    await prisma.homepageSection.deleteMany({
      where: {
        sectionKey: { in: ["hero", "gifting"] }
      }
    });
    console.log("Deleted SHYN.ISH homepage sections");
  } catch (e) {
    console.log("HomepageSection cleanup skipped");
  }

  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (settings && settings.instagramHandle === "shyn.ish") {
      await prisma.siteSettings.update({
        where: { id: "singleton" },
        data: {
          announcementText: "100% PURE AYURVEDIC HERBAL FORMULATION · HANDCRAFTED IN KERALA · FREE DELIVERY ACROSS INDIA",
          announcementEnabled: true,
          codEnabled: true,
          whatsappNumber: "919048995577",
          instagramHandle: "shyn.ish",
          instagramUrl: "https://www.instagram.com/shyn.ish",
        }
      });
      console.log("Restored Eshara Naturals siteSettings");
    }
  } catch (e) {
    console.log("siteSettings restore skipped");
  }

  console.log("Cleanup completed successfully!");
}

cleanup()
  .catch((e) => console.error("Error during cleanup:", e))
  .finally(() => prisma.$disconnect());
