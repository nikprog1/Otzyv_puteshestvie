// lj,fdktybt ajn (добавление фото) — заглушено
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabaseServer, getStoragePublicUrl, UPLOAD_BUCKET } from "@/lib/supabase";
import { ALLOWED_MIME, getExtensionFromMime, MAX_DIMENSION, MAX_FILE_SIZE } from "@/lib/upload";
import { NextResponse } from "next/server";
import sharp from "sharp";

const AVATAR_SIZE = 400;
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

  const file = formData.get("file") ?? formData.get("avatar");
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
  let image = sharp(buffer);
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

  image = image.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" });
  const ext = getExtensionFromMime(file.type);
  const path = `avatars/${session.user.id}.${ext}`;
  const { data: uploadData, error: uploadError } = await supabaseServer.storage
    .from(UPLOAD_BUCKET)
    .upload(path, await image.jpeg({ quality: 90 }).toBuffer(), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("[upload/avatar]", uploadError);
    return NextResponse.json(
      { error: "Ошибка загрузки файла" },
      { status: 500 }
    );
  }

  const url = getStoragePublicUrl(uploadData.path);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: url },
  });

  return NextResponse.json({ success: true, url });
}
