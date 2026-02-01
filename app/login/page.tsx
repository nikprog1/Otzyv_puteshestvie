import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("[Login] auth() failed:", e);
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-700">Ошибка конфигурации</h1>
          <p className="mt-2 text-sm text-red-600">
            Не удалось загрузить сессию. Проверьте .env: AUTH_SECRET, GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET, DATABASE_URL. См. AUTH_SETUP.md.
          </p>
          {process.env.NODE_ENV === "development" && e instanceof Error && (
            <pre className="mt-4 overflow-auto rounded bg-white p-2 text-xs">
              {e.message}
            </pre>
          )}
        </div>
      </main>
    );
  }
  if (session?.user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Вход в TripRoute</h1>
          <p className="text-sm text-zinc-600">
            Авторизуйтесь через Google, чтобы управлять маршрутами.
          </p>
        </div>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Ошибка входа. Попробуйте снова.
          </div>
        )}
        <LoginButton />
      </div>
    </main>
  );
}
