import { useEffect, useMemo, useState } from 'react';

/**
 * Countdown display driven by a server-issued `expiresAt` timestamp.
 *
 * IMPORTANT: this is a DISPLAY-ONLY timer. The backend is the source of truth —
 * it rejects any answer/submit made after expires_at regardless of what this
 * hook shows. If the tab is closed and reopened, the attempt resumes correctly
 * because expires_at is fetched fresh from the server, not reconstructed locally.
 */
export function useServerTimer(expiresAt: string | null, onExpire?: () => void) {
  const expiresAtMs = useMemo(() => (expiresAt ? new Date(expiresAt).getTime() : null), [expiresAt]);
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    expiresAtMs ? Math.max(0, expiresAtMs - Date.now()) : 0
  );

  useEffect(() => {
    if (!expiresAtMs) return;

    let expired = false;
    const tick = () => {
      const remaining = Math.max(0, expiresAtMs - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0 && !expired) {
        expired = true;
        onExpire?.();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAtMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { remainingMs, label, isExpired: remainingMs <= 0 };
}
