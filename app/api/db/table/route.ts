import { NextResponse } from "next/server";

import { withDbClient } from "@/lib/dbClient";

export const runtime = "nodejs";

const parseTarget = (value: string | null) => {
  if (value === "local" || value === "prod") {
    return value;
  }
  return null;
};

const isSafeIdentifier = (value: string) => /^[A-Za-z0-9_]+$/.test(value);

const quoteIdent = (value: string) => `"${value.replace(/"/g, '""')}"`;

const parsePagination = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = parseTarget(searchParams.get("target"));
  const table = searchParams.get("name");

  if (!target) {
    return NextResponse.json(
      { error: "Invalid target. Use local or prod." },
      { status: 400 }
    );
  }
  if (!table || !isSafeIdentifier(table)) {
    return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
  }

  const page = parsePagination(searchParams.get("page"), 1);
  const pageSize = parsePagination(searchParams.get("pageSize"), 10);
  const offset = (page - 1) * pageSize;

  const result = await withDbClient(target, async (client) => {
    const columnsResult = await client.query<{
      column_name: string;
      data_type: string;
    }>(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    const columns = columnsResult.rows;

    const pkColumnsResult = await client.query<{ column_name: string }>(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = $1
         AND tc.constraint_type = 'PRIMARY KEY'
       ORDER BY kcu.ordinal_position`,
      [table]
    );
    const pkColumns = pkColumnsResult.rows;

    const orderBy =
      pkColumns[0]?.column_name ?? columns[0]?.column_name ?? undefined;
    const orderBySql = orderBy ? `ORDER BY ${quoteIdent(orderBy)}` : "";

    const dataQuery = `SELECT * FROM ${quoteIdent(table)} ${orderBySql} LIMIT $1 OFFSET $2`;
    const rowsResult = await client.query<Record<string, unknown>>(dataQuery, [
      pageSize,
      offset,
    ]);
    const rows = rowsResult.rows;

    const totalResult = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${quoteIdent(table)}`
    );
    const total = Number(totalResult.rows[0]?.count ?? "0");

    return { columns, pkColumns, rows, total };
  });

  return NextResponse.json({
    table,
    columns: result.columns,
    primaryKeys: result.pkColumns.map((c) => c.column_name),
    rows: result.rows,
    page,
    pageSize,
    total: result.total,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const target = parseTarget(body?.target ?? null);
  const table = body?.table;
  const data = body?.data ?? {};

  if (!target) {
    return NextResponse.json(
      { error: "Invalid target. Use local or prod." },
      { status: 400 }
    );
  }
  if (!table || !isSafeIdentifier(table)) {
    return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
  }

  const columns = Object.keys(data);
  if (columns.length === 0) {
    return NextResponse.json({ error: "No data provided." }, { status: 400 });
  }

  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(", ");
  const sql = `INSERT INTO ${quoteIdent(table)} (${columns
    .map(quoteIdent)
    .join(", ")}) VALUES (${placeholders})`;
  const values = columns.map((key) => data[key]);

  await withDbClient(target, (client) => client.query(sql, values));
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const target = parseTarget(body?.target ?? null);
  const table = body?.table;
  const data = body?.data ?? {};
  const where = body?.where ?? {};

  if (!target) {
    return NextResponse.json(
      { error: "Invalid target. Use local or prod." },
      { status: 400 }
    );
  }
  if (!table || !isSafeIdentifier(table)) {
    return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
  }

  const setKeys = Object.keys(data);
  const whereKeys = Object.keys(where);
  if (setKeys.length === 0 || whereKeys.length === 0) {
    return NextResponse.json(
      { error: "Data and where are required." },
      { status: 400 }
    );
  }

  const setSql = setKeys
    .map((key, idx) => `${quoteIdent(key)} = $${idx + 1}`)
    .join(", ");
  const whereSql = whereKeys
    .map((key, idx) => `${quoteIdent(key)} = $${setKeys.length + idx + 1}`)
    .join(" AND ");
  const sql = `UPDATE ${quoteIdent(table)} SET ${setSql} WHERE ${whereSql}`;
  const values = [...setKeys.map((key) => data[key]), ...whereKeys.map((key) => where[key])];

  await withDbClient(target, (client) => client.query(sql, values));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const target = parseTarget(body?.target ?? null);
  const table = body?.table;
  const where = body?.where ?? {};

  if (!target) {
    return NextResponse.json(
      { error: "Invalid target. Use local or prod." },
      { status: 400 }
    );
  }
  if (!table || !isSafeIdentifier(table)) {
    return NextResponse.json({ error: "Invalid table name." }, { status: 400 });
  }

  const whereKeys = Object.keys(where);
  if (whereKeys.length === 0) {
    return NextResponse.json({ error: "Where is required." }, { status: 400 });
  }

  const whereSql = whereKeys
    .map((key, idx) => `${quoteIdent(key)} = $${idx + 1}`)
    .join(" AND ");
  const sql = `DELETE FROM ${quoteIdent(table)} WHERE ${whereSql}`;
  const values = whereKeys.map((key) => where[key]);

  await withDbClient(target, (client) => client.query(sql, values));
  return NextResponse.json({ ok: true });
}
