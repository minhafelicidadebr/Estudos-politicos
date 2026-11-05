/**
 * GlobalCommandPalette — ⌘K unified navigator.
 * Unicorn-grade: fuzzy search across all routes, modules, actions and shortcuts.
 * Zero backend calls · pure client · a11y first · WCAG 2.2 AA.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  GitCompareArrows, Crown, Globe2, Map as MapIcon, Lightbulb, Activity,
  Trophy, Sparkles, FlaskConical, Dna, Users, Radio, Gavel, HeartHandshake,
  Compass, Wallet, Building2, Network, Brain, BookOpen, ShieldCheck,
  Library, History, Settings as SettingsIcon, Home, Scan, MessagesSquare,
  Rocket, type LucideIcon,
} from "lucide-react";

type Entry = {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  action: () => void;
  shortcut?: string;
  group: string;
};

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => () => {
    setOpen(false);
    navigate(path);
  };

  const entries: Entry[] = useMemo(() => [
    // Navegação principal
    { id: "home", label: "Início", icon: Home, action: go("/"), group: "Navegação", keywords: "landing home" },
    { id: "compare", label: "Comparação de Governos", hint: "Multi-governo · 28 eixos", icon: GitCompareArrows, action: go("/compare"), group: "Análises", shortcut: "G C" },
    { id: "leaders", label: "Comparador de Líderes", hint: "Ranking cross-país", icon: Crown, action: go("/leaders"), group: "Análises" },
    { id: "atlas", label: "Atlas Global", hint: "KPIs por país", icon: Globe2, action: go("/atlas"), group: "Análises" },
    { id: "world", label: "Mapa Mundial PIR+", hint: "Heatmap planetário", icon: MapIcon, action: go("/world-map"), group: "Análises" },
    { id: "insights", label: "Insights Globais", hint: "Padrões emergentes", icon: Lightbulb, action: go("/insights"), group: "Inteligência" },
    { id: "heatmap", label: "Heatmap Cívico", icon: Activity, action: go("/heatmap"), group: "Comunidade" },
    { id: "liga", label: "Liga Ágora", hint: "Leaderboard público", icon: Trophy, action: go("/liga"), group: "Comunidade" },
    { id: "wrapped", label: "Political Wrapped", hint: "Retrospectiva cívica", icon: Sparkles, action: go("/wrapped"), group: "Comunidade" },

    // Laboratório
    { id: "lab", label: "Lab Hub", hint: "Todos os 11 motores", icon: FlaskConical, action: go("/lab"), group: "Laboratório", shortcut: "G L" },
    { id: "wellbeing", label: "Mapa de Bem-Estar", icon: HeartHandshake, action: go("/wellbeing"), group: "Laboratório" },
    { id: "career", label: "Career Navigator", icon: Compass, action: go("/career"), group: "Laboratório" },
    { id: "fiscal", label: "Impacto Fiscal", icon: Wallet, action: go("/fiscal-impact"), group: "Laboratório" },
    { id: "org", label: "Bem-Estar Organizacional", icon: Building2, action: go("/org-wellbeing"), group: "Laboratório" },
    { id: "commons", label: "Inteligência Emergente", icon: Network, action: go("/intelligence-commons"), group: "Laboratório" },
    { id: "epistemic", label: "Radar Epistêmico", icon: Brain, action: go("/epistemic-radar"), group: "Laboratório" },
    { id: "agency", label: "Painel de Agência", icon: Users, action: go("/agency"), group: "Laboratório" },

    // Recursos
    { id: "method", label: "Metodologia PIR+/SIB", icon: BookOpen, action: go("/methodology"), group: "Recursos" },
    { id: "library", label: "Biblioteca", icon: Library, action: go("/library"), group: "Recursos" },
    { id: "audit", label: "Auditoria & Trilha", icon: ShieldCheck, action: go("/audit"), group: "Recursos" },

    // Conta
    { id: "history", label: "Meu Histórico", icon: History, action: go("/history"), group: "Conta", shortcut: "G H" },
    { id: "settings", label: "Configurações", icon: SettingsIcon, action: go("/settings"), group: "Conta" },

    // Ações rápidas
    {
      id: "sofia",
      label: "Abrir Sofia (Assistente IA)",
      hint: "Chat contextual",
      icon: MessagesSquare,
      group: "Ações rápidas",
      shortcut: "⌘ /",
      action: () => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("sofia:open"));
      },
    },
    {
      id: "new-analysis",
      label: "Nova análise comparativa",
      icon: Rocket,
      group: "Ações rápidas",
      action: go("/compare"),
    },
  ], []);

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of entries) {
      if (!map.has(e.group)) map.set(e.group, []);
      map.get(e.group)!.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar em toda a Ágora — módulos, mapas, ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado. Tente "atlas", "líderes", "wrapped"...</CommandEmpty>
        {groups.map(([group, items], gi) => (
          <div key={group}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((e) => {
                const Icon = e.icon;
                return (
                  <CommandItem
                    key={e.id}
                    value={`${e.label} ${e.hint ?? ""} ${e.keywords ?? ""} ${e.group}`}
                    onSelect={e.action}
                    className="gap-3"
                  >
                    <Icon className="w-4 h-4 text-brand-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-100">{e.label}</div>
                      {e.hint && <div className="text-[11px] text-neutral-500">{e.hint}</div>}
                    </div>
                    {e.shortcut && <CommandShortcut>{e.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
      <div className="border-t border-white/5 px-3 py-2 flex items-center justify-between text-[10px] text-neutral-500">
        <span>Navegue com ↑ ↓ · abra com ↵</span>
        <span className="font-mono">⌘K para alternar</span>
      </div>
    </CommandDialog>
  );
}

export default GlobalCommandPalette;
