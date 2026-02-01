"use client";

import { signIn } from "next-auth/react";

export const LoginButton = () => {
  return (
    <button
      className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      onClick={() => signIn("google")}
    >
      Войти через Google
    </button>
  );
};
