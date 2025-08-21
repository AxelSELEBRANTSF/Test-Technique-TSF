// Front-end/MovieApp/src/pages/LogsPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { me, clearToken, adminListLogs, suggestLogs } from "../lib/api";
import { useDebouncedAbortableQuery } from "../lib/hooks";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import type { CurrentUser, LogRow, Paginated } from "../types";

export default function LogsPage() {
  const navigate = useNavigate();

  const [user, setUser] = React.useState<CurrentUser | null>(null);
  React.useEffect(() => {
    let ok = true;
    me().then(u => { if (ok) setUser(u); }).catch(() => {});
    return () => { ok = false; };
  }, []);

  const [q, setQ] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [items, setItems] = React.useState<LogRow[]>([]);
  const [itemsReady, setItemsReady] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => { setPage(1); }, [q]);

  const { data, loading } = useDebouncedAbortableQuery<Paginated<LogRow>>(
    [q, page, pageSize],
    async (signal) => {
      const res = await adminListLogs({ q, page, pageSize }, { signal });
      return { items: res.items || [], total: res.total || 0, page, pageSize };
    },
    300
  );

  React.useEffect(() => {
    if (!data) return;
    setItems(data.items);
    setTotal(data.total);
    setItemsReady(true);
  }, [data]);

  function onLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  async function onChangeQ(v: string) {
    setQ(v);
    if (!v || v.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const sugg = await suggestLogs(v);
      setSuggestions(sugg);
    } catch {
      setSuggestions([]);
    }
  }

  return (
    <div className="mx-auto-narrow">
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <h2 className="card-title" style={{ margin: 0 }}>Logs d’activité</h2>
          <div className="space" />
          <div className="gap-8" style={{ display: "flex" }}>
            <Link className="btn" to="/movies">Films</Link>
            <Link className="btn" to="/admin/users">Utilisateurs</Link>
            <button className="btn btn-ghost" onClick={onLogout}>Se déconnecter</button>
          </div>
        </div>
        <div className="card-body py-2">
          {user && (
            <small className="text-muted">
              Connecté en tant que <strong>{user.displayName || user.email || "Utilisateur"}</strong>
              {user.roles?.length ? <> • Rôles: {(user.roles || []).join(", ")}</> : null}
            </small>
          )}
        </div>
      </section>

      <section className="card fade-in">
        <div className="card-header">
          <div className="gap-8" style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <SearchInput
              value={q}
              onChange={onChangeQ}
              suggestions={suggestions}
              onPick={(s) => { setQ(s); setSuggestions([]); }}
              placeholder="Rechercher (mot-clé, action, email, entité…)"
              disabled={!itemsReady}
            />
            <div className="space" />
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "18ch" }}>Date</th>
                <th style={{ width: "28ch" }}>Utilisateur</th>
                <th>Action</th>
                <th>Entité</th>
                <th style={{ width: "14ch" }}>ID</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="small" colSpan={6}>Chargement…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="small" colSpan={6}>Aucun log</td></tr>}
              {!loading && items.map(r => {
                const when = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
                const who = r.user_display || r.user_email || `#${r.user_id ?? "?"}`;
                return (
                  <tr key={r.id}>
                    <td>{when}</td>
                    <td>{who}</td>
                    <td>{r.action || "—"}</td>
                    <td>{r.entity || "—"}</td>
                    <td>{r.entity_id ?? "—"}</td>
                    <td>{r.message || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          loading={loading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>
    </div>
  );
}
