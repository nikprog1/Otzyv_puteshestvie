/**
 * Выполняет миграцию 20260221130000_add_like вручную через pg (session pooler).
 * Запуск: node scripts/run_migration_add_like.js
 */
const { Client } = require("pg");
const { readFileSync, existsSync } = require("fs");
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

  const migrationPath = join(
    rootDir,
    "prisma",
    "migrations",
    "20260221130000_add_like",
    "migration.sql"
  );
  const sql = readFileSync(migrationPath, "utf8");

  try {
    await client.connect();
    console.log("Подключение к БД (session pooler)...");

    const tableExists = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Like'
    `);
    if (tableExists.rows.length > 0) {
      console.log("Таблица Like уже существует, миграция пропущена.");
      return;
    }

    await client.query(sql);
    console.log("Миграция 20260221130000_add_like выполнена успешно.");
  } catch (e) {
    console.error("Ошибка:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
