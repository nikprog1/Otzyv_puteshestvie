import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
    process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
  }

  const { prisma } = await import("@/lib/prisma");
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
