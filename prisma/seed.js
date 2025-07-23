// prisma/seed.js
const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('password456', 10);

  await prisma.user.createMany({
    data: [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: password1
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: password2
      }
    ],
    skipDuplicates: true
  });

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });