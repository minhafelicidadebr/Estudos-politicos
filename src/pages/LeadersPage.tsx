/**
 * LeadersPage — Sprint 19
 * Comparador Global de Líderes: agrega scores médios por líder político
 * extraídos de análises públicas, permitindo comparação cross-país.
 * 100% client-side, leve, sem novas dependências.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, ChevronRight, ArrowUpDown, Filter, Users } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { seedCountries } from "@/data/countries";
import { governmentsByCountry } from "@/data/governments";
import type { GovernmentRecord } from "@/types/aegis";

interface PublicAnalysis {
  id: string;
  country_id: string;
  governments: unknown;
  axis_data: Record<string, Record<string, number>> | null;
}

interface LeaderRow {
  govId: string;
  leader: string;
  govName: string;
  countryId: string;
  flag: string;
  countryName: string;
  party: string;
  yearStart: number;
  yearEnd: number | null;
  avgScore: number;
  axesCount: number;
  analysesCount: number;
}

const BAND = (s: number) => {
  if (s >= 8.5) return "from-emerald-400 to-emerald-600";
  if (s >= 7) return "from-emerald-500 to-teal-600";
  if (s >= 5.5) return "from-amber-400 to-orange-500";
  if (s >= 3.5) return "from-orange-500 to-red-500";
  return "from-neutral-600 to-neutral-700";
};

type SortKey = "score" | "year" | "leader";

export default function LeadersPage() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [continent, setContinent] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("id,country_id,governments,axis_data")
          .eq("is_public", true)
          .limit(500);
        if (error) throw error;

        // Acumula scores por governo
        const acc = new Map<string, { sum: number; count: number; analyses: Set<string>; axes: Set<string> }>();

        ((data ?? []) as PublicAnalysis[]).forEach((a) => {
          const ad = a.axis_data ?? {};
          const govIds = new Set<string>();
          const axisIds = Object.keys(ad);
          axisIds.forEach((axId) => {
            const perGov = ad[axId];
            if (!perGov || typeof perGov !== "object") return;
            Object.entries(perGov).forEach(([govId, v]) => {
              if (typeof v !== "number" || !isFinite(v)) return;
              govIds.add(govId);
              const cur = acc.get(govId) ?? { sum: 0, count: 0, analyses: new Set(), axes: new Set() };
              cur.sum += v;
              cur.count += 1;
              cur.analyses.add(a.id);
              cur.axes.add(axId);
              acc.set(govId, cur);
            });
          });
        });

        // Mapeia governos conhecidos
        const allGovs: GovernmentRecord[] = Object.values(governmentsByCountry).flat();
        const result: LeaderRow[] = [];
        for (const gov of allGovs) {
          const stats = acc.get(gov.id);
          if (!stats || stats.count === 0) continue;
          const country = seedCountries.find((c) => c.id === gov.countryId);
          if (!country) continue;
          result.push({
            govId: gov.id,
            leader: gov.leaderName,
            govName: gov.name,
            countryId: gov.countryId,
            flag: country.flag_emoji,
            countryName: country.name_display_pt,
            party: gov.party,
            yearStart: gov.yearStart,
            yearEnd: gov.yearEnd,
            avgScore: stats.sum / stats.count,
            axesCount: stats.axes.size,
            analysesCount: stats.analyses.size,
          });
        }
        setRows(result);
      } catch (e) {
        console.error("[LeadersPage]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const continents = useMemo(() => {
    const set = new Set<string>(["Todos"]);
    rows.forEach((r) => {
      const c = seedCountries.find((s) => s.id === r.countryId);
      if (c?.continent) set.add(c.continent);
    });
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (continent !== "Todos") {
      out = out.filter((r) => seedCountries.find((s) => s.id === r.countryId)?.continent === continent);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) => r.leader.toLowerCase().includes(q) || r.countryName.toLowerCase().includes(q) || r.party.toLowerCase().includes(q),
      );
    }
    out = [...out].sort((a, b) => {
      if (sortKey === "score") return b.avgScore - a.avgScore;
      if (sortKey === "year") return b.yearStart - a.yearStart;
      return a.leader.localeCompare(b.leader);
    });
    return out;
  }, [rows, continent, search, sortKey]);

  const topLeader = filtered[0];
  const globalAvg = filtered.length ? filtered.reduce((acc, r) => acc + r.avgScore, 0) / filtered.length : 0;

  return (
    <>
      <NavBar />
      <main id="main-content" className="min-h-screen pt-16 bg-brand-primary">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Comparador de Líderes</span>
          </nav>

          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-8 h-8 text-brand-accent" />
              <h1 className="font-display text-display-lg text-neutral-50">Comparador Global de Líderes</h1>
            </div>
            <p className="text-body-md text-neutral-400 max-w-2xl">
              Ranking PIR+ agregado de líderes políticos a partir de análises comparativas públicas. Cross-país, multi-eixo, atualizado em tempo real.
            </p>
          </motion.header>

          {/* KPIs */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <KpiCard label="Líderes cobertos" value={String(filtered.length)} accent />
            <KpiCard label="Média global PIR+" value={globalAvg.toFixed(2)} />
            <KpiCard label="Líder no topo" value={topLeader?.leader.split(" ").slice(-1)[0] ?? "—"} subtitle={topLeader ? `${topLeader.flag} ${topLeader.avgScore.toFixed(1)}` : ""} />
            <KpiCard label="Países representados" value={String(new Set(filtered.map((r) => r.countryId)).size)} />
          </section>

          {/* Controls */}
          <section className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-body-sm text-neutral-400">
              <Filter className="w-4 h-4" /> Continente:
            </div>
            <div className="flex flex-wrap gap-2">
              {continents.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`px-3 py-1.5 rounded-full text-body-xs border transition-all ${
                    continent === c
                      ? "border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
                      : "border-white/10 bg-white/[0.02] text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar líder, país ou partido…"
              className="ml-auto px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-body-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-brand-accent/50 w-full sm:w-64"
            />
            <button
              onClick={() => setSortKey((k) => (k === "score" ? "year" : k === "year" ? "leader" : "score"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-body-xs text-neutral-300 hover:text-neutral-50 hover:bg-white/[0.05] transition-all"
              title="Alternar ordenação"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortKey === "score" ? "Score" : sortKey === "year" ? "Ano" : "Nome"}
            </button>
          </section>

          {/* Lista */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-white/[0.04] bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-body-md text-neutral-400 mb-2">Nenhum líder encontrado nas análises públicas.</p>
              <Link to="/" className="text-brand-accent hover:text-brand-accent-bright text-body-sm">
                Iniciar uma análise →
              </Link>
            </div>
          ) : (
            <ol className="space-y-2">
              {filtered.map((r, i) => (
                <motion.li
                  key={r.govId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.015, 0.4) }}
                >
                  <Link
                    to={`/comparative/${r.countryId.toLowerCase()}`}
                    className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-accent/30 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-body-sm font-mono text-neutral-400 shrink-0">
                      {sortKey === "score" ? `#${i + 1}` : r.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-body-md text-neutral-100 font-medium truncate">{r.leader}</span>
                        <span className="text-body-xs text-neutral-500 truncate">{r.flag} {r.countryName} · {r.party}</span>
                      </div>
                      <div className="text-body-xs text-neutral-500 mt-0.5">
                        {r.govName} · {r.yearStart}–{r.yearEnd ?? "atual"} · {r.axesCount} eixos · {r.analysesCount} análise{r.analysesCount > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 w-44">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-lg text-neutral-50">{r.avgScore.toFixed(2)}</span>
                        <span className="text-body-xs text-neutral-500">/10</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${BAND(r.avgScore)} transition-all`}
                          style={{ width: `${Math.min(100, Math.max(2, (r.avgScore / 10) * 100))}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-brand-accent transition-colors shrink-0" />
                  </Link>
                </motion.li>
              ))}
            </ol>
          )}

          {/* Rodapé metodológico */}
          <p className="mt-10 text-body-xs text-neutral-500 max-w-2xl">
            Metodologia: agregação determinística do score PIR+ por governo, considerando todos os eixos analíticos presentes em análises públicas (RLS-protegidas). Líderes sem dados públicos não são listados.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function KpiCard({ label, value, subtitle, accent = false }: { label: string; value: string; subtitle?: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${accent ? "border-brand-accent/30 bg-brand-accent/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
      <div className="text-body-xs text-neutral-500 uppercase tracking-wide">{label}</div>
      <div className={`font-display text-2xl mt-1 ${accent ? "text-brand-accent" : "text-neutral-50"}`}>{value}</div>
      {subtitle && <div className="text-body-xs text-neutral-500 mt-0.5 truncate">{subtitle}</div>}
    </div>
  );
}
