import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MoviesPage from "./pages/MoviesPage";
import UsersAdminPage from "./pages/UsersAdminPage";
import LogsPage from "./pages/LogsPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import RequireRole from "./router/RequireRole";

function RequireAuth({ children }: { children: React.ReactNode }) {
  let tok: string | null = null;
  try {
    tok = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  } catch {
    tok = null;
  }
  if (!tok) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><MoviesPage /></RequireAuth>} />
      <Route path="/movies" element={<RequireAuth><MoviesPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/movies" replace />} />

      {/* Accès refusé */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Admin: la vérification fine des rôles se fait dans RequireRole */}
      <Route
        path="/admin/users"
        element={
          <RequireRole roles={["admin"]}>
            <UsersAdminPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <RequireRole roles={["admin"]}>
            <LogsPage />
          </RequireRole>
        }
      />
    </Routes>
  );
}

