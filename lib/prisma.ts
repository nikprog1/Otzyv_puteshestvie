// Локально: если DATABASE_URL указывает на transaction pooler (6543), использовать
// session pooler (PRISMA_CLI_DATABASE_URL, порт 5432), иначе Prisma не достучится до БД.
if (
  process.env.NODE_ENV === "development" &&
  process.env.PRISMA_CLI_DATABASE_URL &&
  process.env.DATABASE_URL?.includes("pooler.supabase.com:6543")
) {
  process.env.DATABASE_URL = process.env.PRISMA_CLI_DATABASE_URL;
}

type PrismaClientType = import("@prisma/client").PrismaClient;
const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
