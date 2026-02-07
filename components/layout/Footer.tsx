import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {year} TripRoute
        </p>
        <nav className="flex gap-6">
          <Link
            href="/policy"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Политика
          </Link>
          <Link
            href="/contacts"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Контакты
          </Link>
        </nav>
      </div>
    </footer>
  );
}
