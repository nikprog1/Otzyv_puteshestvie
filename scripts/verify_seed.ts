import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test.user@example.com" },
    update: {},
    create: {
      email: "test.user@example.com",
      name: "Test User",
    },
  });

  const category = await prisma.category.upsert({
    where: { category: "General" },
    update: {},
    create: { category: "General" },
  });

  const route = await prisma.trip_Route.create({
    data: {
      ownerId: user.id,
      categoryId: category.id,
      title: "Test Prompt",
      content: "This is a test prompt for verification.",
      visibility: Visibility.PUBLIC,
      publishedAt: new Date(),
    },
  });

  await prisma.vote.upsert({
    where: {
      userId_routeId: {
        userId: user.id,
        routeId: route.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      routeId: route.id,
      value: 1,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
