/**
 * CivicHeatmapPage — Sprint 10: GitHub-style contribution heatmap.
 * Visualizes 365 days of civic engagement (analyses + actions) with
 * intensity buckets, weekday/month axes, and tooltip drill-down.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Activity, Loader2, Flame, TrendingUp, Calendar } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ease } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DayCell {
  date: string;            // YYYY-MM-DD
  analyses: number;
  actions: number;
  total: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildGrid(rawAnalyses: { created_at: string }[], rawActions: { completed_at: string }[]): DayCell[] {
  const map = new Map<string, { analyses: number; actions: number }>();
  const today = new Date();
  // Start at the previous Sunday 53 weeks ago for a clean 53-column grid
  const start = new Date(today);
  start.setDate(today.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday

  for (let i = 0; i < 371; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > today) break;
    const key = d.toISOString().slice(0, 10);
    map.set(key, { analyses: 0, actions: 0 });
  }
  for (const a of rawAnalyses) {
    const k = a.created_at.slice(0, 10);
    const cur = map.get(k);
    if (cur) cur.analyses++;
  }
  for (const a of rawActions) {
    const k = a.completed_at.slice(0, 10);
    const cur = map.get(k);
    if (cur) cur.actions++;
  }

  return [...map.entries()].map(([date, v]) => {
    const total = v.analyses + v.actions;
    const intensity: DayCell["intensity"] =
      total === 0 ? 0 : total === 1 ? 1 : total <= 3 ? 2 : total <= 6 ? 3 : 4;
    return { date, analyses: v.analyses, actions: v.actions, total, intensity };
  });
}

const COLORS = [
  "rgba(255,255,255,0.04)",  // 0
  "rgba(201,168,76,0.25)",   // 1
  "rgba(201,168,76,0.5)",    // 2
  "rgba(201,168,76,0.75)",   // 3
  "rgba(240,192,64,1)",      // 4
];

export default function CivicHeatmapPage() {
  const { user, loading: authLoading } = useAuth();
  const [cells, setCells] = useState<DayCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("analyses").select("created_at"),
        supabase.from("user_civic_actions").select("completed_at"),
      ]);
      setCells(buildGrid(a.data ?? [], b.data ?? []));
      setLoading(false);
    })();
  }, [user, authLoading]);

  // Group into 53 columns × 7 rows
  const columns = useMemo(() => {
    const cols: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [cells]);

  const stats = useMemo(() => {
    const active = cells.filter((c) => c.total > 0);
    const totalActs = active.reduce((s, c) => s + c.total, 0);
    const max = active.reduce((m, c) => Math.max(m, c.total), 0);
    // Current streak
    let streak = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].total > 0) streak++;
      else if (i < cells.length - 1) break;
    }
    // Longest streak
    let longest = 0, cur = 0;
    for (const c of cells) {
      if (c.total > 0) { cur++; longest = Math.max(longest, cur); } else cur = 0;
    }
    return { activeDays: active.length, totalActs, max, streak, longest };
  }, [cells]);

  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    columns.forEach((col, i) => {
      if (!col[0]) return;
      const m = new Date(col[0].date).getMonth();
      if (m !== lastMonth) {
        labels.push({ col: i, label: MONTHS[m] });
        lastMonth = m;
      }
    });
    return labels;
  }, [columns]);

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-accent animate-spin" />
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen pt-16 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Activity className="w-12 h-12 text-brand-accent mx-auto mb-4" />
            <h1 className="font-display text-display-md text-neutral-50 mb-2">Heatmap Cívico</h1>
            <p className="text-neutral-400 mb-6">Faça login para ver seu histórico de engajamento.</p>
            <Link to="/auth/login"><Button>Entrar</Button></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Heatmap Cívico</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease.cinematic }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-brand-accent" />
              <h1 className="font-display text-display-lg text-neutral-50">Heatmap Cívico</h1>
            </div>
            <p className="text-body-md text-neutral-400 max-w-2xl">
              Cada quadrado é um dia. A intensidade reflete análises completas e ações cívicas registradas — uma curva visual da sua agência democrática nos últimos 12 meses.
            </p>
          </motion.div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { icon: Calendar, label: "Dias ativos", value: stats.activeDays },
              { icon: TrendingUp, label: "Atos totais", value: stats.totalActs },
              { icon: Flame, label: "Streak atual", value: `${stats.streak}d` },
              { icon: Activity, label: "Maior streak", value: `${stats.longest}d` },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] backdrop-blur"
              >
                <s.icon className="w-4 h-4 text-brand-accent mb-2" />
                <div className="font-display text-2xl text-neutral-50">{s.value}</div>
                <div className="text-micro text-neutral-500 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02] backdrop-blur overflow-x-auto"
          >
            <TooltipProvider delayDuration={50}>
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex gap-[3px] ml-8 mb-1 h-3 relative">
                  {monthLabels.map((m) => (
                    <span
                      key={m.col + m.label}
                      className="text-[10px] text-neutral-500 absolute"
                      style={{ left: `${m.col * 13}px` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-[3px]">
                  {/* Weekday axis */}
                  <div className="flex flex-col gap-[3px] mr-1 w-7">
                    {WEEKDAYS.map((d, i) => (
                      <span key={d} className="text-[10px] text-neutral-500 h-[10px] leading-[10px]">
                        {i % 2 === 1 ? d : ""}
                      </span>
                    ))}
                  </div>
                  {/* Cells */}
                  {columns.map((col, ci) => (
                    <div key={ci} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, ri) => {
                        const cell = col[ri];
                        if (!cell) return <div key={ri} className="w-[10px] h-[10px]" />;
                        return (
                          <Tooltip key={cell.date}>
                            <TooltipTrigger asChild>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: ci * 0.004, duration: 0.2 }}
                                className="w-[10px] h-[10px] rounded-[2px] cursor-pointer hover:ring-1 hover:ring-brand-accent transition-all"
                                style={{ background: COLORS[cell.intensity] }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-medium">
                                {new Date(cell.date).toLocaleDateString("pt-BR", {
                                  weekday: "short", day: "numeric", month: "short",
                                })}
                              </div>
                              <div className="text-neutral-400">
                                {cell.total === 0
                                  ? "Sem atividade"
                                  : `${cell.analyses} análise${cell.analyses !== 1 ? "s" : ""} · ${cell.actions} ação${cell.actions !== 1 ? "ões" : ""}`}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-4 ml-8 text-[10px] text-neutral-500">
                  <span>Menos</span>
                  {COLORS.map((c, i) => (
                    <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: c }} />
                  ))}
                  <span>Mais</span>
                </div>
              </div>
            </TooltipProvider>
          </motion.div>

          {stats.totalActs === 0 && (
            <div className="text-center py-10 text-neutral-500 text-body-sm">
              Ainda sem atividade — <Link to="/compare" className="text-brand-accent hover:underline">comece sua primeira análise</Link>.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
