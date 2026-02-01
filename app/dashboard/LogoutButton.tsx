"use client";

import { signOut } from "next-auth/react";

export const LogoutButton = () => {
  return (
    <button
      className="rounded border border-zinc-300 px-3 py-1.5 text-sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Выйти
    </button>
  );
};
