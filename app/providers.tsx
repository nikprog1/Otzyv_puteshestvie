"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Обёртка для клиентских провайдеров (SessionProvider).
 * Нужна для стабильной работы signIn() / signOut() на клиенте.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
