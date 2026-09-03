import { PrismaClient } from "@prisma/client";

const esharaUrl = "postgresql://postgres.welhclayqtfwjetqezay:athulanjana%4010@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
const shynishUrl = "postgresql://postgres:Shyy%401019aa@db.ylznekzbklmszbxloxqy.supabase.co:5432/postgres";

async function verify() {
  console.log("=== CHECKING ESHARA NATURALS DATABASE (welhclayqtfwjetqezay) ===");
  const esharaPrisma = new PrismaClient({ datasources: { db: { url: esharaUrl } } });
  try {
    const esharaProducts = await esharaPrisma.product.findMany({ select: { title: true, price: true } });
    console.log(`Eshara DB Products count: ${esharaProducts.length}`);
    console.table(esharaProducts);
  } finally {
    await esharaPrisma.$disconnect();
  }

  console.log("\n=== CHECKING SHYN.ISH DATABASE (ylznekzbklmszbxloxqy) ===");
  const shynishPrisma = new PrismaClient({ datasources: { db: { url: shynishUrl } } });
  try {
    const shynishProducts = await shynishPrisma.product.findMany({ select: { title: true, price: true } });
    console.log(`SHYN.ISH DB Products count: ${shynishProducts.length}`);
    console.table(shynishProducts);
  } finally {
    await shynishPrisma.$disconnect();
  }
}

verify();
