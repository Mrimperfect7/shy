import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SHYN.ISH luxury jewellery data...");

  // 1. Categories
  const categoriesData = [
    { name: "Necklaces & Chains", slug: "necklaces", description: "18K PVD gold plated chains, pendants, and layering necklaces designed for everyday shine." },
    { name: "Earrings & Hoops", slug: "earrings", description: "Minimalist studs, twisted hoops, and dainty huggies crafted from 316L hypoallergenic steel." },
    { name: "Rings & Bands", slug: "rings", description: "Stackable eternity bands, solitaire rings, and vintage signet styles under ₹480." },
    { name: "Bracelets & Bangles", slug: "bracelets", description: "Anti-tarnish tennis bracelets, cuffs, and Roman bangles for effortless wrist stacks." },
    { name: "Watches & Sets", slug: "watches-sets", description: "Curated jewellery gift sets and champagne mesh watches." },
    { name: "Gifting Experience", slug: "gifts", description: "Luxury packaging, velvet boxes, and thoughtful gifting sets for your loved ones." },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log("Categories created/updated.");

  // 2. Products with authentic SHYN.ISH Instagram prices
  const products = [
    {
      title: "Aura Interlocking 18K Pendant Necklace",
      slug: "aura-interlocking-18k-pendant-necklace",
      descriptionHtml: "<p>A signature SHYN.ISH piece. Featuring concentric interlocking rings with a brilliant-cut center solitaire stone that catches the light from every angle. Coated in durable 18K PVD Gold plating over medical-grade 316L stainless steel for an anti-tarnish finish that lasts through daily wear.</p><ul><li>18K PVD Gold Plating</li><li>316L Stainless Steel Core</li><li>Chain Length: 42cm + 5cm extension</li><li>Hypoallergenic & Nickel-Free</li><li>Water and sweat resistant</li></ul>",
      price: 480,
      compareAtPrice: 890,
      inventory: 45,
      status: "ACTIVE",
      imageUrls: ["/assets/products/necklace-pendant.jpg"],
      categoryId: categories["necklaces"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Chain: 42cm + 5cm extension · Pendant: 14mm",
      careInstructions: "Water-resistant everyday wear. Wipe dry after perfume or swimming for prolonged brilliance.",
    },
    {
      title: "Minimalist Solitaire Eternity Band Ring",
      slug: "minimalist-solitaire-eternity-band-ring",
      descriptionHtml: "<p>The everyday sparkle essential. Beautifully micro-faceted zirconia stones handset in a polished 18K gold-toned band. Perfect for stacking or wearing as an elegant standalone statement.</p>",
      price: 99,
      compareAtPrice: 249,
      inventory: 80,
      status: "ACTIVE",
      imageUrls: ["/assets/products/rings-stack.jpg"],
      categoryId: categories["rings"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Band width: 2mm · Sizes 6, 7, 8",
      careInstructions: "Resistant to water and soap. Keep in dry pouch when not worn.",
    },
    {
      title: "Luxe Twisted Gold Hoop Earrings",
      slug: "luxe-twisted-gold-hoop-earrings",
      descriptionHtml: "<p>A timeless French-inspired twisted croissant hoop. Lightweight and designed for all-day comfort without pulling the lobe.</p>",
      price: 185,
      compareAtPrice: 399,
      inventory: 60,
      status: "ACTIVE",
      imageUrls: ["/assets/products/earrings-hoops.jpg"],
      categoryId: categories["earrings"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Diameter: 22mm · Thickness: 3.5mm",
      careInstructions: "Clean with a soft microfiber cloth. Avoid direct contact with bleach.",
    },
    {
      title: "Celestial Star Herringbone Chain",
      slug: "celestial-star-herringbone-chain",
      descriptionHtml: "<p>Silky, liquid-gold drape that hugs the collarbone with effortless luxury. The flat herringbone weave reflects light with a mirror-like shine.</p>",
      price: 199,
      compareAtPrice: 449,
      inventory: 50,
      status: "ACTIVE",
      imageUrls: ["/assets/products/necklace-pendant.jpg"],
      categoryId: categories["necklaces"],
      material: "304 Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Length: 40cm + 5cm · Width: 3mm",
      careInstructions: "Store flat in your SHYN.ISH pouch to prevent kinking.",
    },
    {
      title: "Petite Clover Huggie Earrings",
      slug: "petite-clover-huggie-earrings",
      descriptionHtml: "<p>Delicate four-leaf clover motif huggies symbolizing good fortune and everyday grace. Click-latch closure for security.</p>",
      price: 185,
      compareAtPrice: 349,
      inventory: 75,
      status: "ACTIVE",
      imageUrls: ["/assets/products/earrings-hoops.jpg"],
      categoryId: categories["earrings"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Inner diameter: 10mm · Motif: 6mm",
      careInstructions: "Gentle soap and lukewarm water safe.",
    },
    {
      title: "Roman Numeral Luxury Bangle",
      slug: "roman-numeral-luxury-bangle",
      descriptionHtml: "<p>Engraved with classic Roman numerals and bezel-set crystal accents. Features an invisible click-lock hinge mechanism.</p>",
      price: 480,
      compareAtPrice: 850,
      inventory: 35,
      status: "ACTIVE",
      imageUrls: ["/assets/products/rings-stack.jpg"],
      categoryId: categories["bracelets"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Inner circumference: 17cm (Fits standard wrists)",
      careInstructions: "Anti-tarnish, anti-corrosion stainless steel.",
    },
    {
      title: "Classic Champagne Mesh Watch",
      slug: "classic-champagne-mesh-watch",
      descriptionHtml: "<p>Ultra-slim minimalist quartz timepiece featuring a sunray champagne dial and an easily adjustable magnetic gold mesh band.</p>",
      price: 690,
      compareAtPrice: 1299,
      inventory: 20,
      status: "ACTIVE",
      imageUrls: ["/assets/products/necklace-pendant.jpg"],
      categoryId: categories["watches-sets"],
      material: "Stainless Steel Case & Mesh Band",
      plating: "18K PVD Gold Finish",
      dimensions: "Dial: 28mm · Strap width: 12mm",
      careInstructions: "Splash resistant 3ATM. Keep away from hot showers.",
    },
    {
      title: "The Signature 3-Piece Everyday Shine Set",
      slug: "the-signature-3-piece-everyday-shine-set",
      descriptionHtml: "<p>The ultimate curated jewellery stack. Includes the Aura Interlocking Pendant Necklace, Twisted Hoops, and Solitaire Eternity Ring packaged together in our luxury gift box.</p>",
      price: 690,
      compareAtPrice: 1499,
      inventory: 30,
      status: "ACTIVE",
      imageUrls: ["/assets/products/necklace-pendant.jpg", "/assets/products/rings-stack.jpg"],
      categoryId: categories["watches-sets"],
      material: "316L Stainless Steel",
      plating: "18K PVD Gold",
      dimensions: "Complete matching 3-piece set",
      careInstructions: "Includes 3 individual protective pouches and gift box.",
    },
    {
      title: "Luxury Velvet Gifting Box & Pouch",
      slug: "luxury-velvet-gifting-box-pouch",
      descriptionHtml: "<p>Signature matte black presentation box with gold foil lettering, padded velvet cushion, and anti-tarnish storage pouch.</p>",
      price: 99,
      compareAtPrice: 199,
      inventory: 100,
      status: "ACTIVE",
      imageUrls: ["/assets/products/necklace-pendant.jpg"],
      categoryId: categories["gifts"],
      material: "Premium Hardboard, Velvet, Microfiber",
      plating: "Gold Foil Stamp",
      dimensions: "8cm x 8cm x 4cm",
      careInstructions: "Keep in a dry environment.",
    }
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }
  console.log("Products seeded successfully.");

  // 3. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      announcementText: "FREE ALL-INDIA DELIVERY · JEWELLERY UNDER ₹480 · 18K PVD GOLD PLATED",
      announcementEnabled: true,
      codEnabled: false,
      whatsappNumber: "919876543210",
      instagramHandle: "shyn.ish",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
    },
    create: {
      id: "singleton",
      announcementText: "FREE ALL-INDIA DELIVERY · JEWELLERY UNDER ₹480 · 18K PVD GOLD PLATED",
      announcementEnabled: true,
      codEnabled: false,
      whatsappNumber: "919876543210",
      instagramHandle: "shyn.ish",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
    },
  });
  console.log("SiteSettings updated.");

  // 4. Instagram UGC Reels
  const reels = [
    {
      id: "reel-1",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
      title: "Unboxing our ₹199 Herringbone Chain ✨",
      description: "Real person demonstration - water-resistant 18K PVD gold shine on skin.",
      thumbnailUrl: "/assets/products/necklace-pendant.jpg",
      displayOrder: 1,
      isPublished: true,
      isFeatured: true,
    },
    {
      id: "reel-2",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
      title: "How I stack my rings for daily office wear 💍",
      description: "Under ₹99 & ₹199 stack that won't turn your finger green.",
      thumbnailUrl: "/assets/products/rings-stack.jpg",
      displayOrder: 2,
      isPublished: true,
      isFeatured: true,
    },
    {
      id: "reel-3",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
      title: "Twisted Hoops vs Everyday Outfits ✨",
      description: "The ₹185 staple earrings you will never take off.",
      thumbnailUrl: "/assets/products/earrings-hoops.jpg",
      displayOrder: 3,
      isPublished: true,
      isFeatured: true,
    },
    {
      id: "reel-4",
      instagramUrl: "https://www.instagram.com/shyn.ish/",
      title: "Gift unboxing with our signature velvet box 🎁",
      description: "Best affordable gift under ₹480 with all India delivery.",
      thumbnailUrl: "/assets/products/necklace-pendant.jpg",
      displayOrder: 4,
      isPublished: true,
      isFeatured: true,
    }
  ];

  for (const reel of reels) {
    await prisma.instagramReel.upsert({
      where: { id: reel.id },
      update: reel,
      create: reel,
    });
  }
  console.log("Instagram reels seeded.");

  console.log("All SHYN.ISH seed data successfully loaded into database!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
