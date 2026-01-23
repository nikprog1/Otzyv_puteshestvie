import { Client } from "pg";

export type Target = "local" | "prod";

const resolveUrl = (target: Target) => {
  const local = process.env.LOCAL_DATABASE_URL;
  const prod = process.env.PROD_DATABASE_URL;
  const cli = process.env.PRISMA_CLI_DATABASE_URL;

  let url = target === "local" ? local : prod;
  if (
    target === "local" &&
    url &&
    url.includes("pooler.supabase.com:6543") &&
    cli
  ) {
    url = cli;
  }
  if (!url) {
    throw new Error(`${target.toUpperCase()}_DATABASE_URL is not set.`);
  }

  return url;
};

export const withDbClient = async <T>(
  target: Target,
  fn: (client: Client) => Promise<T>
) => {
  const rawUrl = resolveUrl(target);
  const url = new URL(rawUrl);
  const sslMode = url.searchParams.get("sslmode");
  const needsInsecureSsl =
    sslMode === "require" || sslMode === "verify-full" || sslMode === "verify-ca";

  if (needsInsecureSsl) {
    url.searchParams.delete("sslmode");
  }

  const connectionString = url.toString();
  const ssl = needsInsecureSsl ? { rejectUnauthorized: false } : undefined;

  const client = new Client({
    connectionString,
    ssl,
    connectionTimeoutMillis: 30_000,
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
};
