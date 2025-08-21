// Front-end/MovieApp/src/pages/MoviesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  me,
  clearToken,
  searchMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovie,
  suggestMovies,
} from "../lib/api";
import ConfirmDialog from "../components/ConfirmDialog";
import { readApiDate, asArray, readUserLabel, isAdmin, isEditor, canEdit, canDelete } from "../lib/utils";
import { useDebouncedAbortableQuery } from "../lib/hooks";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import type { CurrentUser, Movie, MovieDraft, Paginated } from "../types";

type PendingAction = { type: "delete"; movie: Movie };

export default function MoviesPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    let alive = true;
    me().then(u => { if (alive) setUser(u); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [items, setItems] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [itemsReady, setItemsReady] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  function toastOk(m: string, ms = 1200) { setOk(m); window.setTimeout(() => setOk(null), ms); }
  function toastErr(m: string, ms = 2200) { setErr(m); window.setTimeout(() => setErr(null), ms); }

  // Bootstrap initial
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await searchMovies("", { page: 1, pageSize });
        setItems(asArray<Movie>(res.items));
        setTotal(Number(res.total ?? asArray<Movie>(res.items).length));
        setItemsReady(true);
      } catch (e: any) {
        toastErr(e?.message || "Impossible de récupérer les films");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setPage(1); }, [q]);

  const { data, loading: searching } = useDebouncedAbortableQuery<Paginated<Movie>>(
    [q, page, pageSize, itemsReady],
    async (signal) => {
      if (!itemsReady) return { items: [], total: 0, page, pageSize };
      const res = await searchMovies(q, { page, pageSize, signal });
      return { items: asArray<Movie>(res.items), total: Number(res.total ?? asArray<Movie>(res.items).length), page, pageSize };
    },
    300
  );

  useEffect(() => {
    if (!data) return;
    setItems(data.items);
    setTotal(data.total);
  }, [data]);

  async function onChangeQuery(v: string) {
    setQ(v);
    if (!itemsReady || !v || v.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const sugg = await suggestMovies(v);
      setSuggestions(sugg);
    } catch {
      setSuggestions([]);
    }
  }

  function onSubmitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSuggestions([]);
  }

  const [openCreate, setOpenCreate] = useState(false);
  const [cBusy, setCBusy] = useState(false);
  const [cErr, setCErr] = useState<string | null>(null);
  const [cDraft, setCDraft] = useState<MovieDraft>({ title: "", production: "", director: "", start_date: null, end_date: null });

  const [openEdit, setOpenEdit] = useState(false);
  const [eBusy, setEBusy] = useState(false);
  const [eErr, setEErr] = useState<string | null>(null);
  const [eId, setEId] = useState<number | null>(null);
  const [eDraft, setEDraft] = useState<MovieDraft | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const count = useMemo(() => items.length, [items]);
  const canCreate = isAdmin(user) || isEditor(user);

  function onLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  function startCreate() {
    setCDraft({ title: "", production: "", director: "", start_date: null, end_date: null });
    setCErr(null); setCBusy(false);
    setOpenCreate(true);
  }

  async function doCreate() {
    setCBusy(true); setCErr(null);
    try {
      if (!cDraft.title?.trim()) { setCErr("Titre requis"); setCBusy(false); return; }
      if (!cDraft.production?.trim()) { setCErr("Production requise"); setCBusy(false); return; }
      if (!cDraft.director?.trim()) { setCErr("Réalisateur requis"); setCBusy(false); return; }

      const created = await createMovie(cDraft);
      const id = created?.id;
      const fresh = id ? await getMovie(Number(id)) : created;
      setItems(prev => [fresh as Movie, ...prev]);
      setOpenCreate(false);
      toastOk("Film créé");
    } catch (e: any) {
      setCErr(e?.message || "Échec création");
    } finally {
      setCBusy(false);
    }
  }

  function startEdit(id: number) {
    const m = items.find(x => x.id === id);
    if (!m) return;
    setEId(id);
    setEDraft({
      title: m.title || "",
      production: m.production || "",
      director: m.director || "",
      start_date: readApiDate(m.start_date),
      end_date: readApiDate(m.end_date ?? m.end_date),
    });
    setEErr(null); setEBusy(false);
    setOpenEdit(true);
  }

  async function doEdit() {
    if (!eId || !eDraft) return;
    setEBusy(true); setEErr(null);
    try {
      if (!eDraft.title?.trim()) { setEErr("Titre requis"); setEBusy(false); return; }
      if (!eDraft.production?.trim()) { setEErr("Production requise"); setEBusy(false); return; }
      if (!eDraft.director?.trim()) { setEErr("Réalisateur requis"); setEBusy(false); return; }

      await updateMovie(eId, eDraft);
      const fresh = await getMovie(eId);
      setItems(prev => prev.map(it => it.id === eId ? (fresh as Movie) : it));
      setOpenEdit(false);
      toastOk("Film modifié");
    } catch (e: any) {
      setEErr(e?.message || "Échec modification");
    } finally {
      setEBusy(false);
    }
  }

  function requestDelete(m: Movie) {
    setPending({ type: "delete", movie: m });
    setConfirmOpen(true);
  }
  async function onConfirm() {
    try {
      if (!pending) return;
      await deleteMovie(pending.movie.id);
      setItems(prev => prev.filter(x => x.id !== pending.movie.id));
      setConfirmOpen(false);
      setPending(null);
      toastOk("Film supprimé");
    } catch (e: any) {
      toastErr(e?.message || "Suppression impossible");
      setConfirmOpen(false);
      setPending(null);
    }
  }
  function onCancel() { setConfirmOpen(false); setPending(null); }

  return (
    <div className="mx-auto-narrow">
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <h2 className="card-title" style={{ margin: 0 }}>Administration des films</h2>
          <div className="space" />
          <div className="gap-8" style={{ display: "flex" }}>
            {isAdmin(user) && <Link className="btn" to="/admin/users">Utilisateurs</Link>}
            {isAdmin(user) && <Link className="btn" to="/admin/logs">Logs</Link>}
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
          <form className="gap-8" onSubmit={onSubmitSearch} style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <SearchInput
              value={q}
              onChange={onChangeQuery}
              suggestions={suggestions}
              onPick={(s) => { setQ(s); setSuggestions([]); }}
              placeholder="Rechercher un film, une prod, un réal…"
              disabled={!itemsReady}
            />
            <div className="space" />
            { (isAdmin(user) || isEditor(user)) && (
              <button className="btn btn-primary" type="button" onClick={startCreate}>
                Créer un film
              </button>
            )}
          </form>
        </div>

        {ok && <div className="alert alert-success">{ok}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "6ch" }}>#</th>
                <th>Titre</th>
                <th>Production</th>
                <th>Réalisateur</th>
                <th style={{ width: "26ch" }}>Créé / Modifié par</th>
                <th style={{ width: "22ch" }}>Dates</th>
                <th style={{ width: "18ch" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="small" colSpan={7}>Chargement…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="small" colSpan={7}>Aucun film</td></tr>}
              {!loading && items.map(m => {
                const start = readApiDate(m.start_date);
                const end = readApiDate(m.end_date ?? m.end_date);
                const createdBy = readUserLabel(m.created_by);
                const updatedBy = readUserLabel(m.updated_by);
                return (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td className="fw-semibold">{m.title || "—"}</td>
                    <td>{m.production || "—"}</td>
                    <td>{m.director || "—"}</td>
                    <td>
                      <div className="small" style={{ lineHeight: 1.25 }}>
                        <div>Créé {createdBy ? <>par <strong>{createdBy}</strong></> : "—"}</div>
                        <div>Modifié {updatedBy ? <>par <strong>{updatedBy}</strong></> : "—"}</div>
                      </div>
                    </td>
                    <td>{start || end ? `${start || "—"} → ${end || "—"}` : "—"}</td>
                    <td>
                      <div className="gap-8" style={{ display: "flex" }}>
                        {canEdit(m, user) && (
                          <button className="btn" type="button" onClick={() => startEdit(m.id)}>Modifier</button>
                        )}
                        {canDelete(m, user) && (
                          <button className="btn btn-danger" type="button" onClick={() => requestDelete(m)}>Supprimer</button>
                        )}
                      </div>
                    </td>
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
          loading={loading || searching}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {openCreate && (
        <div className="modal-overlay" onClick={() => setOpenCreate(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title" style={{ margin: 0 }}>Créer un film</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenCreate(false)} aria-label="Fermer">✕</button>
            </div>

            <div className="modal-body" style={{ display: "grid", gap: 10 }}>
              <label className="small">Titre</label>
              <input className="form-input" value={cDraft.title || ""} onChange={e => setCDraft({ ...cDraft, title: e.target.value })} />

              <label className="small">Production</label>
              <input className="form-input" value={cDraft.production || ""} onChange={e => setCDraft({ ...cDraft, production: e.target.value })} />

              <label className="small">Réalisateur</label>
              <input className="form-input" value={cDraft.director || ""} onChange={e => setCDraft({ ...cDraft, director: e.target.value })} />

              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Date début</label>
                  <input
                    type="date"
                    className="form-control"
                    value={cDraft.start_date || ""}
                    onChange={e => setCDraft({ ...cDraft, start_date: e.target.value || null })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={cDraft.end_date || ""}
                    onChange={e => setCDraft({ ...cDraft, end_date: e.target.value || null })}
                  />
                </div>
              </div>

              {cErr && <div className="alert alert-error" style={{ marginTop: 4 }}>{cErr}</div>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setOpenCreate(false)} disabled={cBusy}>Annuler</button>
              <button className="btn btn-primary" type="button" onClick={doCreate} disabled={cBusy || !canCreate}>{cBusy ? "…" : "Créer"}</button>
            </div>
          </div>
        </div>
      )}

      {openEdit && eDraft && (
        <div className="modal-overlay" onClick={() => setOpenEdit(false)}>
          <div className="modal-card card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title" style={{ margin: 0 }}>Modifier un film</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenEdit(false)} aria-label="Fermer">✕</button>
            </div>

            <div className="modal-body" style={{ display: "grid", gap: 10 }}>
              <label className="small">Titre</label>
              <input className="form-input" value={eDraft.title || ""} onChange={e => setEDraft({ ...eDraft, title: e.target.value })} />

              <label className="small">Production</label>
              <input className="form-input" value={eDraft.production || ""} onChange={e => setEDraft({ ...eDraft, production: e.target.value })} />

              <label className="small">Réalisateur</label>
              <input className="form-input" value={eDraft.director || ""} onChange={e => setEDraft({ ...eDraft, director: e.target.value })} />

              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Date début</label>
                  <input
                    type="date"
                    className="form-control"
                    value={eDraft.start_date || ""}
                    onChange={e => setEDraft({ ...eDraft, start_date: e.target.value || null })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={eDraft.end_date || ""}
                    onChange={e => setEDraft({ ...eDraft, end_date: e.target.value || null })}
                  />
                </div>
              </div>

              {eErr && <div className="alert alert-error" style={{ marginTop: 4 }}>{eErr}</div>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setOpenEdit(false)} disabled={eBusy}>Annuler</button>
              <button className="btn btn-primary" type="button" onClick={doEdit} disabled={eBusy || !eDraft}>{eBusy ? "…" : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer la suppression"
        message={
          pending
            ? <>Supprimer le film <strong>{pending.movie.title}</strong> (#{pending.movie.id}) ?</>
            : "Êtes-vous sûr ?"
        }
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}
