// lj,fdktybt ajn (добавление фото)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
export const MAX_DIMENSION = 6000;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_SIZES = [150, 300, 600, 1080] as const;

export function getExtensionFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
