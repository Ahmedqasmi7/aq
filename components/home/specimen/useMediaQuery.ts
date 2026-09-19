"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook. A plain `useState(() => matchMedia(...).matches)`
 * lazy initializer reads `window` on the client but not during server
 * rendering, so hydration keeps the server's stale value until something
 * else forces a re-render — on a fresh mobile load, that means the desktop
 * layout renders first and never corrects itself. useSyncExternalStore is
 * the React-documented fix: it renders the server snapshot on first paint
 * (matching SSR exactly, no mismatch) and re-checks immediately after.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
