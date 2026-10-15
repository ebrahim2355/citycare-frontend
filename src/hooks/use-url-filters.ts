"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { z } from "zod";
import { parseFilters } from "@/lib/filters";

type FilterValue = string | number | undefined | null;

export function useUrlFilters<S extends z.ZodType<Record<string, unknown>>>(schema: S) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(schema, new URLSearchParams(searchParams.toString())), [schema, searchParams]);

  const setFilters = useCallback(
    (changes: Partial<Record<keyof z.infer<S> & string, FilterValue>>, { keepPage = false } = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (!keepPage && !("page" in changes)) {
        next.delete("page");
      }

      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if ("page" in changes) {
        window.history.pushState(null, "", url);
      } else {
        window.history.replaceState(null, "", url);
      }
    },
    [pathname, searchParams]
  );

  const clearFilters = useCallback(() => window.history.replaceState(null, "", pathname), [pathname]);

  return { filters, setFilters, clearFilters };
}
