import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { me, adminDeleteUser, adminListUsers, adminUpdateUserRole, registerUser, clearToken } from "../lib/api";
import type { AdminUser, CurrentUser } from "../types";
import { useDebouncedAbortableQuery } from "../lib/hooks";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";
import { isAdmin } from "../lib/utils";

type Props = {
  currentUserEmail?: string | null;
};

type PendingAction =
  | { type: "role"; user: AdminUser; newRole: "admin" | "editor" | "reader" }
  | { type: "delete"; user: AdminUser };

export default function UsersAdminPage({ currentUserEmail }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [items, setItems] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [cEmail, setCEmail] = useState("");
  const [cDisplay, setCDisplay] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cRole, setCRole] = useState<"reader"|"editor"|"admin">("reader");
  const [cBusy, setCBusy] = useState(false);
  const [cErr, setCErr] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sOpen, setSOpen] = useState(false);
  const [itemsReady, setItemsReady] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  function toastOk(m: string, ms = 1500) { setOk(m); window.setTimeout(() => setOk(null), ms); }
  function toastErr(m: string, ms = 2500) { setErr(m); window.setTimeout(() => setErr(null), ms); }

  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const navigate = useNavigate();
  function onLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  React.useEffect(() => {
    let alive = true;
    me().then(u => { if (alive) setUser(u); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  async function reload(initial = false, signal?: AbortSignal) {
    try {
      setLoading(true);
      const res = await adminListUsers({ q, page, pageSize }, { signal });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch {
      toastErr("Impossible de récupérer les utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [q]);
  
  useEffect(() => {
    (async () => {
      await reload(true);
      setItemsReady(true);
    })();
  }, [q, page, pageSize, itemsReady]);

  const { data: usersData, loading: searching } = useDebouncedAbortableQuery<any>(
    [q, page, pageSize],
    async (signal) => {
      const res = await adminListUsers({ q, page, pageSize }, { signal });
      return { items: res.items || [], total: res.total || 0 };
    },
    300
  );

  useEffect(() => {
    if (!usersData) return;
    setItems(usersData.items);
    setTotal(usersData.total);
    setItemsReady(true);
  }, [usersData]);

  function fetchSuggestions(next: string) {
    if (!itemsReady) return;
    if (!next || next.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const lower = next.toLowerCase();
     const sugg = items
     .map(u => u.email || u.displayName || u.username || "")
     .filter(s => s && s.toLowerCase().includes(lower))
     .slice(0, 10);
   setSuggestions(sugg);
  }

  const canManage = (u: AdminUser) => {
    const isSelf = currentUserEmail && u.email
      ? u.email.toLowerCase() === currentUserEmail.toLowerCase()
      : false;
    const canChangeRole = !(u.role === "admin" && !isSelf);
    const canDelete = !isSelf && u.role !== "admin";
    return { canChangeRole, canDelete, isSelf };
  };

  function requestRoleChange(u: AdminUser, newRole: "admin"|"editor"|"reader") {
    const perms = canManage(u);
    if (!perms.canChangeRole || newRole === u.role) return;
    setPending({ type: "role", user: u, newRole });
    setConfirmOpen(true);
  }
  function requestDelete(u: AdminUser) {
    const perms = canManage(u);
    if (!perms.canDelete) return;
    setPending({ type: "delete", user: u });
    setConfirmOpen(true);
  }

  async function onConfirm() {
    try {
      if (!pending) return;
      if (pending.type === "role") {
        await adminUpdateUserRole(pending.user.id, pending.newRole);
        toastOk("Rôle mis à jour");
      } else if (pending.type === "delete") {
        await adminDeleteUser(pending.user.id);
        toastOk("Utilisateur supprimé");
      }
      setConfirmOpen(false);
      setPending(null);
      reload();
    } catch (e: any) {
      toastErr(e?.message || "Action impossible");
      setConfirmOpen(false);
      setPending(null);
    }
  }
  function onCancel() { setConfirmOpen(false); setPending(null); }

  async function createUser() {
    setCBusy(true); setCErr(null);
    try {
      if (!cEmail.trim() || !cPassword.trim()) {
        setCErr("Email et mot de passe requis");
        return;
      }
      await registerUser(cEmail.trim(), cPassword, cDisplay.trim() || undefined);

      if (cRole !== "reader") {
        const res = await adminListUsers(cEmail.trim());
        const created = (res.items || []).find(u => (u.email || "").toLowerCase() === cEmail.trim().toLowerCase());
        if (created) await adminUpdateUserRole(created.id, cRole);
      }

      toastOk("Utilisateur créé");
      setOpenCreate(false);
      setCEmail(""); setCPassword(""); setCDisplay(""); setCRole("reader");
      reload();
    } catch (e: any) {
      setCErr(e?.message || "Échec création");
    } finally {
      setCBusy(false);
    }
  }

  const count = useMemo(() => items.length, [items]);

  return (
    <div className="mx-auto-narrow">
      <section className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <h2 className="card-title" style={{ margin: 0 }}>Administration des utilisateurs</h2>
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
              Connecté en tant que <strong>{user.displayName || user.email || "Utilisateur"}</strong> • Rôles: {(user.roles || []).join(", ") || "aucun"}
            </small>
          )}
        </div>
      </section>

      <section className="card fade-in">
        <div className="card-header">
          <div className="gap-8" style={{ display: "flex", alignItems: "center", width: "100%" }}>
           <SearchInput
              value={q}
              onChange={(v) => { setQ(v); fetchSuggestions(v); }}
              suggestions={suggestions}
              onPick={(s) => { setQ(s); setSuggestions([]); }}
              placeholder="Rechercher email, nom…"
              disabled={!itemsReady}
            />            
            <div className="space" />
            <button className="btn btn-primary" onClick={() => setOpenCreate(true)}>
              Créer un utilisateur
            </button>
          </div>
        </div>

        {ok && <div className="alert alert-success">{ok}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nom affiché</th>
                <th>Pseudo</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th style={{ width: "16ch" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="small" colSpan={6}>Chargement…</td></tr>}
              {!loading && items.length === 0 && <tr><td className="small" colSpan={6}>Aucun utilisateur</td></tr>}
              {!loading && items.map(u => {
                const perms = canManage(u);
                const disableDelete = !perms.canDelete;
                const disableRole = !perms.canChangeRole;
                return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.displayName || "—"}</td>
                    <td>{u.username || "—"}</td>
                    <td>
                      <select
                        className="form-input"
                        value={u.role}
                        disabled={disableRole}
                        title={disableRole ? "Impossible de modifier le rôle d’un autre administrateur" : "Changer le rôle"}
                        onChange={e => requestRoleChange(u, e.target.value as any)}
                      >
                        <option value="reader">reader</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                    <td>
                      <div className="gap-8" style={{ display: "flex" }}>
                        <button
                          className={`btn btn-danger ${disableDelete ? "disabled" : ""}`}
                          disabled={disableDelete}
                          title={disableDelete ? (u.role === "admin" ? "On ne supprime pas un admin" : "Impossible de vous supprimer vous-même") : "Supprimer l’utilisateur"}
                          onClick={() => requestDelete(u)}
                        >
                          Supprimer
                        </button>
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
              <h3 className="card-title" style={{ margin: 0 }}>Créer un utilisateur</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenCreate(false)} aria-label="Fermer">✕</button>
            </div>

            <div className="modal-body" style={{ display: "grid", gap: 10 }}>
              <label className="small">Email</label>
              <input className="form-input" type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder="email@exemple.com" />

              <label className="small">Nom affiché</label>
              <input className="form-input" value={cDisplay} onChange={e => setCDisplay(e.target.value)} placeholder="Nom" />

              <label className="small">Mot de passe</label>
              <input className="form-input" type="password" value={cPassword} onChange={e => setCPassword(e.target.value)} placeholder="Mot de passe" />

              <label className="small">Rôle initial</label>
              <select className="form-input" value={cRole} onChange={e => setCRole(e.target.value as any)}>
                <option value="reader">reader</option>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>

              {cErr && <div className="alert alert-error" style={{ marginTop: 4 }}>{cErr}</div>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setOpenCreate(false)} disabled={cBusy}>Annuler</button>
              <button className="btn btn-primary" onClick={createUser} disabled={cBusy}>{cBusy ? "…" : "Créer"}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={pending?.type === "role" ? "Confirmer le changement de rôle" : pending?.type === "delete" ? "Confirmer la suppression" : "Confirmation"}
        message={
          pending?.type === "role" ? (
            <div style={{ lineHeight: 1.5 }}>
              Êtes-vous sûr de changer le rôle de <strong>{pending.user.email || pending.user.username || pending.user.id}</strong> ?<br />
              Rôle actuel : <strong>{pending.user.role}</strong><br />
              Nouveau rôle : <strong>{(pending as any).newRole}</strong>
            </div>
          ) : pending?.type === "delete" ? (
            <div>Supprimer l’utilisateur <strong>{pending.user.email || pending.user.username || pending.user.id}</strong> ?</div>
          ) : "Êtes-vous sûr ?"
        }
        confirmLabel="Confirmer"
        cancelLabel="Annuler"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}
