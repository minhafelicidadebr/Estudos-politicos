/**
 * AtlasPage — Sprint 15
 * Atlas Comparativo Global: agrega análises públicas por país e continente,
 * exibindo um mapa-grid com bandas PIR+ e ranking por continente.
 * 100% client-side, sem novas dependências.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Globe2, ChevronRight, TrendingUp, Database, Filter } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seedCountries, continents as CONTINENTS } from "@/data/countries";
import { useToast } from "@/hooks/use-toast";

interface PublicAnalysis {
  id: string;
  title: string;
  country_id: string;
  scores: Record<string, unknown> | null;
  axis_data: Record<string, Record<string, number>> | null;
  updated_at: string;
}

interface CountryAggregate {
  countryId: string;
  name: string;
  flag: string;
  continent: string;
  count: number;
  avgScore: number;
  bestAxis: { id: string; value: number } | null;
  worstAxis: { id: string; value: number } | null;
}

const BAND_COLOR = (s: number): string => {
  if (s >= 8.5) return "bg-confidence-high text-brand-deep";
  if (s >= 7) return "bg-emerald-500/80 text-brand-deep";
  if (s >= 5.5) return "bg-amber-500/80 text-brand-deep";
  if (s >= 3.5) return "bg-orange-500/80 text-neutral-50";
  if (s > 0) return "bg-confidence-low/90 text-neutral-50";
  return "bg-white/[0.04] text-neutral-600";
};

const BAND_LABEL = (s: number): string => {
  if (s >= 8.5) return "Referência";
  if (s >= 7) return "Alto";
  if (s >= 5.5) return "Sólido";
  if (s >= 3.5) return "Medíocre";
  if (s > 0) return "Crítico";
  return "Sem dados";
};

const avgScoreOf = (scores: Record<string, unknown> | null): number => {
  if (!scores) return 0;
  const vals = Object.values(scores).filter((v) => typeof v === "number") as number[];
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

const AtlasPage = () => {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<PublicAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [continent, setContinent] = useState<string>("Todos");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("id,title,country_id,scores,axis_data,updated_at")
          .eq("is_public", true)
          .order("updated_at", { ascending: false })
          .limit(500);
        if (error) throw error;
        setAnalyses((data ?? []) as unknown as PublicAnalysis[]);
      } catch (e) {
        toast({ title: "Erro ao carregar atlas", description: e instanceof Error ? e.message : "—", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const aggregates: CountryAggregate[] = useMemo(() => {
    const byCountry = new Map<string, PublicAnalysis[]>();
    analyses.forEach((a) => {
      const key = a.country_id?.toUpperCase();
      if (!key) return;
      const arr = byCountry.get(key) ?? [];
      arr.push(a);
      byCountry.set(key, arr);
    });

    return seedCountries.map((c) => {
      const list = byCountry.get(c.id) ?? [];
      const scores = list.map((a) => avgScoreOf(a.scores)).filter((n) => n > 0);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      const axisAcc = new Map<string, number[]>();
      list.forEach((a) => {
        const ad = a.axis_data ?? {};
        Object.entries(ad).forEach(([axisId, perGov]) => {
          if (!perGov) return;
          const vals = Object.values(perGov).filter((v) => typeof v === "number") as number[];
          if (!vals.length) return;
          const m = vals.reduce((x, y) => x + y, 0) / vals.length;
          const arr = axisAcc.get(axisId) ?? [];
          arr.push(m);
          axisAcc.set(axisId, arr);
        });
      });
      const axisAverages = Array.from(axisAcc.entries())
        .map(([id, arr]) => ({ id, value: arr.reduce((a, b) => a + b, 0) / arr.length }))
        .sort((a, b) => b.value - a.value);

      return {
        countryId: c.id,
        name: c.name_display_pt,
        flag: c.flag_emoji,
        continent: c.continent,
        count: list.length,
        avgScore: avg,
        bestAxis: axisAverages[0] ?? null,
        worstAxis: axisAverages.length ? axisAverages[axisAverages.length - 1] : null,
      };
    });
  }, [analyses]);

  const filtered = useMemo(
    () => (continent === "Todos" ? aggregates : aggregates.filter((a) => a.continent === continent)),
    [aggregates, continent]
  );

  const kpis = useMemo(() => {
    const withData = aggregates.filter((a) => a.count > 0);
    const totalAnalyses = aggregates.reduce((s, a) => s + a.count, 0);
    const globalAvg = withData.length
      ? withData.reduce((s, a) => s + a.avgScore, 0) / withData.length
      : 0;
    const top = [...withData].sort((a, b) => b.avgScore - a.avgScore)[0];
    return { countriesCovered: withData.length, totalAnalyses, globalAvg, top };
  }, [aggregates]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-brand-deep via-brand-deep to-[#0d1a2f]">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Atlas Global</span>
          </nav>

          <motion.header
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center shrink-0">
              <Globe2 className="w-7 h-7 text-brand-accent" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-display-lg text-neutral-50">Atlas Comparativo Global</h1>
              <p className="text-body-md text-neutral-400 mt-1">
                Agregação ao vivo de análises públicas PIR+ por país e continente. Atualiza automaticamente conforme a comunidade publica novos estudos.
              </p>
            </div>
          </motion.header>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <KpiCard icon={<Globe2 className="w-4 h-4" />} label="Países cobertos" value={kpis.countriesCovered} />
            <KpiCard icon={<Database className="w-4 h-4" />} label="Análises públicas" value={kpis.totalAnalyses} />
            <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Média global PIR+" value={kpis.globalAvg.toFixed(2)} />
            <KpiCard
              icon={<span>{kpis.top?.flag ?? "—"}</span>}
              label="Líder atual"
              value={kpis.top?.name ?? "—"}
              hint={kpis.top ? `${kpis.top.avgScore.toFixed(2)}` : undefined}
            />
          </div>

          {/* Continent filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-500" />
            {CONTINENTS.map((c) => (
              <button
                key={c}
                onClick={() => setContinent(c)}
                className={`px-3 py-1.5 rounded-full text-body-sm transition border ${
                  continent === c
                    ? "bg-brand-accent text-brand-deep border-brand-accent"
                    : "bg-white/[0.02] text-neutral-400 border-neutral-700/40 hover:border-brand-accent/40 hover:text-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Country grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl border border-neutral-700/30 bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.countryId}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-xl border border-neutral-700/30 bg-white/[0.02] hover:border-brand-accent/40 hover:bg-white/[0.04] transition-all p-4 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl">{c.flag}</span>
                      <div className="min-w-0">
                        <h3 className="text-body-md font-semibold text-neutral-50 truncate">{c.name}</h3>
                        <p className="text-micro text-neutral-500">{c.continent}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-micro font-mono ${BAND_COLOR(c.avgScore)}`}>
                      {c.avgScore > 0 ? c.avgScore.toFixed(1) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-micro text-neutral-500 mb-2">
                    <span>{c.count} análise{c.count !== 1 ? "s" : ""}</span>
                    <span>{BAND_LABEL(c.avgScore)}</span>
                  </div>
                  {c.bestAxis && c.worstAxis && (
                    <div className="space-y-1 pt-2 border-t border-neutral-700/30">
                      <div className="flex items-center justify-between text-micro">
                        <span className="text-neutral-500 truncate">↑ {c.bestAxis.id}</span>
                        <span className="text-emerald-400 font-mono">{c.bestAxis.value.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between text-micro">
                        <span className="text-neutral-500 truncate">↓ {c.worstAxis.id}</span>
                        <span className="text-orange-400 font-mono">{c.worstAxis.value.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Link
                      to={`/timeline/${c.countryId.toLowerCase()}`}
                      className="text-micro text-neutral-400 hover:text-brand-accent transition"
                    >
                      Timeline →
                    </Link>
                    {c.count > 0 && (
                      <Link
                        to={`/comparative/${c.countryId.toLowerCase()}`}
                        className="text-micro text-brand-accent opacity-70 group-hover:opacity-100 transition"
                      >
                        Análise →
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filtered.every((c) => c.count === 0) && (
            <div className="text-center py-12 mt-6 rounded-xl border border-dashed border-neutral-700/40">
              <p className="text-body-sm text-neutral-500">
                Nenhuma análise pública neste continente ainda. Seja o primeiro a publicar uma.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

const KpiCard = ({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-xl border border-neutral-700/30 bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 text-micro text-neutral-500 mb-2">
      <span className="text-brand-accent">{icon}</span>
      {label}
    </div>
    <div className="font-display text-display-sm text-neutral-50 truncate">{value}</div>
    {hint && <div className="text-micro text-neutral-500 mt-1 font-mono">{hint}</div>}
  </div>
);

export default AtlasPage;
