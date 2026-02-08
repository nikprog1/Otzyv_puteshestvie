// lj,fdktybt ajn (добавление фото)
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const UPLOAD_BUCKET = "uploads";

function getSupabase(): SupabaseClient | null {
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey);
}

/** Серверный клиент Supabase с правами на Storage. Для загрузки/удаления файлов. */
export const supabaseServer = getSupabase();

/** Публичный URL хранилища для формирования ссылок на файлы. */
export function getStoragePublicUrl(path: string): string {
  if (!url) return path;
  const base = url.replace(/\/$/, "") + "/storage/v1/object/public/" + UPLOAD_BUCKET + "/";
  return base + path.replace(/^\//, "");
}
