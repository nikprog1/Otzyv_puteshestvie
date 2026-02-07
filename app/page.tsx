import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Маршруты путешествий
      </h1>
      <p className="mt-3 text-lg text-slate-500">
        Создавайте и находите проверенные маршруты
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href={session?.user ? "/dashboard" : "/login"}>
            Добавить маршрут
          </Link>
        </Button>
        {!session?.user && (
          <>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="/login">Войти</Link>
            </Button>
            <p className="text-sm text-slate-500">
              Войдите, чтобы добавлять маршруты
            </p>
          </>
        )}
      </div>
    </div>
  );
}
