import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    notes.map((note) => ({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt.toISOString(),
    }))
  );
}
