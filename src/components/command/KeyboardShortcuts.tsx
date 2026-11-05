/**
 * KeyboardShortcuts — global "go to" sequences (G→C, G→L, G→H)
 * and a "?" help overlay listing every shortcut.
 * Pure frontend, zero deps beyond react-router.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Keyboard } from "lucide-react";

const SEQUENCES: Record<string, string> = {
  c: "/compare",
  l: "/lab",
  h: "/history",
  a: "/atlas",
  w: "/wrapped",
  i: "/insights",
  m: "/world-map",
};

const SHORTCUTS: Array<{ keys: string; label: string }> = [
  { keys: "⌘K / Ctrl+K", label: "Abrir busca rápida" },
  { keys: "⌘J / Ctrl+J", label: "Abrir Sofia (assistente IA)" },
  { keys: "?", label: "Mostrar atalhos" },
  { keys: "G → C", label: "Ir para Comparação" },
  { keys: "G → L", label: "Ir para Laboratório" },
  { keys: "G → H", label: "Ir para Histórico" },
  { keys: "G → A", label: "Ir para Atlas" },
  { keys: "G → W", label: "Ir para Wrapped" },
  { keys: "G → I", label: "Ir para Insights" },
  { keys: "G → M", label: "Ir para Mapa Mundial" },
  { keys: "Esc", label: "Fechar overlays" },
];

const isEditable = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
};

export function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const [awaitingG, setAwaitingG] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let gTimer: number | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Escape") {
        setShowHelp(false);
        setAwaitingG(false);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }

      if (awaitingG) {
        const target = SEQUENCES[e.key.toLowerCase()];
        setAwaitingG(false);
        if (gTimer) window.clearTimeout(gTimer);
        if (target) {
          e.preventDefault();
          navigate(target);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        setAwaitingG(true);
        if (gTimer) window.clearTimeout(gTimer);
        gTimer = window.setTimeout(() => setAwaitingG(false), 1200);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) window.clearTimeout(gTimer);
    };
  }, [awaitingG, navigate]);

  return (
    <>
      {/* G prefix indicator */}
      <AnimatePresence>
        {awaitingG && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-3 py-1.5 rounded-lg bg-brand-primary/95 border border-brand-accent/30 backdrop-blur-xl shadow-lg"
            role="status"
            aria-live="polite"
          >
            <span className="text-xs text-neutral-300 font-mono">
              <kbd className="text-brand-accent">G</kbd> aguardando destino... (C · L · H · A · W · I · M)
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Atalhos de teclado"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-brand-primary/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-brand-accent" />
                  <h2 className="text-sm font-semibold text-neutral-100">Atalhos de teclado</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  aria-label="Fechar"
                  className="p-1 rounded-md hover:bg-white/[0.05] text-neutral-400 hover:text-neutral-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="p-3 max-h-[60vh] overflow-y-auto">
                {SHORTCUTS.map((s) => (
                  <li
                    key={s.keys}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.03]"
                  >
                    <span className="text-sm text-neutral-300">{s.label}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[11px] font-mono text-brand-accent">
                      {s.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-3 border-t border-white/[0.06] text-[10px] text-neutral-500">
                Pressione <kbd className="font-mono text-neutral-400">?</kbd> a qualquer momento para reabrir.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default KeyboardShortcuts;
