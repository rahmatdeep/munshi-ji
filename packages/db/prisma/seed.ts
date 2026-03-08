import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "japsehajlegal@gmail.com" },
    update: {
      name: "Japsehaj Singh",
      lawyerId: "PH-3348-2022",
      role: "ADMIN",
    },
    create: {
      email: "japsehajlegal@gmail.com",
      name: "Japsehaj Singh",
      lawyerId: "PH-3348-2022",
      role: "ADMIN",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "rahmatdeep@gmail.com" },
    update: {
      name: "Rahmatdeep",
      lawyerId: "PH-1234-2023", // Random ID
      role: "ADMIN",
    },
    create: {
      email: "rahmatdeep@gmail.com",
      name: "Rahmatdeep",
      lawyerId: "PH-1234-2023",
      role: "ADMIN",
    },
  });
  const user3 = await prisma.user.upsert({
    where: { email: "falguni4782@gmail.com" },
    update: {
      name: "Falguni",
      lawyerId: "RJ-1234-2023", // Random ID
      role: "ADMIN",
    },
    create: {
      email: "falguni4782@gmail.com",
      name: "Falguni",
      lawyerId: "RJ-1234-2023",
      role: "ADMIN",
    },
  });

  console.log("Seeded users:", { admin, user3 });

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
