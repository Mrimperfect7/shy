import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }
  });
  console.log("Admins:");
  admins.forEach(a => console.log(a.email, a.role));
}
main().finally(() => prisma.$disconnect());
