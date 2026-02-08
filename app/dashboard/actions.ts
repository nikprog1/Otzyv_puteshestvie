"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createRouteSchema = z.object({
  title: z.string().min(1, "Заголовок не может быть пустым"),
  content: z.string(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
});

const updateRouteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export type CreateRouteState = { error?: string; success?: boolean };
export type UpdateRouteState = { error?: string; success?: boolean };

export async function createRoute(
  _prev: CreateRouteState,
  formData: FormData
): Promise<CreateRouteState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти" };
  }

  const parsed = createRouteSchema.safeParse({
    title: formData.get("title") ?? "",
    content: formData.get("content") ?? "",
    visibility: formData.get("visibility") ?? "PRIVATE",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const category = await prisma.category.upsert({
    where: { category: "General" },
    create: { category: "General" },
    update: {},
  });

  await prisma.trip_Route.create({
    data: {
      ownerId: session.user.id,
      categoryId: category.id,
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.visibility as "PUBLIC" | "PRIVATE",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  return { success: true };
}

export async function updateRoute(
  _prev: UpdateRouteState,
  formData: FormData
): Promise<UpdateRouteState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти" };
  }

  const id = formData.get("id") as string | null;
  if (!id) return { error: "Нет id" };

  const route = await prisma.trip_Route.findUnique({ where: { id } });
  if (!route || route.ownerId !== session.user.id) {
    return { error: "Маршрут не найден или нет прав" };
  }

  const parsed = updateRouteSchema.safeParse({
    id,
    title: formData.get("title") ?? route.title,
    content: formData.get("content") ?? route.content,
    visibility: formData.get("visibility") ?? route.visibility,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  await prisma.trip_Route.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.visibility,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return { success: true };
}

export async function deleteRoute(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти" };
  }

  const route = await prisma.trip_Route.findUnique({ where: { id } });
  if (!route || route.ownerId !== session.user.id) {
    return { error: "Маршрут не найден или нет прав" };
  }

  await prisma.trip_Route.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return {};
}

export async function toggleVisibility(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти" };
  }

  const route = await prisma.trip_Route.findUnique({ where: { id } });
  if (!route || route.ownerId !== session.user.id) {
    return { error: "Маршрут не найден или нет прав" };
  }

  const nextVisibility = route.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
  await prisma.trip_Route.update({
    where: { id },
    data: { visibility: nextVisibility },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  return {};
}

export async function toggleFavorite(routeId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Необходимо войти" };
  }

  const route = await prisma.trip_Route.findUnique({ where: { id: routeId } });
  if (!route) {
    return { error: "Маршрут не найден" };
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_routeId: { userId: session.user.id, routeId },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        routeId,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/public");
  revalidatePath("/dashboard/favorites");
  return {};
}
