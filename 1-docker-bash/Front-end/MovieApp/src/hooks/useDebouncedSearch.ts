import { useCallback, useEffect, useRef, useState } from "react";

type SearchFn<T> = (params: { q: string; page: number; pageSize: number; signal?: AbortSignal }) => Promise<{ items: T[]; total: number; page: number; pageSize: number }>;

export function useDebouncedSearch<T>(searchFn: SearchFn<T>, initial = { pageSize: 20, delayMs: 300 }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const acRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const run = useCallback((nextQ: string, nextPage: number, nextPageSize: number) => {
    acRef.current?.abort();
    acRef.current = new AbortController();
    setLoading(true);
    setErr(null);
    return searchFn({ q: nextQ, page: nextPage, pageSize: nextPageSize, signal: acRef.current.signal })
      .then(res => { setItems(res.items); setTotal(res.total); })
      .catch((e: any) => { if (e?.name !== "AbortError") setErr(e?.message || "Erreur de recherche"); })
      .finally(() => setLoading(false));
  }, [searchFn]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => { void run(q, page, pageSize); }, initial.delayMs) as unknown as number;
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [q, page, pageSize, run, initial.delayMs]);

  useEffect(() => { setPage(1); }, [q]);

  return {
    q, setQ,
    page, setPage,
    pageSize, setPageSize,
    items, total,
    loading, err,
    refresh: () => run(q, page, pageSize),
  };
}
