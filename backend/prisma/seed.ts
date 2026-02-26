import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: 'rahmatdeep@gmail.com' },
        update: {},
        create: {
            email: 'rahmatdeep@gmail.com',
            name: 'Rahmatdeep',
            role: 'ADMIN',
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
