import { NextResponse } from "next/server";

import { withDbClient } from "@/lib/dbClient";

export const runtime = "nodejs";

const parseTarget = (value: string | null) => {
  if (value === "local" || value === "prod") {
    return value;
  }
  return null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = parseTarget(searchParams.get("target"));

  if (!target) {
    return NextResponse.json(
      { error: "Invalid target. Use local or prod." },
      { status: 400 }
    );
  }

  const tables = await withDbClient(target, async (client) => {
    const result = await client.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    return result.rows;
  });

  return NextResponse.json({ tables: tables.map((t) => t.table_name) });
}
