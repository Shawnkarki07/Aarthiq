import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@gmail.com';
    const password = 'aarthiq';
    const username = 'Admin';

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('Admin with this email already exists!');
      return;
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        username,
        isActive: true
      }
    });

    console.log('Admin created successfully!');
    console.log({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      isActive: admin.isActive
    });

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
