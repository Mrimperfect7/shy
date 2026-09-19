import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@shynish.com';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: 'SUPERADMIN' },
    create: {
      email,
      name: 'Eshara Admin',
      passwordHash: hash,
      role: 'SUPERADMIN',
      isActive: true,
    }
  });
  console.log('Admin account ready:');
  console.log('Email:', user.email);
  console.log('Password:', password);
}
main().finally(() => prisma.$disconnect());
