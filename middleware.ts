import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Тонкий middleware без импорта auth/Prisma, чтобы не превышать лимит размера Edge Function (1 MB).
 * Проверяем только наличие сессионной cookie; валидация сессии — на сервере в страницах.
 */
const SESSION_COOKIE_NAMES = ["authjs.session-token", "next-auth.session-token", "__Secure-authjs.session-token", "__Secure-next-auth.session-token"];

function hasSessionCookie(req: NextRequest): boolean {
  for (const name of SESSION_COOKIE_NAMES) {
    if (req.cookies.get(name)?.value) return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  if (!hasSessionCookie(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/my-routes"],
};
