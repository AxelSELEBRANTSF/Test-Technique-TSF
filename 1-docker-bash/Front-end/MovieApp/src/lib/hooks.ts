// src/lib/hooks.ts
import { useEffect, useRef, useState } from "react";

export function useDebouncedAbortableQuery<T>(
  deps: any[],
  fetcher: (signal: AbortSignal) => Promise<T>,
  delay = 300
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<Error | null>(null);

  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      fetcher(ctrl.signal)
        .then((res) => setData(res))
        .catch((e) => {
          if (e?.name !== "AbortError") setError(e);
        })
        .finally(() => setLoading(false));
    }, delay);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
