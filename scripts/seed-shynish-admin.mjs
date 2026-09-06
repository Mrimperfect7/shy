import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  
  // Remove unwanted admin accounts
  try {
    const deleted = await prisma.user.deleteMany({
      where: {
        email: {
          not: "admin@shynish.com",
        },
      },
    });
    console.log(`Removed ${deleted.count} legacy admin account(s).`);
  } catch (err) {
    console.warn("Could not delete legacy accounts from database:", err.message);
  }

  // Ensure SHYN.ISH admin account
  const email = "admin@shynish.com";
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: "SUPERADMIN", isActive: true },
    create: {
      email,
      name: "SHYN.ISH Admin",
      passwordHash: hash,
      role: "SUPERADMIN",
      isActive: true,
    },
  });
  console.log(`SHYN.ISH Admin account active: ${email}`);
}

main().finally(() => prisma.$disconnect());
