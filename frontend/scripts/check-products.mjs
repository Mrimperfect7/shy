import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true, price: true }
  });
  console.log("Remaining products in DB:");
  console.table(products);
}

check().finally(() => prisma.$disconnect());
