import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address.");
    console.error("Usage: npx tsx scripts/make-superadmin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    console.error(`User not found with email: ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role: "SUPERADMIN" },
  });

  console.log(`Successfully elevated ${email} to SUPERADMIN.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
