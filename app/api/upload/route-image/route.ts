// lj,fdktybt ajn (добавление фото) — заглушено
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer, getStoragePublicUrl, UPLOAD_BUCKET } from "@/lib/supabase";
import {
  ALLOWED_MIME,
  getExtensionFromMime,
  IMAGE_SIZES,
  MAX_DIMENSION,
  MAX_FILE_SIZE,
} from "@/lib/upload";
import { NextResponse } from "next/server";
import sharp from "sharp";

const UPLOAD_STUBBED = true; // lj,fdktybt ajn — заглушка, не удалять

export async function POST(request: Request) {
  if (UPLOAD_STUBBED) {
    return NextResponse.json(
      { error: "Загрузка фото временно отключена (lj,fdktybt ajn)" },
      { status: 503 }
    );
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Необходимо войти" }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json(
      { error: "Хранилище не настроено (Supabase)" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Неверное тело запроса" }, { status: 400 });
  }

  const routeId = (formData.get("routeId") ?? new URL(request.url).searchParams.get("routeId")) as string | null;
  if (!routeId) {
    return NextResponse.json({ error: "Укажите routeId" }, { status: 400 });
  }

  const route = await prisma.trip_Route.findUnique({
    where: { id: routeId },
    select: { ownerId: true },
  });
  if (!route || route.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Маршрут не найден или нет прав" }, { status: 403 });
  }

  const file = formData.get("file") ?? formData.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
  }

  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    return NextResponse.json(
      { error: "Допустимые форматы: JPG, PNG, WebP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Максимальный размер файла 10 МБ" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = sharp(buffer);
  const meta = await image.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const maxSide = Math.max(w, h);
  if (maxSide > MAX_DIMENSION) {
    return NextResponse.json(
      { error: "Максимальное разрешение по длинной стороне 6000 px" },
      { status: 400 }
    );
  }

  const imageId = crypto.randomUUID();
  const pathPrefix = `routes/${routeId}/${imageId}`;

  const urls: Record<string, string> = { original: "" };

  const originalBuffer = await image.jpeg({ quality: 90 }).toBuffer();
  const { data: origData, error: origErr } = await supabaseServer.storage
    .from(UPLOAD_BUCKET)
    .upload(`${pathPrefix}_original.jpg`, originalBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (origErr) {
    console.error("[upload/route-image] original", origErr);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
  urls.original = getStoragePublicUrl(origData.path);

  const variantUrls: Record<number, string> = {};
  for (const size of IMAGE_SIZES) {
    const resized = await sharp(buffer)
      .resize(size, size, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const { data: d, error: e } = await supabaseServer.storage
      .from(UPLOAD_BUCKET)
      .upload(`${pathPrefix}_${size}.jpg`, resized, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (e) {
      console.error("[upload/route-image]", size, e);
      continue;
    }
    variantUrls[size] = getStoragePublicUrl(d.path);
  }

  const agg = await prisma.routeImage.aggregate({
    where: { routeId },
    _max: { order: true },
  });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const created = await prisma.routeImage.create({
    data: {
      id: imageId,
      routeId,
      order: nextOrder,
      original: urls.original,
      url150: variantUrls[150] ?? null,
      url300: variantUrls[300] ?? null,
      url600: variantUrls[600] ?? null,
      url1080: variantUrls[1080] ?? null,
    },
  });

  return NextResponse.json({
    success: true,
    image: {
      id: created.id,
      original: created.original,
      url150: created.url150,
      url300: created.url300,
      url600: created.url600,
      url1080: created.url1080,
    },
  });
}

export async function DELETE(request: Request) {
  if (UPLOAD_STUBBED) {
    return NextResponse.json(
      { error: "Загрузка фото временно отключена (lj,fdktybt ajn)" },
      { status: 503 }
    );
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Необходимо войти" }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json(
      { error: "Хранилище не настроено (Supabase)" },
      { status: 503 }
    );
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Укажите id фото" }, { status: 400 });
  }

  const row = await prisma.routeImage.findUnique({
    where: { id },
    include: { route: { select: { ownerId: true } } },
  });
  if (!row || row.route.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Фото не найдено или нет прав" }, { status: 403 });
  }

  const pathPrefix = `routes/${row.routeId}/${id}`;
  const toRemove = [
    `${pathPrefix}_original.jpg`,
    `${pathPrefix}_150.jpg`,
    `${pathPrefix}_300.jpg`,
    `${pathPrefix}_600.jpg`,
    `${pathPrefix}_1080.jpg`,
  ];
  for (const path of toRemove) {
    await supabaseServer.storage.from(UPLOAD_BUCKET).remove([path]);
  }

  await prisma.routeImage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
