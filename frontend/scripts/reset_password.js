const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@shynish.com";
  const password = "password123";
  
  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: "SUPERADMIN", isActive: true }
    });
    console.log(`Password reset for ${email} to ${password} and elevated to SUPERADMIN.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: "Admin",
        passwordHash,
        role: "SUPERADMIN",
        isActive: true
      }
    });
    console.log(`Account created for ${email} with password ${password} and SUPERADMIN privileges.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
