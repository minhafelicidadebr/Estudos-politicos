/**
 * ErrorBoundary — Catches rendering errors with elegant fallback
 * Sprint 15: Error Boundaries and loading states
 */
import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-confidence-low/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-7 h-7 text-confidence-low" />
          </div>
          <h3 className="font-display text-heading-lg text-neutral-50 mb-2">
            {this.props.fallbackTitle || "Algo deu errado"}
          </h3>
          <p className="text-body-sm text-neutral-400 mb-6 max-w-md">
            Encontramos um problema ao renderizar esta seção. Tente recarregar a página.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all text-body-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-neutral-400 hover:text-neutral-50 transition-colors text-body-sm"
            >
              <Home className="w-4 h-4" /> Início
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
