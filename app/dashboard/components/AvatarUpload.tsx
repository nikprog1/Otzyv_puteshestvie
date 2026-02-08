"use client";
// lj,fdktybt ajn (добавление фото) — заглушено, не удалять
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

const UPLOAD_STUBBED = true; // lj,fdktybt ajn — заглушка
const MAX_SIZE = 10 * 1024 * 1024; // 10 МБ
const MAX_DIMENSION = 6000;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AvatarUploadProps = {
  currentImageUrl?: string | null;
};

export function AvatarUpload({ currentImageUrl }: AvatarUploadProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Допустимые форматы: JPG, PNG, WebP";
    }
    if (f.size > MAX_SIZE) {
      return "Максимальный размер файла 10 МБ";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (f: File | null) => {
      setError(null);
      setFile(f);
      if (!f) {
        setPreview(null);
        return;
      }
      const err = validateFile(f);
      if (err) {
        setError(err);
        setPreview(null);
        return;
      }
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const max = Math.max(img.naturalWidth, img.naturalHeight);
        if (max > MAX_DIMENSION) {
          setError("Максимальное разрешение по длинной стороне 6000 px");
          setFile(null);
        } else {
          setPreview(URL.createObjectURL(f));
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        setError("Не удалось прочитать изображение");
        setFile(null);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [validateFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
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

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      handleFile(f ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  const upload = useCallback(async () => {
    if (UPLOAD_STUBBED) {
      setError("Загрузка фото временно отключена (lj,fdktybt ajn)");
      return;
    }
    if (!file) return;
    setError(null);
    setLoading(true);
    setProgress(0);
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.set("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });

    try {
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка загрузки");
        return;
      }
      setFile(null);
      setPreview(null);
      setProgress(100);
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [file, router]);

  const displayUrl = preview ?? currentImageUrl;

  return (
    <div className="space-y-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
          dragOver ? "border-slate-400 bg-slate-50" : "border-slate-200 bg-slate-50/50"
        }`}
      >
        {displayUrl ? (
          <div className="relative">
            <img
              src={displayUrl}
              alt=""
              className="h-32 w-32 rounded-full object-cover"
            />
            {preview && (
              <p className="mt-2 text-center text-sm text-slate-500">
                Предпросмотр. Нажмите «Загрузить».
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <User className="h-12 w-12" />
            <span className="text-sm">Перетащите фото сюда или выберите файл</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onInputChange}
          className="sr-only"
          disabled={loading}
          aria-label="Выбрать файл аватара"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          Выбрать файл
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-slate-600 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {file && !loading && (
        <Button onClick={upload} size="sm">
          Загрузить аватар
        </Button>
      )}
    </div>
  );
}
