/**
 * Sprint 22 — Insights Engine Determinístico
 * Auto-gera insights cross-país a partir de análises públicas. 100% client-side, zero LLM.
 * Métricas: Axis Champions, Maiores Gaps, Convergências, Divergências, Líderes Globais.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, GitMerge, Split, Trophy, ArrowRight } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seedCountries } from "@/data/countries";

interface AnalysisRow {
  id: string;
  title: string | null;
  country_id: string;
  scores: Record<string, number> | null;
}

const countryName = (id: string) =>
  seedCountries.find((c) => c.id.toUpperCase() === id.toUpperCase())?.name_display_pt ?? id;
const countryFlag = (id: string) =>
  seedCountries.find((c) => c.id.toUpperCase() === id.toUpperCase())?.flag_emoji ?? "🌐";

// Stdev determinístico
const stdev = (vals: number[]): number => {
  if (vals.length < 2) return 0;
  const m = vals.reduce((s, v) => s + v, 0) / vals.length;
  const v = vals.reduce((s, x) => s + (x - m) ** 2, 0) / vals.length;
  return Math.sqrt(v);
};

const InsightsPage = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AnalysisRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("analyses")
        .select("id, title, country_id, scores")
        .eq("is_public", true)
        .limit(500);
      setRows((data as AnalysisRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const insights = useMemo(() => {
    // axis → list of {countryId, score}
    const axisMap = new Map<string, { country: string; score: number }[]>();
    // country → list of scores (across all axes/analyses)
    const countryScores = new Map<string, number[]>();

    rows.forEach((r) => {
      const cid = r.country_id.toUpperCase();
      Object.entries(r.scores ?? {}).forEach(([axis, raw]) => {
        const s = typeof raw === "number" ? raw : null;
        if (s === null || !isFinite(s)) return;
        if (!axisMap.has(axis)) axisMap.set(axis, []);
        axisMap.get(axis)!.push({ country: cid, score: s });
        if (!countryScores.has(cid)) countryScores.set(cid, []);
        countryScores.get(cid)!.push(s);
      });
    });

    // Axis champions: por eixo, país com maior média
    const axisStats = Array.from(axisMap.entries()).map(([axis, list]) => {
      const byCountry = new Map<string, number[]>();
      list.forEach((e) => {
        if (!byCountry.has(e.country)) byCountry.set(e.country, []);
        byCountry.get(e.country)!.push(e.score);
      });
      const aggregates = Array.from(byCountry.entries()).map(([c, vals]) => ({
        country: c,
        avg: vals.reduce((s, v) => s + v, 0) / vals.length,
      }));
      aggregates.sort((a, b) => b.avg - a.avg);
      const allVals = list.map((e) => e.score);
      const mean = allVals.reduce((s, v) => s + v, 0) / (allVals.length || 1);
      return {
        axis,
        sample: list.length,
        countries: aggregates.length,
        champion: aggregates[0],
        laggard: aggregates[aggregates.length - 1],
        gap: aggregates.length > 1 ? aggregates[0].avg - aggregates[aggregates.length - 1].avg : 0,
        mean,
        dispersion: stdev(aggregates.map((a) => a.avg)),
      };
    });

    const champions = axisStats
      .filter((a) => a.countries >= 2)
      .slice()
      .sort((a, b) => (b.champion?.avg ?? 0) - (a.champion?.avg ?? 0))
      .slice(0, 6);

    const biggestGaps = axisStats
      .filter((a) => a.countries >= 2)
      .slice()
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 6);

    const convergences = axisStats
      .filter((a) => a.countries >= 3)
      .slice()
      .sort((a, b) => a.dispersion - b.dispersion)
      .slice(0, 5);

    const divergences = axisStats
      .filter((a) => a.countries >= 3)
      .slice()
      .sort((a, b) => b.dispersion - a.dispersion)
      .slice(0, 5);

    const countryLeaders = Array.from(countryScores.entries())
      .map(([c, vals]) => ({ country: c, avg: vals.reduce((s, v) => s + v, 0) / vals.length, count: vals.length }))
      .sort((a, b) => b.avg - a.avg);

    return { axisStats, champions, biggestGaps, convergences, divergences, countryLeaders };
  }, [rows]);

  const totalAnalyses = rows.length;
  const totalAxes = insights.axisStats.length;

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-24 px-4 lg:px-8 pb-24">
        <div className="max-w-[1320px] mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl border border-brand-accent/40 bg-brand-accent/5 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-micro tracking-[0.18em] uppercase text-brand-accent">Sprint 22 · Insights Engine</p>
                <h1 className="font-display text-heading-2xl text-neutral-50 leading-none mt-1">Insights Globais Determinísticos</h1>
              </div>
            </div>
            <p className="text-body-md text-neutral-400 max-w-2xl">
              Padrões cross-país extraídos algoritmicamente de todas as análises públicas. Zero LLM, zero suposição —
              estatística pura sobre o framework PIR+.
            </p>
          </motion.div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Análises processadas", value: totalAnalyses },
              { label: "Eixos cobertos", value: totalAxes },
              { label: "Países com dados", value: insights.countryLeaders.length },
              { label: "Padrões detectados", value: insights.champions.length + insights.biggestGaps.length + insights.convergences.length + insights.divergences.length },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4"
              >
                <div className="text-micro tracking-wider uppercase text-neutral-500 mb-2">{k.label}</div>
                <div className="font-display text-heading-md text-neutral-50">{k.value}</div>
              </motion.div>
            ))}
          </div>

          {loading && <p className="text-body-sm text-neutral-400 animate-pulse">Processando análises…</p>}

          {!loading && totalAnalyses === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <p className="text-body-md text-neutral-300">Ainda não há análises públicas suficientes para gerar insights.</p>
              <Link to="/library" className="inline-flex items-center gap-2 mt-4 text-brand-accent hover:underline text-body-sm">
                Explorar Biblioteca <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!loading && totalAnalyses > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Axis Champions */}
              <Section icon={<Trophy className="w-4 h-4 text-emerald-400" />} title="Campeões por Eixo" subtitle="País líder em cada dimensão analítica">
                {insights.champions.map((a) => (
                  <Row
                    key={a.axis}
                    title={a.axis}
                    subtitle={`${a.countries} países · n=${a.sample}`}
                    primary={`${countryFlag(a.champion.country)} ${countryName(a.champion.country)}`}
                    value={a.champion.avg.toFixed(2)}
                    valueClass="text-emerald-400"
                    to={`/comparative/${a.champion.country.toLowerCase()}`}
                  />
                ))}
              </Section>

              {/* Biggest Gaps */}
              <Section icon={<Split className="w-4 h-4 text-amber-400" />} title="Maiores Gaps Globais" subtitle="Eixos com maior distância entre líder e lanterna">
                {insights.biggestGaps.map((a) => (
                  <div key={a.axis} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:border-amber-400/30 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-body-sm text-neutral-200 font-medium">{a.axis}</p>
                      <span className="font-display text-body-md text-amber-400 shrink-0">Δ {a.gap.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-micro text-neutral-400">
                      <span className="text-emerald-400/90">{countryFlag(a.champion.country)} {a.champion.avg.toFixed(1)}</span>
                      <span className="text-neutral-600">→</span>
                      <span className="text-red-400/90">{countryFlag(a.laggard.country)} {a.laggard.avg.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </Section>

              {/* Convergences */}
              <Section icon={<GitMerge className="w-4 h-4 text-teal-400" />} title="Convergências" subtitle="Eixos onde países convergem (menor dispersão)">
                {insights.convergences.map((a) => (
                  <Row
                    key={a.axis}
                    title={a.axis}
                    subtitle={`Dispersão σ=${a.dispersion.toFixed(2)} · ${a.countries} países`}
                    primary={`Média global ${a.mean.toFixed(2)}`}
                    value="≈"
                    valueClass="text-teal-400 font-display text-2xl"
                  />
                ))}
              </Section>

              {/* Divergences */}
              <Section icon={<TrendingUp className="w-4 h-4 text-orange-400" />} title="Divergências" subtitle="Eixos onde países mais diferem (maior dispersão)">
                {insights.divergences.map((a) => (
                  <Row
                    key={a.axis}
                    title={a.axis}
                    subtitle={`Dispersão σ=${a.dispersion.toFixed(2)} · ${a.countries} países`}
                    primary={`Média global ${a.mean.toFixed(2)}`}
                    value="↯"
                    valueClass="text-orange-400 font-display text-2xl"
                  />
                ))}
              </Section>

              {/* Country Leaders */}
              <Section icon={<TrendingUp className="w-4 h-4 text-brand-accent" />} title="Top Países (PIR+ médio)" subtitle="Líderes globais agregados" wide>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {insights.countryLeaders.slice(0, 10).map((c, i) => (
                    <Link
                      key={c.country}
                      to={`/comparative/${c.country.toLowerCase()}`}
                      className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:border-brand-accent/40 p-3 transition-all"
                    >
                      <span className="font-display text-body-sm text-neutral-500 w-5">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-xl">{countryFlag(c.country)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-neutral-100 truncate">{countryName(c.country)}</p>
                        <p className="text-micro text-neutral-500">{c.count} pontuações</p>
                      </div>
                      <span className="font-display text-body-md text-brand-accent">{c.avg.toFixed(2)}</span>
                    </Link>
                  ))}
                </div>
              </Section>

              {/* Laggards by axis */}
              <Section icon={<TrendingDown className="w-4 h-4 text-red-400" />} title="Pontos de Atenção" subtitle="Pares país×eixo com menor score" wide>
                {insights.axisStats
                  .filter((a) => a.laggard)
                  .sort((a, b) => (a.laggard?.avg ?? 99) - (b.laggard?.avg ?? 99))
                  .slice(0, 6)
                  .map((a) => (
                    <Row
                      key={a.axis}
                      title={a.axis}
                      subtitle={`Lanterna em ${a.countries} países`}
                      primary={`${countryFlag(a.laggard!.country)} ${countryName(a.laggard!.country)}`}
                      value={a.laggard!.avg.toFixed(2)}
                      valueClass="text-red-400"
                      to={`/comparative/${a.laggard!.country.toLowerCase()}`}
                    />
                  ))}
              </Section>
            </div>
          )}

          {/* Cross-links */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { to: "/world-map", label: "Mapa Mundial PIR+", desc: "Visualização geoespacial das bandas" },
              { to: "/atlas", label: "Atlas Comparativo", desc: "Grid de países com bandas de score" },
              { to: "/leaders", label: "Comparador de Líderes", desc: "Ranking cross-país por governante" },
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

const Section = ({ icon, title, subtitle, children, wide }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; wide?: boolean }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 ${wide ? "lg:col-span-2" : ""}`}
  >
    <header className="flex items-center gap-2 mb-1">
      {icon}
      <h2 className="font-display text-body-lg text-neutral-50">{title}</h2>
    </header>
    <p className="text-micro text-neutral-500 mb-4">{subtitle}</p>
    <div className="space-y-2">{children}</div>
  </motion.section>
);

const Row = ({
  title,
  subtitle,
  primary,
  value,
  valueClass,
  to,
}: {
  title: string;
  subtitle: string;
  primary: string;
  value: string;
  valueClass?: string;
  to?: string;
}) => {
  const inner = (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 hover:border-brand-accent/30 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-neutral-100 truncate">{title}</p>
        <p className="text-micro text-neutral-500 truncate">{subtitle} · {primary}</p>
      </div>
      <span className={`font-display text-body-md ${valueClass ?? "text-brand-accent"} shrink-0`}>{value}</span>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

export default InsightsPage;
