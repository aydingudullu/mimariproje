
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing users
    await prisma.users.deleteMany({});
    console.log('Cleared existing users');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.users.create({
      data: {
        email: 'admin@example.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        user_type: 'individual',
        is_active: true,
        is_verified: true,
        company_name: 'Mimariproje Admin',
        profession: 'System Admin',
        phone: '+90 555 555 55 55',
        location: 'Istanbul, Turkey',
      },
    });

    console.log('Created test user:', user.email);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
