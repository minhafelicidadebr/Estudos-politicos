/**
 * LigaPage — Sprint 12.
 * Public leaderboard of analyses (is_public=true visible per RLS to authenticated users).
 * Deterministic ranking by average score with a podium and full table.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Trophy, Crown, Medal, Award, Loader2, Globe2 } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ease } from "@/lib/motion";

interface LeaderRow {
  id: string;
  title: string;
  country_id: string;
  updated_at: string;
  score: number;
  axes: number;
}

const LigaPage = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("id, title, country_id, updated_at, scores, axis_data")
          .eq("is_public", true)
          .order("updated_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        const computed: LeaderRow[] = (data ?? []).map((a) => {
          const s = a.scores as Record<string, unknown> | null;
          const axisData = a.axis_data as Record<string, Record<string, number>> | null;
          const explicit = typeof s?.average === "number" ? (s.average as number) : null;
          let avg = 0;
          if (explicit != null) avg = explicit;
          else if (s) {
            const vals = Object.values(s).filter((v): v is number => typeof v === "number");
            avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0;
          }
          return {
            id: a.id,
            title: a.title,
            country_id: a.country_id,
            updated_at: a.updated_at,
            score: avg,
            axes: axisData ? Object.keys(axisData).length : 0,
          };
        });
        computed.sort((x, y) => y.score - x.score);
        setRows(computed);
      } catch (e) {
        toast({ title: "Erro ao carregar Liga", description: e instanceof Error ? e.message : "—", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const countries = useMemo(() => {
    const set = new Set(rows.map((r) => r.country_id.toUpperCase()));
    return ["ALL", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((r) => r.country_id.toUpperCase() === filter)),
    [filter, rows]
  );

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16 bg-brand-primary text-neutral-50">
        <div aria-hidden className="fixed inset-0 -z-10 opacity-50 pointer-events-none">
          <div className="absolute left-1/2 -translate-x-1/2 top-10 w-[700px] h-[400px] rounded-full blur-3xl bg-brand-accent/15" />
        </div>

        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Liga Ágora</span>
          </nav>

          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.cinematic }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/5 text-brand-accent text-micro tracking-[0.2em] uppercase mb-4">
              <Trophy className="w-3.5 h-3.5" /> Ranking público
            </div>
            <h1 className="font-display text-display-xl mb-3">Liga Ágora</h1>
            <p className="text-body-md text-neutral-400 max-w-2xl mx-auto">
              Análises públicas ranqueadas pelo PIR+ médio. Torne sua análise pública para participar.
            </p>
          </motion.header>

          {/* Country filter */}
          {!loading && countries.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap justify-center mb-10" role="tablist" aria-label="Filtrar por país">
              {countries.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  role="tab"
                  aria-selected={filter === c}
                  className={`px-3 py-1.5 rounded-full text-body-sm transition-all ${
                    filter === c
                      ? "bg-brand-accent text-brand-primary font-medium"
                      : "border border-neutral-700/40 text-neutral-400 hover:text-neutral-200 hover:border-brand-accent/30"
                  }`}
                >
                  {c === "ALL" ? "Todos" : c}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Globe2 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-body-md text-neutral-400">Nenhuma análise pública ainda.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 items-end">
                {[1, 0, 2].map((order) => {
                  const r = podium[order];
                  if (!r) return <div key={order} className="hidden md:block" />;
                  const meta = order === 0
                    ? { icon: Crown, ring: "border-brand-accent shadow-[0_0_60px_rgba(201,168,76,0.3)]", h: "h-72", label: "1º" }
                    : order === 1
                    ? { icon: Medal, ring: "border-neutral-400/50", h: "h-60", label: "2º" }
                    : { icon: Award, ring: "border-amber-700/50", h: "h-52", label: "3º" };
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: order * 0.15, ease: ease.cinematic, duration: 0.7 }}
                      className={`relative p-6 rounded-2xl border bg-white/[0.04] flex flex-col justify-end ${meta.ring} ${meta.h}`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${order === 0 ? "text-brand-accent" : "text-neutral-400"}`} />
                      <div className="text-micro text-neutral-500 tracking-widest mb-1">{meta.label} LUGAR</div>
                      <h3 className="font-display text-heading-md text-neutral-50 line-clamp-2 mb-2">{r.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-body-sm text-neutral-400">{r.country_id.toUpperCase()}</span>
                        <span className="font-mono text-3xl text-brand-accent tabular-nums">{r.score.toFixed(1)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Table */}
              {rest.length > 0 && (
                <section aria-label="Demais posições" className="rounded-2xl border border-neutral-700/30 overflow-hidden">
                  <table className="w-full text-body-sm">
                    <thead className="bg-white/[0.02] text-neutral-500 text-micro tracking-widest">
                      <tr>
                        <th className="text-left px-5 py-3 font-normal">#</th>
                        <th className="text-left px-5 py-3 font-normal">Análise</th>
                        <th className="text-left px-5 py-3 font-normal hidden sm:table-cell">País</th>
                        <th className="text-left px-5 py-3 font-normal hidden md:table-cell">Eixos</th>
                        <th className="text-right px-5 py-3 font-normal">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rest.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-t border-neutral-700/20 hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-5 py-3 font-mono text-neutral-500 tabular-nums">{i + 4}</td>
                          <td className="px-5 py-3">
                            <Link to={`/debate/${r.id}`} className="text-neutral-100 hover:text-brand-accent transition-colors line-clamp-1">
                              {r.title}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-neutral-400 hidden sm:table-cell">{r.country_id.toUpperCase()}</td>
                          <td className="px-5 py-3 text-neutral-500 hidden md:table-cell">{r.axes}</td>
                          <td className="px-5 py-3 text-right font-mono text-brand-accent tabular-nums">{r.score.toFixed(1)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LigaPage;
