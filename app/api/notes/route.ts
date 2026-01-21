import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.PRISMA_CLIENT_ENGINE_TYPE) {
      process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set.");
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
  } catch (error) {
    console.error("Failed to load notes:", error);
    return NextResponse.json(
      { error: "Failed to load notes." },
      { status: 500 }
    );
  }
}
