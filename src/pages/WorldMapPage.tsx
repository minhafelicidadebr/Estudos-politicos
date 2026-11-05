/**
 * Sprint 21 — Mapa Mundial PIR+ Interativo
 * Projeção equiretangular determinística. Dados agregados de análises públicas.
 * Bubbles por país: tamanho = nº de análises, cor = banda PIR+.
 * Zero dependências externas (sem mapbox/d3) — SVG nativo, performance máxima.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map as MapIcon, Globe2, TrendingUp, Filter } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seedCountries, continents } from "@/data/countries";

type Agg = { sum: number; count: number };

const W = 1200;
const H = 600;
// Equirectangular: lng [-180,180] → [0,W], lat [90,-90] → [0,H]
const project = (lat: number, lng: number) => ({
  x: ((lng + 180) / 360) * W,
  y: ((90 - lat) / 180) * H,
});

// Bandas determinísticas PIR+
const band = (s: number) => {
  if (s >= 8.5) return { fill: "hsl(158 64% 52%)", label: "Excelente", ring: "hsl(158 64% 52% / 0.25)" };
  if (s >= 7.0) return { fill: "hsl(173 58% 48%)", label: "Bom", ring: "hsl(173 58% 48% / 0.25)" };
  if (s >= 5.5) return { fill: "hsl(45 92% 58%)", label: "Médio", ring: "hsl(45 92% 58% / 0.25)" };
  if (s >= 3.5) return { fill: "hsl(25 90% 58%)", label: "Frágil", ring: "hsl(25 90% 58% / 0.25)" };
  return { fill: "hsl(0 75% 60%)", label: "Crítico", ring: "hsl(0 75% 60% / 0.25)" };
};

const WorldMapPage = () => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Map<string, Agg>>(new Map());
  const [continent, setContinent] = useState<string>("Todos");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("analyses")
        .select("country_id, scores")
        .eq("is_public", true)
        .limit(500);
      const acc = new Map<string, Agg>();
      (data ?? []).forEach((row) => {
        const cid = String(row.country_id || "").toUpperCase();
        if (!cid) return;
        const sc = row.scores && typeof row.scores === "object" && !Array.isArray(row.scores) ? row.scores : {};
        const vals = Object.values(sc).filter((v) => typeof v === "number") as number[];
        if (!vals.length) return;
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
        const cur = acc.get(cid) ?? { sum: 0, count: 0 };
        cur.sum += avg;
        cur.count += 1;
        acc.set(cid, cur);
      });
      setScores(acc);
      setLoading(false);
    })();
  }, []);

  const points = useMemo(() => {
    return seedCountries
      .filter((c) => continent === "Todos" || c.continent === continent)
      .map((c) => {
        const agg = scores.get(c.id);
        const avg = agg ? agg.sum / agg.count : null;
        const { x, y } = project(c.capital.lat, c.capital.lng);
        const r = agg ? Math.min(22, 6 + Math.sqrt(agg.count) * 4) : 4;
        return { country: c, x, y, r, avg, count: agg?.count ?? 0 };
      });
  }, [scores, continent]);

  const kpis = useMemo(() => {
    const withData = points.filter((p) => p.avg !== null);
    const totalAnalyses = withData.reduce((s, p) => s + p.count, 0);
    const globalAvg = withData.length ? withData.reduce((s, p) => s + (p.avg as number), 0) / withData.length : 0;
    const leader = withData.slice().sort((a, b) => (b.avg as number) - (a.avg as number))[0];
    return { withData: withData.length, totalAnalyses, globalAvg, leader };
  }, [points]);

  const hoveredPoint = hovered ? points.find((p) => p.country.id === hovered) : null;

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-24 px-4 lg:px-8 pb-24">
        <div className="max-w-[1320px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl border border-brand-accent/40 bg-brand-accent/5 flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-micro tracking-[0.18em] uppercase text-brand-accent">Sprint 21 · Geo-Inteligência</p>
                <h1 className="font-display text-heading-2xl text-neutral-50 leading-none mt-1">Mapa Mundial PIR+</h1>
              </div>
            </div>
            <p className="text-body-md text-neutral-400 max-w-2xl">
              Visualização geoespacial determinística de governança global. Bubbles dimensionadas por número de análises,
              coloridas por banda PIR+ agregada. Clique em um país para abrir a análise comparativa.
            </p>
          </motion.div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Países cobertos", value: kpis.withData, icon: Globe2 },
              { label: "Análises públicas", value: kpis.totalAnalyses, icon: TrendingUp },
              { label: "Média global PIR+", value: kpis.globalAvg.toFixed(2), icon: TrendingUp },
              { label: "Líder atual", value: kpis.leader?.country.flag_emoji ?? "—", sub: kpis.leader?.country.name_display_pt, icon: Globe2 },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4"
              >
                <div className="flex items-center gap-2 text-micro tracking-wider uppercase text-neutral-500 mb-2">
                  <k.icon className="w-3.5 h-3.5" />
                  {k.label}
                </div>
                <div className="font-display text-heading-md text-neutral-50">{k.value}</div>
                {k.sub && <div className="text-body-sm text-neutral-400 mt-0.5 truncate">{k.sub}</div>}
              </motion.div>
            ))}
          </div>

          {/* Continent filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-500" />
            {continents.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`px-3 py-1.5 rounded-full text-body-sm border transition-all ${
                  continent === c
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-neutral-700/40 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[hsl(217,40%,8%)] via-[hsl(217,45%,6%)] to-[hsl(217,50%,4%)] overflow-hidden"
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Mapa mundial PIR+">
              <defs>
                <radialGradient id="oceanGlow" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stopColor="hsl(201 96% 32% / 0.18)" />
                  <stop offset="100%" stopColor="hsl(217 50% 4% / 0)" />
                </radialGradient>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(217 30% 20% / 0.18)" strokeWidth="0.5" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean glow */}
              <rect width={W} height={H} fill="url(#oceanGlow)" />
              {/* Lat/Lng grid */}
              <rect width={W} height={H} fill="url(#grid)" />

              {/* Equator */}
              <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="hsl(45 92% 58% / 0.18)" strokeWidth="0.7" strokeDasharray="6 6" />
              {/* Prime meridian */}
              <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="hsl(45 92% 58% / 0.12)" strokeWidth="0.6" strokeDasharray="4 4" />
              {/* Tropics */}
              {[23.5, -23.5].map((lat) => {
                const y = ((90 - lat) / 180) * H;
                return <line key={lat} x1="0" y1={y} x2={W} y2={y} stroke="hsl(217 40% 30% / 0.18)" strokeWidth="0.4" strokeDasharray="2 6" />;
              })}

              {/* Continent labels (lightweight, no path data) */}
              {[
                { label: "AMÉRICAS", lat: 5, lng: -85 },
                { label: "EUROPA", lat: 55, lng: 15 },
                { label: "ÁFRICA", lat: 5, lng: 20 },
                { label: "ÁSIA", lat: 45, lng: 90 },
                { label: "OCEANIA", lat: -25, lng: 135 },
              ].map((c) => {
                const { x, y } = project(c.lat, c.lng);
                return (
                  <text
                    key={c.label}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="11"
                    fill="hsl(217 25% 45% / 0.55)"
                    letterSpacing="3"
                    fontFamily="system-ui, sans-serif"
                  >
                    {c.label}
                  </text>
                );
              })}

              {/* Country bubbles */}
              {points.map((p) => {
                const b = p.avg !== null ? band(p.avg) : { fill: "hsl(217 20% 35%)", ring: "hsl(217 20% 35% / 0.2)", label: "Sem dado" };
                const isHover = hovered === p.country.id;
                return (
                  <Link key={p.country.id} to={p.avg !== null ? `/comparative/${p.country.id.toLowerCase()}` : `/analyze/${p.country.id.toLowerCase()}`}>
                    <g
                      onMouseEnter={() => setHovered(p.country.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: "pointer" }}
                      filter={isHover ? "url(#glow)" : undefined}
                    >
                      {/* Outer ring (pulse for data) */}
                      {p.avg !== null && (
                        <circle cx={p.x} cy={p.y} r={p.r + 6} fill={b.ring} opacity={isHover ? 0.9 : 0.5}>
                          <animate attributeName="r" values={`${p.r + 4};${p.r + 10};${p.r + 4}`} dur="3s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.45;0.1;0.45" dur="3s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHover ? p.r + 2 : p.r}
                        fill={b.fill}
                        stroke="hsl(0 0% 100% / 0.85)"
                        strokeWidth={isHover ? 1.5 : 0.8}
                        opacity={p.avg !== null ? 0.92 : 0.45}
                        style={{ transition: "r 0.2s ease" }}
                      />
                      {/* Score label inside bigger bubbles */}
                      {p.r >= 12 && p.avg !== null && (
                        <text
                          x={p.x}
                          y={p.y + 3}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="700"
                          fill="hsl(217 50% 6%)"
                          fontFamily="system-ui, sans-serif"
                          pointerEvents="none"
                        >
                          {p.avg.toFixed(1)}
                        </text>
                      )}
                    </g>
                  </Link>
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 max-w-xs rounded-xl border border-brand-accent/30 bg-brand-primary/95 backdrop-blur-xl p-4 shadow-2xl pointer-events-none"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{hoveredPoint.country.flag_emoji}</span>
                  <div>
                    <p className="font-display text-body-md text-neutral-50 leading-tight">{hoveredPoint.country.name_display_pt}</p>
                    <p className="text-micro text-neutral-500 uppercase tracking-wider">{hoveredPoint.country.continent}</p>
                  </div>
                </div>
                {hoveredPoint.avg !== null ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-display text-heading-lg text-brand-accent leading-none">{hoveredPoint.avg.toFixed(2)}</span>
                      <span className="text-body-sm text-neutral-400">PIR+ médio</span>
                    </div>
                    <p className="text-body-sm text-neutral-400">
                      {hoveredPoint.count} {hoveredPoint.count === 1 ? "análise pública" : "análises públicas"} · {band(hoveredPoint.avg).label}
                    </p>
                    <p className="text-micro text-brand-accent mt-2">Clique para abrir análise →</p>
                  </>
                ) : (
                  <>
                    <p className="text-body-sm text-neutral-400">Sem análises públicas ainda.</p>
                    <p className="text-micro text-brand-accent mt-2">Clique para iniciar análise →</p>
                  </>
                )}
              </motion.div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/40 backdrop-blur-sm">
                <p className="text-body-sm text-neutral-400 animate-pulse">Carregando dados geoespaciais…</p>
              </div>
            )}
          </motion.div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-body-sm">
            <span className="text-neutral-500 text-micro uppercase tracking-wider">Banda PIR+:</span>
            {[
              { label: "Excelente ≥8.5", color: "hsl(158 64% 52%)" },
              { label: "Bom ≥7.0", color: "hsl(173 58% 48%)" },
              { label: "Médio ≥5.5", color: "hsl(45 92% 58%)" },
              { label: "Frágil ≥3.5", color: "hsl(25 90% 58%)" },
              { label: "Crítico <3.5", color: "hsl(0 75% 60%)" },
              { label: "Sem dado", color: "hsl(217 20% 35%)" },
            ].map((l) => (
              <span key={l.label} className="flex items-center gap-2 text-neutral-300">
                <span className="w-3 h-3 rounded-full border border-white/30" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Cross-links */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { to: "/atlas", label: "Atlas Comparativo", desc: "Grid de países com bandas de score" },
              { to: "/leaders", label: "Comparador de Líderes", desc: "Ranking cross-país por governante" },
              { to: "/methodology", label: "Metodologia PIR+", desc: "Framework Perspectiva · Imparcialidade · Rigor" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-brand-accent/40 hover:bg-brand-accent/[0.04] transition-all p-4 group"
              >
                <p className="font-display text-body-md text-neutral-50 group-hover:text-brand-accent transition-colors">{l.label} →</p>
                <p className="text-body-sm text-neutral-500 mt-1">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WorldMapPage;
