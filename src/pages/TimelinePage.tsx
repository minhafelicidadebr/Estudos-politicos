/**
 * TimelinePage — Sprint 17
 * Timeline Temporal por Governo: trajetória PIR+ ao longo do tempo
 * por país, com marcos críticos (contextFlags) e comparação visual período-a-período.
 * SVG nativo, 100% client-side, sem dependências novas.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Clock, TrendingUp, TrendingDown, AlertCircle, Sparkles } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seedCountries } from "@/data/countries";
import { getGovernmentsForCountry } from "@/data/governments";
import { useToast } from "@/hooks/use-toast";

interface PublicAnalysis {
  id: string;
  title: string;
  axis_data: Record<string, Record<string, number>> | null;
  scores: Record<string, unknown> | null;
}

interface GovPoint {
  id: string;
  name: string;
  leader: string;
  party: string;
  yearStart: number;
  yearEnd: number;
  score: number;
  color: string;
  flags: string[];
  hasData: boolean;
}

const avgOf = (obj: Record<string, unknown> | null | undefined): number => {
  if (!obj) return 0;
  const v = Object.values(obj).filter((x) => typeof x === "number") as number[];
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
};

const TimelinePage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const { toast } = useToast();
  const cid = (countryId ?? "").toUpperCase();
  const country = seedCountries.find((c) => c.id === cid);
  const [analyses, setAnalyses] = useState<PublicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("id,title,axis_data,scores")
          .eq("is_public", true)
          .eq("country_id", cid)
          .limit(200);
        if (error) throw error;
        setAnalyses((data ?? []) as unknown as PublicAnalysis[]);
      } catch (e) {
        toast({ title: "Erro ao carregar timeline", description: e instanceof Error ? e.message : "—", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [cid, toast]);

  const points: GovPoint[] = useMemo(() => {
    const govs = getGovernmentsForCountry(cid);
    if (!govs.length) return [];

    // Aggregate analysis scores per government id
    const scoreByGov = new Map<string, number[]>();
    analyses.forEach((a) => {
      const ad = a.axis_data ?? {};
      const perGovScore = new Map<string, number[]>();
      Object.values(ad).forEach((perGov) => {
        if (!perGov) return;
        Object.entries(perGov).forEach(([govId, val]) => {
          if (typeof val !== "number") return;
          const arr = perGovScore.get(govId) ?? [];
          arr.push(val);
          perGovScore.set(govId, arr);
        });
      });
      perGovScore.forEach((arr, govId) => {
        const m = arr.reduce((x, y) => x + y, 0) / arr.length;
        const acc = scoreByGov.get(govId) ?? [];
        acc.push(m);
        scoreByGov.set(govId, acc);
      });
    });

    return govs.map((g) => {
      const scoresArr = scoreByGov.get(g.id) ?? [];
      const score = scoresArr.length
        ? scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length
        : 0;
      return {
        id: g.id,
        name: g.name,
        leader: g.leaderName,
        party: g.party,
        yearStart: g.yearStart,
        yearEnd: g.yearEnd ?? new Date().getFullYear(),
        score,
        color: g.color ?? "#C9A84C",
        flags: g.contextFlags ?? [],
        hasData: scoresArr.length > 0,
      };
    });
  }, [cid, analyses]);

  const stats = useMemo(() => {
    const withData = points.filter((p) => p.hasData);
    if (!withData.length) return null;
    const sorted = [...withData].sort((a, b) => b.score - a.score);
    const avg = withData.reduce((s, p) => s + p.score, 0) / withData.length;
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
      avg,
      coverage: (withData.length / points.length) * 100,
    };
  }, [points]);

  // SVG dimensions
  const W = 1200;
  const H = 380;
  const PAD_X = 60;
  const PAD_Y = 60;
  const minYear = points.length ? Math.min(...points.map((p) => p.yearStart)) : 0;
  const maxYear = points.length ? Math.max(...points.map((p) => p.yearEnd)) : 0;
  const yearSpan = Math.max(1, maxYear - minYear);
  const xOf = (year: number) => PAD_X + ((year - minYear) / yearSpan) * (W - 2 * PAD_X);
  const yOf = (score: number) => H - PAD_Y - (Math.max(0, Math.min(10, score)) / 10) * (H - 2 * PAD_Y);

  // Polyline of midpoints for govs that have data
  const trajectory = points
    .filter((p) => p.hasData)
    .map((p) => {
      const mid = (p.yearStart + p.yearEnd) / 2;
      return { x: xOf(mid), y: yOf(p.score), gov: p };
    });

  const pathD = trajectory.length > 1
    ? trajectory.reduce((acc, pt, i) => acc + `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)} `, "")
    : "";

  if (!country) return <Navigate to="/atlas" replace />;

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-brand-deep via-brand-deep to-[#0d1a2f]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/atlas" className="hover:text-neutral-200 transition-colors">Atlas</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">{country.name_display_pt} · Timeline</span>
          </nav>

          <motion.header
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center shrink-0 text-3xl">
              {country.flag_emoji}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-display-lg text-neutral-50">
                Timeline · {country.name_display_pt}
              </h1>
              <p className="text-body-md text-neutral-400 mt-1">
                Trajetória PIR+ ao longo dos governos. Linha de tendência e marcos críticos contextuais.
              </p>
            </div>
            <Link
              to={`/comparative/${cid.toLowerCase()}`}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 transition text-body-sm"
            >
              <Sparkles className="w-4 h-4" /> Análise comparativa
            </Link>
          </motion.header>

          {/* KPI strip */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Melhor governo" value={stats.best.name} hint={stats.best.score.toFixed(2)} />
              <Kpi icon={<TrendingDown className="w-4 h-4" />} label="Pior governo" value={stats.worst.name} hint={stats.worst.score.toFixed(2)} />
              <Kpi icon={<Clock className="w-4 h-4" />} label="Média histórica PIR+" value={stats.avg.toFixed(2)} />
              <Kpi icon={<AlertCircle className="w-4 h-4" />} label="Cobertura analítica" value={`${stats.coverage.toFixed(0)}%`} />
            </div>
          )}

          {/* Timeline SVG */}
          {loading ? (
            <div className="h-[380px] rounded-xl border border-neutral-700/30 bg-white/[0.02] animate-pulse" />
          ) : points.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-neutral-700/40">
              <p className="text-body-sm text-neutral-500">
                Nenhum governo registrado para este país no banco de dados.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-700/30 bg-white/[0.02] p-4 overflow-x-auto">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[800px]" role="img" aria-label="Timeline temporal">
                {/* Grid lines */}
                {[0, 2.5, 5, 7.5, 10].map((s) => (
                  <g key={s}>
                    <line x1={PAD_X} y1={yOf(s)} x2={W - PAD_X} y2={yOf(s)} stroke="hsl(var(--border) / 0.3)" strokeDasharray="2 4" />
                    <text x={PAD_X - 8} y={yOf(s) + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="monospace">{s.toFixed(1)}</text>
                  </g>
                ))}
                {/* Year markers (every ~5 years) */}
                {Array.from({ length: Math.floor(yearSpan / 5) + 1 }).map((_, i) => {
                  const y = minYear + i * 5;
                  return (
                    <text key={y} x={xOf(y)} y={H - PAD_Y + 18} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="monospace">
                      {y}
                    </text>
                  );
                })}

                {/* Government bars */}
                {points.map((p) => {
                  const x1 = xOf(p.yearStart);
                  const x2 = xOf(p.yearEnd);
                  const barH = 14;
                  const barY = H - PAD_Y + 28;
                  return (
                    <g key={p.id}
                      onMouseEnter={() => setHovered(p.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        x={x1} y={barY} width={Math.max(2, x2 - x1)} height={barH}
                        fill={p.color}
                        opacity={hovered === p.id ? 0.95 : 0.6}
                        rx={3}
                      />
                      {p.hasData && (
                        <circle cx={(x1 + x2) / 2} cy={yOf(p.score)} r={hovered === p.id ? 7 : 5}
                          fill={p.color} stroke="hsl(var(--background))" strokeWidth="2" />
                      )}
                      {!p.hasData && (
                        <circle cx={(x1 + x2) / 2} cy={H - PAD_Y - 10} r={3} fill="hsl(var(--muted-foreground))" opacity="0.4" />
                      )}
                    </g>
                  );
                })}

                {/* Trajectory line */}
                {pathD && (
                  <path d={pathD} stroke="hsl(var(--brand-accent, 45 60% 55%))" strokeWidth="2" fill="none"
                    strokeDasharray={trajectory.length < 2 ? "0" : "0"} opacity="0.85" />
                )}
              </svg>

              {/* Legend / hovered card */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {points.map((p) => (
                  <button
                    key={p.id}
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`text-left rounded-lg border p-3 transition ${
                      hovered === p.id
                        ? "border-brand-accent/60 bg-white/[0.05]"
                        : "border-neutral-700/30 bg-white/[0.02] hover:border-neutral-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                        <span className="text-body-sm font-semibold text-neutral-50 truncate">{p.name}</span>
                      </div>
                      <span className="text-micro font-mono text-neutral-400 shrink-0">
                        {p.yearStart}–{p.yearEnd}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-micro text-neutral-500">
                      <span className="truncate">{p.leader} · {p.party}</span>
                      <span className={`font-mono ${p.hasData ? "text-brand-accent" : "text-neutral-600"}`}>
                        {p.hasData ? p.score.toFixed(2) : "sem dados"}
                      </span>
                    </div>
                    {p.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.flags.slice(0, 3).map((f) => (
                          <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-neutral-400 font-mono">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

const Kpi = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-xl border border-neutral-700/30 bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 text-micro text-neutral-500 mb-2">
      <span className="text-brand-accent">{icon}</span>
      {label}
    </div>
    <div className="font-display text-display-sm text-neutral-50 truncate">{value}</div>
    {hint && <div className="text-micro text-neutral-500 mt-1 font-mono">{hint}</div>}
  </div>
);

export default TimelinePage;
