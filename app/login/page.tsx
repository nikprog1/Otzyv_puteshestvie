import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "./LoginButton";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Вход в TripRoute</h1>
          <p className="text-sm text-zinc-600">
            Авторизуйтесь через Google, чтобы управлять маршрутами.
          </p>
        </div>
        <LoginButton />
      </div>
    </main>
  );
}
