import { prisma } from "@/lib/prisma";

export default async function Home() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Notes</h1>
          <p className="text-sm text-zinc-600">
            Данные загружаются из Supabase (PostgreSQL) через Prisma.
          </p>
        </header>
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600">
            Записей пока нет. Добавьте данные в таблицу Note и обновите страницу.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="text-lg font-medium">{note.title}</div>
                <div className="text-xs text-zinc-500">
                  {note.createdAt.toISOString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
