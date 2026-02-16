// Simple seed script to create one demo store + admin
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.store.findFirst({
    where: { slug: 'ruvali-demo' }
  });
  if (existing) {
    console.log('Store ruvali-demo already exists, skipping seed.');
    return;
  }

  const hashed = await bcrypt.hash('admin123', 12);

  const store = await prisma.store.create({
    data: {
      name: 'RUVALI Demo Store',
      slug: 'ruvali-demo',
      whatsappNumber: '+919876543210',
      currency: 'INR',
      primaryColor: '#ff0000',
      secondaryColor: '#ffffff',
      themeMode: 'LIGHT',
      admins: {
        create: {
          email: 'admin@ruvali-demo.com',
          password: hashed
        }
      },
      categories: {
        create: [
          { name: 'DRUNKEN MONK PICKS' },
          { name: 'TRIPPERS PICKS' }
        ]
      }
    },
    include: { admins: true, categories: true }
  });

  console.log('Seeded store:', store.slug);
  console.log('Admin login: admin@ruvali-demo.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

