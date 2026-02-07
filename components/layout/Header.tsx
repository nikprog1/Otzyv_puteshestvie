"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground no-underline"
        >
          TripRoute
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Главная
          </Link>
          <Link
            href="/catalog"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Каталог
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Мои маршруты
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="h-7 w-7 rounded-full"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {session.user.name ?? session.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer"
                >
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav: simple inline links for small screens */}
      <div className="flex gap-4 border-t px-4 py-2 md:hidden">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Главная
        </Link>
        <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
          Каталог
        </Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          Мои маршруты
        </Link>
      </div>
    </header>
  );
}
