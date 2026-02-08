"use client";
// lj,fdktybt ajn (добавление фото) — заглушено, не удалять
import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPLOAD_STUBBED = true; // lj,fdktybt ajn — заглушка
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 6000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type RouteImageItem = {
  id: string;
  original: string;
  url150: string | null;
  url300: string | null;
  url600: string | null;
  url1080: string | null;
};

type RouteImageUploadProps = {
  routeId: string;
  initialImages: RouteImageItem[];
};

function validateFile(f: File): string | null {
  if (!ALLOWED_TYPES.includes(f.type)) return "Допустимые форматы: JPG, PNG, WebP";
  if (f.size > MAX_SIZE) return "Максимальный размер файла 10 МБ";
  return null;
}

export function RouteImageUpload({ routeId, initialImages }: RouteImageUploadProps) {
  const [images, setImages] = useState<RouteImageItem[]>(initialImages);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    setPendingFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    const err = validateFile(f);
    if (err) {
      setError(err);
      setPreview(null);
      setPendingFile(null);
      return;
    }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const max = Math.max(img.naturalWidth, img.naturalHeight);
      if (max > MAX_DIMENSION) {
        setError("Максимальное разрешение по длинной стороне 6000 px");
        setPendingFile(null);
      } else {
        setPreview(URL.createObjectURL(f));
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Не удалось прочитать изображение");
      setPendingFile(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0] ?? null);
    },
    [handleFile]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const upload = useCallback(async () => {
    if (UPLOAD_STUBBED) {
      setError("Загрузка фото временно отключена (lj,fdktybt ajn)");
      return;
    }
    if (!pendingFile) return;
    setError(null);
    setLoading(true);
    setProgress(0);
    const formData = new FormData();
    formData.set("file", pendingFile);
    formData.set("routeId", routeId);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });

    try {
      const res = await fetch("/api/upload/route-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка загрузки");
        return;
      }
      setImages((prev) => [...prev, data.image]);
      setPendingFile(null);
      setPreview(null);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [pendingFile, routeId]);

  const remove = useCallback(async (id: string) => {
    if (UPLOAD_STUBBED) return;
    try {
      const res = await fetch(`/api/upload/route-image?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Ошибка удаления");
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch {
      setError("Ошибка сети");
    }
  }, []);

  const thumbUrl = (img: RouteImageItem) => img.url300 ?? img.url150 ?? img.url600 ?? img.original;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700">Фото маршрута</h3>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
              <img
                src={thumbUrl(img)}
                alt=""
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 opacity-90"
                onClick={() => remove(img.id)}
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
          dragOver ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-slate-50/50"
        }`}
      >
        {preview ? (
          <div className="flex items-center gap-3">
            <img
              src={preview}
              alt=""
              className="h-20 w-20 rounded object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-slate-600">Готово к загрузке</p>
              {loading && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-slate-600 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            {!loading && (
              <>
                <Button type="button" size="sm" onClick={upload}>
                  Загрузить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPendingFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="sr-only"
              disabled={loading}
              aria-label="Добавить фото"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-sm">Добавить фото (перетащите или выберите)</span>
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
