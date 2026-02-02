"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Star,
  History,
  Settings,
  Globe,
} from "lucide-react";
import { LogoutButton } from "../LogoutButton";
import type { User } from "next-auth";

const nav = [
  { href: "/dashboard", label: "Мои маршруты", icon: MessageSquare },
  { href: "/dashboard/public", label: "Публичные маршруты", icon: Globe },
  { href: "/dashboard/favorites", label: "Избранное", icon: Star },
  { href: "/dashboard/history", label: "История", icon: History },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
] as const;

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-100/80 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white/60 p-3 shadow-sm">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-sm font-medium">
              {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {user.name ?? user.email ?? "Пользователь"}
            </p>
            {user.email && user.name && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-200/90 text-slate-900 font-medium shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-800"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
