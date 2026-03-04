import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data to ensure a clean state for mandatory fields
  await prisma.user.deleteMany({});
  
  const admin = await prisma.user.upsert({
    where: { email: "rahmatdeep@gmail.com" },
    update: {},
    create: {
      email: "rahmatdeep@gmail.com",
      name: "Rahmatdeep",
      role: "ADMIN",
      lawyerId: "ADM/001/2026", // Default ID for admin
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
