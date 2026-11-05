/**
 * ContextualCTAs — barra de ações contextual ao final de respostas estruturadas.
 * Respeita rota atual, evita becos sem saída, sempre navegação SPA.
 */
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

export interface CTAAction {
  id: string;
  label: string;
  route?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  hint?: string;
}

interface Props {
  actions: CTAAction[];
  title?: string;
}

export function ContextualCTAs({ actions, title = "Próximos passos" }: Props) {
  if (!actions.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
      <div className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-2">
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          const content = (
            <>
              {Icon ? <Icon className="w-3.5 h-3.5" aria-hidden="true" /> : null}
              <span>{a.label}</span>
              <ArrowRight className="w-3 h-3 opacity-70" aria-hidden="true" />
            </>
          );
          const className =
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-neutral-100 hover:text-brand-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60";
          if (a.route) {
            return (
              <Link key={a.id} to={a.route} className={className} title={a.hint} aria-label={a.hint ?? a.label}>
                {content}
              </Link>
            );
          }
          return (
            <button
              key={a.id}
              type="button"
              onClick={a.onClick}
              className={className}
              title={a.hint}
              aria-label={a.hint ?? a.label}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
