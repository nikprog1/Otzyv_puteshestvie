"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEBOUNCE_MS = 300;

export function SearchInput({ placeholder = "Поиск…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [value, setValue] = useState(q);

  useEffect(() => {
    setValue(q);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
        params.set("page", "1");
      } else {
        params.delete("q");
        params.delete("page");
      }
      const query = params.toString();
      router.push(pathname + (query ? `?${query}` : ""), { scroll: false });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value, pathname, router, searchParams]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
    />
  );
}
