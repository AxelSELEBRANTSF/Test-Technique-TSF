// Front-end/MovieApp/src/router/RequireRole.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearToken, me } from "../lib/api";

// roles attendus: "admin" | "editor" | "reader"
// on mappe sur les rôles Symfony retournés par /api/me: ["ROLE_ADMIN", ...]
function hasRequiredRole(user: any, required?: string[]) {
  if (!required || required.length === 0) return true;
  const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
  const normalized = roles.map(r => r.replace(/^ROLE_/, "").toLowerCase());
  return required.some(req => normalized.includes(req.toLowerCase()));
}

export default function RequireRole({
  roles,
  children,
}: {
  roles?: string[];
  children: ReactNode;
}) {
  const [state, setState] = useState<"checking" | "ok" | "unauth" | "forbidden">("checking");
  const loc = useLocation();

  useEffect(() => {
    // 1) présence d’un token côté storage
    let tok: string | null = null;
    try {
      tok = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    } catch {
      tok = null;
    }
    if (!tok) {
      setState("unauth");
      return;
    }

    // 2) si on a un token, on vérifie côté API les rôles
    me()
      .then(user => {
        if (hasRequiredRole(user, roles)) setState("ok");
        else setState("forbidden");
      })
      .catch(() => {
        clearToken();
        setState("unauth");
      });
  }, [roles]);

  if (state === "checking") return <div style={{ padding: 16 }}>Vérification…</div>;
  if (state === "unauth") return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (state === "forbidden") return <Navigate to="/403" replace />;
  return <>{children}</>;
}
