import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

// Валидация env в dev: предупреждение при отсутствии обязательных переменных
if (process.env.NODE_ENV === "development") {
  const required = ["AUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.warn(
      "[Auth] Отсутствуют переменные окружения:",
      missing.join(", "),
      "- см. AUTH_SETUP.md"
    );
  }
}

// AUTH_SECRET обязателен для подписи cookie; в dev при отсутствии — временный секрет (задайте в .env для продакшена)
const authSecret =
  process.env.AUTH_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-secret-change-in-env" : undefined);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: authSecret,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
