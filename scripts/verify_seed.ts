import { randomUUID } from "crypto";
import { Client } from "pg";
import { existsSync, readFileSync } from "fs";

const loadEnv = (path: string) => {
  if (!existsSync(path)) return;
  const contents = readFileSync(path, "utf8");
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

loadEnv(".env");

const resolveUrl = () => {
  const cliUrl = process.env.PRISMA_CLI_DATABASE_URL;
  const dbUrl = process.env.DATABASE_URL;
  if (cliUrl) return cliUrl;
  if (dbUrl) return dbUrl;
  throw new Error("Missing database URL");
};

const withClient = async <T>(fn: (client: Client) => Promise<T>) => {
  const rawUrl = resolveUrl();
  const needsSsl = /sslmode=require|verify-full|verify-ca/.test(rawUrl);
  const cleanedUrl = rawUrl.replace(/sslmode=[^&]+&?/, "").replace(/[?&]$/, "");
  const client = new Client({
    connectionString: cleanedUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 30_000,
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
};

const TEST_EMAIL = "test.user@example.com";
const TEST_NAME = "Test User";
const TEST_CATEGORY = "General";
const TEST_TITLE = "Test Prompt";
const TEST_CONTENT = "This is a test prompt for verification.";

const main = async () => {
  await withClient(async (client) => {
    const userInsert = await client.query(
      'INSERT INTO "User" ("id", "email", "name") VALUES ($1, $2, $3) ON CONFLICT ("email") DO UPDATE SET "name" = EXCLUDED."name" RETURNING "id"',
      [randomUUID(), TEST_EMAIL, TEST_NAME]
    );
    const userId: string = userInsert.rows[0].id;

    const categoryInsert = await client.query(
      'INSERT INTO "Category" ("id", "category") VALUES ($1, $2) ON CONFLICT ("category") DO UPDATE SET "category" = EXCLUDED."category" RETURNING "id"',
      [randomUUID(), TEST_CATEGORY]
    );
    const categoryId: string = categoryInsert.rows[0].id;

    const existingRoute = await client.query(
      'SELECT "id" FROM "Trip_Route" WHERE "ownerId" = $1 AND "title" = $2 LIMIT 1',
      [userId, TEST_TITLE]
    );

    let routeId = "";
    const now = new Date();
    if ((existingRoute.rowCount ?? 0) > 0) {
      routeId = existingRoute.rows[0].id;
      await client.query(
        'UPDATE "Trip_Route" SET "content" = $1, "visibility" = $2, "publishedAt" = $3, "categoryId" = $4, "updatedAt" = $5 WHERE "id" = $6',
        [TEST_CONTENT, "PUBLIC", now, categoryId, now, routeId]
      );
    } else {
      routeId = randomUUID();
      await client.query(
        'INSERT INTO "Trip_Route" ("id", "ownerId", "title", "content", "categoryId", "visibility", "createdAt", "updatedAt", "publishedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [routeId, userId, TEST_TITLE, TEST_CONTENT, categoryId, "PUBLIC", now, now, now]
      );
    }

    await client.query(
      'INSERT INTO "Vote" ("id", "userId", "routeId", "value") VALUES ($1, $2, $3, $4) ON CONFLICT ("userId", "routeId") DO UPDATE SET "value" = EXCLUDED."value"',
      [randomUUID(), userId, routeId, 1]
    );
  });
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
