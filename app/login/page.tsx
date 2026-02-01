import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "./LoginButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
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
