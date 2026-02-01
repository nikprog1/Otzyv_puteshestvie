"use client";

import { useEffect } from "react";

/**
 * Глобальный обработчик ошибок: в dev показывает текст ошибки для отладки.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 flex items-center justify-center">
      <div className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-red-600">Ошибка сервера</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Проблема с конфигурацией или подключением. Проверьте логи сервера.
        </p>
        {isDev && (
          <pre className="mt-4 overflow-auto rounded border border-zinc-200 bg-zinc-100 p-3 text-xs">
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Повторить
        </button>
      </div>
    </main>
  );
}
