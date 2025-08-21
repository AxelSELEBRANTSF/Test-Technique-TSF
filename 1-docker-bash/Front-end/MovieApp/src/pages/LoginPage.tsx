import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../lib/api";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      const next = loc?.state?.from || "/movies";
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Échec de connexion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto-narrow">
      <section className="card">
        <div className="card-header">
          <h2 className="card-title" style={{ margin: 0 }}>Connexion</h2>
        </div>
        <form
          className="card-body"
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 12 }}
        >
          <label className="small">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <label className="small">Mot de passe</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {err && <div className="alert alert-error">{err}</div>}

          <div className="modal-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "…" : "Se connecter"}
            </button>
          </div>
        </form>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ margin: 0 }}>Comptes disponibles</h3>
        </div>
        <div className="card-body" style={{ fontSize: 14, lineHeight: 1.6 }}>
          <p><strong>admin@admin.com</strong> / <code>admin</code>  
            <br/>→ <em>Administrateur</em>, accès complet (y compris gestion utilisateurs et logs)</p>
          <p><strong>editeur@editeur.com</strong> / <code>editeur</code>  
            <br/>→ <em>Éditeur</em>, peut créer et modifier des films (sauf ceux créés par un admin)</p>
          <p><strong>lecteur@lecteur.com</strong> / <code>lecteur</code>  
            <br/>→ <em>Lecteur</em>, accès en lecture seule aux films</p>
        </div>
      </section>
    </div>
  );
}
