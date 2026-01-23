const fs = require("fs");
const crypto = require("crypto");
const { Client } = require("pg");

const migrationName = "20260121120000_add_category_unique";
const migrationPath = "prisma/migrations/20260121120000_add_category_unique/migration.sql";

const loadEnv = (path) => {
  if (!fs.existsSync(path)) return;
  const contents = fs.readFileSync(path, "utf8");
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

const sql = fs.readFileSync(migrationPath, "utf8");
const checksum = crypto.createHash("sha256").update(sql).digest("hex");
const rawUrl =
  process.env.PRISMA_CLI_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.LOCAL_DATABASE_URL;

if (!rawUrl) {
  throw new Error("Missing database URL");
}

const needsSsl = /sslmode=require|verify-full|verify-ca/.test(rawUrl);
const cleanedUrl = rawUrl.replace(/sslmode=[^&]+&?/, "").replace(/[?&]$/, "");

const client = new Client({
  connectionString: cleanedUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

const ensureMigration = async () => {
  await client.connect();

  const idx = await client.query(
    "SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='Category_category_key'"
  );
  if (idx.rowCount === 0) {
    await client.query(sql);
  }

  const existing = await client.query(
    'SELECT 1 FROM "_prisma_migrations" WHERE migration_name=$1',
    [migrationName]
  );
  if (existing.rowCount === 0) {
    const now = new Date();
    await client.query(
      'INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [crypto.randomUUID(), checksum, now, migrationName, null, null, now, 1]
    );
  }
};

ensureMigration()
  .then(() => {
    console.log("Migration applied and recorded.");
  })
  .finally(async () => {
    await client.end();
  })
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
