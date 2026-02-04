import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Необходимо войти" },
        { status: 401 }
      );
    }

    const { id: routeId } = await params;
    if (!routeId) {
      return NextResponse.json(
        { error: "Маршрут не найден или недоступен" },
        { status: 404 }
      );
    }

    const route = await prisma.trip_Route.findUnique({
      where: { id: routeId },
    });

    if (!route || route.visibility !== "PUBLIC") {
      return NextResponse.json(
        { error: "Маршрут не найден или недоступен" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_routeId: { userId: session.user.id, routeId },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          routeId,
        },
      });
    }

    const likesCount = await prisma.like.count({
      where: { routeId },
    });

    const liked = !existing;
    return NextResponse.json({ liked, likesCount });
  } catch {
    return NextResponse.json(
      { error: "Попробуйте позже" },
      { status: 500 }
    );
  }
}
