/**
 * DebateViewerPage — Sprint 11.
 * Cinematic head-to-head visualization of two governments from a saved analysis.
 * Frontend-only consumer of analysesService; deterministic rendering, no AI calls.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Swords, Trophy, Minus, Loader2, Sparkles } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { getAnalysis, type SavedAnalysis } from "@/services/analysesService";
import { useToast } from "@/hooks/use-toast";
import { ease } from "@/lib/motion";
import { NarrativeModal } from "@/components/narrative/NarrativeModal";

interface GovLite { id: string; name: string; period?: string; color?: string }
interface AxisRow { id: string; label: string; left: number; right: number }

const DebateViewerPage = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(0);
  const [narrating, setNarrating] = useState(false);

  useEffect(() => {
    if (!analysisId) return;
    (async () => {
      try {
        const data = await getAnalysis(analysisId);
        if (!data) {
          toast({ title: "Análise não encontrada", variant: "destructive" });
          navigate("/history");
          return;
        }
        setAnalysis(data);
      } catch (e) {
        toast({ title: "Erro ao carregar", description: e instanceof Error ? e.message : "—", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId, navigate, toast]);

  const { left, right, axes, leftWins, rightWins, ties } = useMemo(() => {
    if (!analysis) return { left: null as GovLite | null, right: null as GovLite | null, axes: [] as AxisRow[], leftWins: 0, rightWins: 0, ties: 0 };
    const govs = (analysis.governments as GovLite[]) ?? [];
    const l = govs[0] ?? { id: "a", name: "Governo A" };
    const r = govs[1] ?? govs[0] ?? { id: "b", name: "Governo B" };
    const axisData = (analysis.axis_data as Record<string, Record<string, number>>) ?? {};
    const rows: AxisRow[] = Object.entries(axisData).map(([key, perGov]) => ({
      id: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      left: Number(perGov?.[l.id] ?? 0),
      right: Number(perGov?.[r.id] ?? 0),
    }));
    let lw = 0, rw = 0, tt = 0;
    rows.forEach((row) => {
      if (Math.abs(row.left - row.right) < 2) tt++;
      else if (row.left > row.right) lw++;
      else rw++;
    });
    return { left: l, right: r, axes: rows, leftWins: lw, rightWins: rw, ties: tt };
  }, [analysis]);

  const rounds = useMemo(() => {
    // Group axes into rounds of 4 for cinematic pacing.
    const size = 4;
    const out: AxisRow[][] = [];
    for (let i = 0; i < axes.length; i += size) out.push(axes.slice(i, i + size));
    return out;
  }, [axes]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-primary">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </main>
    );
  }

  if (!analysis || !left || !right) return null;

  const winner = leftWins === rightWins ? null : leftWins > rightWins ? left : right;
  const currentRound = rounds[round] ?? [];

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16 bg-brand-primary text-neutral-50">
        {/* Ambient gradient mesh */}
        <div aria-hidden className="fixed inset-0 -z-10 opacity-60 pointer-events-none">
          <div className="absolute -left-40 top-20 w-[520px] h-[520px] rounded-full blur-3xl bg-confidence-low/15" />
          <div className="absolute -right-40 top-40 w-[520px] h-[520px] rounded-full blur-3xl bg-axis-a/15" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[400px] rounded-full blur-3xl bg-brand-accent/10" />
        </div>

        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-6">
            <Link to="/history" className="hover:text-neutral-200 transition-colors">Histórico</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Debate</span>
          </nav>

          {/* Header arena */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.cinematic }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-accent/30 bg-brand-accent/5 text-brand-accent text-micro tracking-[0.2em] uppercase mb-4">
              <Swords className="w-3.5 h-3.5" /> Arena de Debate
            </div>
            <h1 className="font-display text-display-xl mb-2">{analysis.title}</h1>
            <p className="text-body-md text-neutral-400 mb-5">
              {axes.length} eixos disputados · {rounds.length} rounds
            </p>
            <button
              onClick={() => setNarrating(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-accent text-brand-primary text-body-sm font-medium hover:bg-brand-accent-bright transition-colors shadow-[0_8px_30px_rgba(201,168,76,0.25)]"
            >
              <Sparkles className="w-4 h-4" /> Narrar este debate com IA
            </button>
          </motion.header>

          {/* Combatants */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 mb-12">
            <Combatant gov={left} side="left" wins={leftWins} active={!!winner && winner.id === left.id} />
            <div className="flex flex-col items-center gap-2">
              <div className="font-display text-display-lg text-brand-accent">VS</div>
              <div className="text-micro text-neutral-500 tracking-widest">{ties} empates</div>
            </div>
            <Combatant gov={right} side="right" wins={rightWins} active={!!winner && winner.id === right.id} />
          </div>

          {/* Round selector */}
          {rounds.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-8" role="tablist">
              {rounds.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={round === i}
                  onClick={() => setRound(i)}
                  className={`h-1.5 rounded-full transition-all ${round === i ? "w-10 bg-brand-accent" : "w-6 bg-neutral-700 hover:bg-neutral-600"}`}
                  aria-label={`Round ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Round arena */}
          <AnimatePresence mode="wait">
            <motion.section
              key={round}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: ease.cinematic }}
              className="space-y-3"
              aria-label={`Round ${round + 1}`}
            >
              {currentRound.map((row, idx) => (
                <DebateRow key={row.id} row={row} idx={idx} leftName={left.name} rightName={right.name} />
              ))}
            </motion.section>
          </AnimatePresence>

          {/* Round nav */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => setRound((r) => Math.max(0, r - 1))}
              disabled={round === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700/40 hover:border-brand-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-body-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Round anterior
            </button>
            <span className="text-micro text-neutral-500 tracking-widest">
              ROUND {round + 1} / {Math.max(rounds.length, 1)}
            </span>
            <button
              onClick={() => setRound((r) => Math.min(rounds.length - 1, r + 1))}
              disabled={round >= rounds.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700/40 hover:border-brand-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-body-sm"
            >
              Próximo round <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Verdict */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center p-10 rounded-2xl border border-brand-accent/20 bg-brand-accent/[0.04]"
          >
            <Trophy className="w-10 h-10 text-brand-accent mx-auto mb-3" />
            <p className="text-micro text-neutral-500 tracking-widest mb-2">VEREDITO</p>
            <h2 className="font-display text-display-lg">
              {winner ? winner.name : "Empate técnico"}
            </h2>
            <p className="text-body-sm text-neutral-400 mt-2">
              Vitórias: {leftWins} × {rightWins} · {ties} empates por proximidade analítica
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
      <NarrativeModal open={narrating} onClose={() => setNarrating(false)} analysis={analysis} />
    </>
  );
};

const Combatant = ({ gov, side, wins, active }: { gov: GovLite; side: "left" | "right"; wins: number; active: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7, ease: ease.cinematic }}
    className={`relative p-6 rounded-2xl border bg-white/[0.03] ${active ? "border-brand-accent/60 shadow-[0_0_60px_rgba(201,168,76,0.2)]" : "border-neutral-700/40"}`}
  >
    <div className="text-micro text-neutral-500 tracking-widest mb-2 uppercase">
      {side === "left" ? "Combatente A" : "Combatente B"}
    </div>
    <h3 className="font-display text-display-md text-neutral-50 mb-1">{gov.name}</h3>
    {gov.period && <p className="text-body-sm text-neutral-500 mb-4">{gov.period}</p>}
    <div className="flex items-center gap-2">
      <div className="font-display text-4xl text-brand-accent">{wins}</div>
      <div className="text-micro text-neutral-500 leading-tight">eixos<br />vencidos</div>
    </div>
  </motion.div>
);

const DebateRow = ({ row, idx, leftName, rightName }: { row: AxisRow; idx: number; leftName: string; rightName: string }) => {
  // Normalize to 0-100 for visualization, accepting either 0-10 or 0-100 source scales.
  const norm = (v: number) => (v <= 10 ? v * 10 : Math.min(100, Math.max(0, v)));
  const ln = norm(row.left);
  const rn = norm(row.right);
  const diff = ln - rn;
  const lead = Math.abs(diff) < 4 ? "tie" : diff > 0 ? "left" : "right";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] hover:border-brand-accent/20 transition-colors"
    >
      <div className={`flex flex-col items-end gap-1.5 ${lead === "left" ? "opacity-100" : "opacity-60"}`}>
        <div className="text-micro text-neutral-500">{leftName}</div>
        <div className="flex items-center gap-2 w-full justify-end">
          <span className="font-mono text-2xl text-neutral-50 tabular-nums">{row.left.toFixed(0)}</span>
          <div className="w-32 h-1.5 rounded-full bg-neutral-700/50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ln}%` }}
              transition={{ duration: 0.7, delay: idx * 0.05 }}
              className={`h-full ${lead === "left" ? "bg-brand-accent" : "bg-neutral-500"}`}
            />
          </div>
        </div>
      </div>
      <div className="text-center px-3 min-w-[120px]">
        <div className="text-micro text-neutral-500 tracking-widest mb-1">{row.label}</div>
        {lead === "tie" ? (
          <Minus className="w-4 h-4 text-neutral-500 mx-auto" />
        ) : (
          <span className="text-brand-accent text-body-sm font-semibold">+{Math.abs(row.left - row.right).toFixed(0)}</span>
        )}
      </div>
      <div className={`flex flex-col items-start gap-1.5 ${lead === "right" ? "opacity-100" : "opacity-60"}`}>
        <div className="text-micro text-neutral-500">{rightName}</div>
        <div className="flex items-center gap-2 w-full">
          <div className="w-32 h-1.5 rounded-full bg-neutral-700/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rn}%` }}
              transition={{ duration: 0.7, delay: idx * 0.05 }}
              className={`h-full ${lead === "right" ? "bg-brand-accent" : "bg-neutral-500"}`}
            />
          </div>
          <span className="font-mono text-2xl text-neutral-50 tabular-nums">{row.right.toFixed(0)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DebateViewerPage;
