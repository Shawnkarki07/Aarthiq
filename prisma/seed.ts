import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed Business Categories
  console.log('🏢 Seeding business categories...');
  const categories = [
    {
      name: 'Tech Company',
      slug: 'tech',
      description: 'Technology and software companies',
    },
    {
      name: 'Hydropower',
      slug: 'hydropower',
      description: 'Hydropower and renewable energy',
    },
    {
      name: 'Fintech',
      slug: 'fintech',
      description: 'Financial technology companies',
    },
    {
      name: 'Edtech',
      slug: 'edtech',
      description: 'Education technology companies',
    },
    {
      name: 'Manufacturing',
      slug: 'manufacturing',
      description: 'Manufacturing and production',
    },
    {
      name: 'Tourism & Hospitality',
      slug: 'tourism',
      description: 'Tourism, hotels, and hospitality',
    },
    {
      name: 'Agriculture',
      slug: 'agriculture',
      description: 'Agriculture and agribusiness',
    },
    {
      name: 'Real Estate',
      slug: 'real-estate',
      description: 'Real estate and construction',
    },
    {
      name: 'Healthcare',
      slug: 'healthcare',
      description: 'Healthcare and medical services',
    },
    {
      name: 'Food & Beverage',
      slug: 'food-beverage',
      description: 'Food and beverage industry',
    },
    {
      name: 'Retail',
      slug: 'retail',
      description: 'Retail and e-commerce',
    },
    {
      name: 'Others',
      slug: 'others',
      description: 'Other industries',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} business categories`);

  // Seed Admin User
  console.log('👤 Seeding admin user...');
  const adminEmail = 'admin@capitalbridge.com';
  const adminPassword = 'Admin@123'; // Default admin password

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        username: 'Admin',
        isActive: true
      }
    });
    console.log('✅ Admin user created');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
