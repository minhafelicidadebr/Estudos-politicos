/**
 * ProtectedRoute — gates routes behind authentication.
 * Renders a polished loading state and redirects unauthenticated users to /auth/login.
 */
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl border border-brand-accent/30 flex items-center justify-center bg-brand-accent/5 animate-pulse">
            <span className="font-display text-3xl text-brand-accent leading-none">Á</span>
          </div>
          <p className="text-body-sm text-neutral-400">Verificando acesso…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
