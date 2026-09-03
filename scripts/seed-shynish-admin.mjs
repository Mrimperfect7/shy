import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  
  for (const email of ["admin@shynish.com", "crzmik@gmail.com"]) {
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
    console.log(`Admin account created: ${email}`);
  }
}

main().finally(() => prisma.$disconnect());
