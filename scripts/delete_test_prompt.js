/**
 * Удаляет из БД маршруты с названием "Test Prompt".
 * Запуск: node scripts/delete_test_prompt.js
 */
const { Client } = require("pg");
const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

function loadEnv(path) {
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
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

const rootDir = join(__dirname, "..");
loadEnv(join(rootDir, ".env"));

const url =
  process.env.PRISMA_CLI_DATABASE_URL ||
  process.env.DATABASE_URL ||
  (() => {
    throw new Error("PRISMA_CLI_DATABASE_URL или DATABASE_URL не задан");
  })();

async function main() {
  const needsSsl = /sslmode=require|verify-full|verify-ca/i.test(url);
  const connectionString = url
    .replace(/sslmode=[^&]+&?/gi, "")
    .replace(/[?&]$/, "");

  const client = new Client({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 30_000,
  });

  try {
    await client.connect();
    const res = await client.query(
      'DELETE FROM "Trip_Route" WHERE "title" = $1 RETURNING "id"',
      ["Test Prompt"]
    );
    const count = res.rowCount ?? 0;
    console.log(count > 0 ? `Удалено записей: ${count}` : "Записей с названием «Test Prompt» не найдено.");
  } catch (e) {
    console.error("Ошибка:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
