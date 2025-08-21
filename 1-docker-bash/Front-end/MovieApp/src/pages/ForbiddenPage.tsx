// Front-end/MovieApp/src/pages/ForbiddenPage.tsx
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <section className="card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <h2 className="card-title" style={{ margin: 0 }}>Accès refusé</h2>
      </div>
      <div className="card-body">
        <p>Vous n’avez pas les droits pour accéder à cette page.</p>
        <Link className="btn" to="/">Revenir à l’accueil</Link>
      </div>
    </section>
  );
}
