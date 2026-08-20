import { useState } from 'react';

const STORAGE_KEY = 'pairflix.demoPickUsedAt';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

/** Tracks the landing page's one-time demo pick client-side, in a rolling 24h window matching the
 * API's own per-IP `ipRateLimit` backstop -- a visitor who bounces today can come back tomorrow
 * rather than being permanently locked out on this device. This is a UX nicety, not an auth
 * token: the server-side rate limit is the actual backstop against abuse. */
export function useDemoPickGate() {
  const [usedAt, setUsedAt] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  const hasUsedToday = usedAt !== null && Date.now() - usedAt < COOLDOWN_MS;

  const markUsed = () => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, String(now));
    setUsedAt(now);
  };

  return { hasUsedToday, markUsed };
}
