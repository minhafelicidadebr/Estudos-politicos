/**
 * PoliticalWrappedPage — Sprint 8: Cinematic retrospective story.
 * Spotify-Wrapped-style full-screen cards with auto-advance, share, and download.
 * Master Plus quality: glassmorphism, gradient mesh, Framer Motion choreography.
 */
import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Pause, Play, Share2, Download, Sparkles,
  Globe2, Target, Flame, TrendingUp, Award, Compass, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWrappedStats, type WrappedStats } from "@/services/wrappedService";
import { ease } from "@/lib/motion";
import { toast } from "sonner";

const SLIDE_MS = 6500;

type Slide = {
  id: string;
  bg: string;
  accent: string;
  render: (s: WrappedStats) => JSX.Element;
};

function Stat({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: ease.cinematic, delay: 0.25 }}
      className="text-center"
    >
      <div className="font-display text-7xl md:text-9xl text-white leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-4 text-lg md:text-xl text-white/80 font-medium">{label}</div>
      {sub && <div className="mt-2 text-sm text-white/60">{sub}</div>}
    </motion.div>
  );
}

function Title({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: ease.cinematic }}
      className="text-center mb-8"
    >
      {kicker && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs uppercase tracking-widest text-white/80 mb-4">
          <Sparkles className="w-3 h-3" /> {kicker}
        </div>
      )}
      <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-white/70 text-base md:text-lg max-w-md mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

const SLIDES: Slide[] = [
  {
    id: "intro",
    bg: "linear-gradient(135deg, #0A1628 0%, #1A3A6B 60%, #C9A84C 140%)",
    accent: "#C9A84C",
    render: (s) => (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: ease.spring }}
          className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8"
        >
          <span className="font-display text-6xl text-white leading-none">Á</span>
        </motion.div>
        <Title kicker="Ágora Wrapped 2026" title="Sua jornada analítica" subtitle="Uma retrospectiva cinematográfica do seu pensamento crítico no último ciclo." />
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-6 text-white/60 text-sm"
        >
          {s.firstAnalysisDate ? `Desde ${new Date(s.firstAnalysisDate).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}` : "Bem-vindo"}
        </motion.p>
      </div>
    ),
  },
  {
    id: "analyses",
    bg: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 70%, #06B6D4 130%)",
    accent: "#06B6D4",
    render: (s) => (
      <div>
        <Title kicker="Volume" title="Você analisou" />
        <Stat value={s.totalAnalyses} label="análises completas" sub={`em ${s.countriesAnalyzed.length} país${s.countriesAnalyzed.length !== 1 ? "es" : ""}`} />
      </div>
    ),
  },
  {
    id: "country",
    bg: "linear-gradient(135deg, #064E3B 0%, #047857 60%, #FCD34D 140%)",
    accent: "#FCD34D",
    render: (s) => (
      <div>
        <Title kicker="Foco geográfico" title="Seu país de obsessão" />
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: ease.spring, delay: 0.3 }}
          className="text-center"
        >
          <Globe2 className="w-20 h-20 text-white/80 mx-auto mb-4" />
          <div className="font-display text-7xl text-white uppercase tracking-wider">
            {s.topCountry?.id ?? "—"}
          </div>
          <div className="mt-3 text-white/70">{s.topCountry?.count ?? 0} análises dedicadas</div>
        </motion.div>
      </div>
    ),
  },
  {
    id: "score",
    bg: "linear-gradient(135deg, #7C2D12 0%, #DC2626 60%, #FCD34D 140%)",
    accent: "#FCD34D",
    render: (s) => (
      <div>
        <Title kicker="Nota média global" title="Sua leitura crítica" />
        <Stat
          value={s.averageScore !== null ? s.averageScore.toFixed(1) : "—"}
          label="score médio das análises"
          sub={s.averageScore !== null ? bandLabel(s.averageScore) : undefined}
        />
        {s.highestScore && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 max-w-md mx-auto p-4 rounded-xl bg-white/10 backdrop-blur border border-white/20"
          >
            <div className="text-xs uppercase tracking-widest text-white/60 mb-1">Maior pontuação</div>
            <div className="text-white font-medium">{s.highestScore.title}</div>
            <div className="text-white/70 text-sm">{s.highestScore.value.toFixed(1)} • {s.highestScore.countryId.toUpperCase()}</div>
          </motion.div>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    bg: "linear-gradient(135deg, #0F172A 0%, #1E40AF 60%, #22D3EE 130%)",
    accent: "#22D3EE",
    render: (s) => (
      <div>
        <Title kicker="Ação cívica" title="Análise virou movimento" />
        <Stat value={s.totalCivicActions} label="ações cívicas registradas" />
        {s.actionsByAxis.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-2 max-w-lg mx-auto"
          >
            {s.actionsByAxis.slice(0, 6).map((a) => (
              <span key={a.axisId} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm text-white border border-white/20">
                {a.axisId} · {a.count}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    ),
  },
  {
    id: "streak",
    bg: "linear-gradient(135deg, #831843 0%, #BE185D 60%, #FB923C 140%)",
    accent: "#FB923C",
    render: (s) => (
      <div>
        <Title kicker="Consistência" title="Sua sequência" />
        <div className="text-center">
          <Flame className="w-16 h-16 text-white/90 mx-auto mb-2" />
          <Stat value={s.streakDays} label="dias de engajamento ativo" />
        </div>
      </div>
    ),
  },
  {
    id: "archetype",
    bg: "linear-gradient(135deg, #0A1628 0%, #312E81 50%, #C9A84C 130%)",
    accent: "#C9A84C",
    render: (s) => (
      <div>
        <Title kicker="Seu arquétipo analítico" title={s.archetype.title} subtitle={s.archetype.subtitle} />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: ease.spring, delay: 0.3 }}
          className="text-center"
        >
          <div className="text-9xl mb-6">{s.archetype.emoji}</div>
          <p className="max-w-md mx-auto text-white/85 text-base leading-relaxed">
            {s.archetype.description}
          </p>
        </motion.div>
      </div>
    ),
  },
  {
    id: "outro",
    bg: "linear-gradient(135deg, #0A1628 0%, #1A3A6B 60%, #C9A84C 140%)",
    accent: "#C9A84C",
    render: (s) => (
      <div className="text-center">
        <Title kicker="2026" title="Continue analisando" subtitle="Cada análise expande sua agência cívica e fortalece a democracia baseada em evidências." />
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/compare">
            <Button size="lg" className="bg-white text-brand-primary hover:bg-white/90">
              Nova análise <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/history">
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
              Ver histórico
            </Button>
          </Link>
        </motion.div>
        <div className="mt-12 text-white/50 text-xs tracking-widest uppercase">
          Ágora · {s.totalAnalyses} análises · {s.governmentsAnalyzed} governos · {s.axesExplored} eixos
        </div>
      </div>
    ),
  },
];

function bandLabel(v: number): string {
  if (v >= 9) return "Referência Global";
  if (v >= 7.5) return "Alto desempenho";
  if (v >= 6) return "Sólido";
  if (v >= 4.5) return "Medíocre";
  if (v >= 3) return "Fraco";
  if (v >= 1.5) return "Crítico";
  return "Colapso";
}

export default function PoliticalWrappedPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchWrappedStats()
      .then((s) => setStats(s))
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const slide = SLIDES[idx];

  // Auto-advance + progress bar
  useEffect(() => {
    if (paused || !stats) return;
    startRef.current = Date.now();
    setProgress(0);
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(1, elapsed / SLIDE_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        setIdx((i) => (i + 1 < SLIDES.length ? i + 1 : i));
      }
    }, 80);
    return () => clearInterval(interval);
  }, [idx, paused, stats]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => Math.min(SLIDES.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const text = stats ? `Acabei de revisar minha jornada analítica no Ágora — ${stats.totalAnalyses} análises, arquétipo ${stats.archetype.title}. ${url}` : url;
    if (navigator.share) {
      try { await navigator.share({ title: "Ágora Wrapped", text, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado para a área de transferência");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Award className="w-12 h-12 text-brand-accent mx-auto mb-4" />
          <h1 className="font-display text-3xl text-white mb-2">Ágora Wrapped</h1>
          <p className="text-neutral-400 mb-6">Faça login para ver sua retrospectiva analítica do ano.</p>
          <Link to="/auth/login"><Button>Entrar</Button></Link>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">{error ?? "Sem dados ainda."}</p>
          <Link to="/compare"><Button>Começar primeira análise</Button></Link>
        </div>
      </div>
    );
  }

  if (stats.totalAnalyses === 0 && stats.totalCivicActions === 0) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Compass className="w-12 h-12 text-brand-accent mx-auto mb-4" />
          <h1 className="font-display text-3xl text-white mb-2">Ainda sem retrospectiva</h1>
          <p className="text-neutral-400 mb-6">Faça sua primeira análise para desbloquear o Ágora Wrapped.</p>
          <Link to="/compare"><Button>Começar análise</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden text-white select-none"
      style={{ background: slide.bg, transition: "background 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {/* Top bar: progress segments + controls */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6">
        <div className="flex gap-1 mb-4">
          {SLIDES.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white"
                style={{
                  width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%",
                  transition: i === idx ? "none" : "width 250ms ease",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Sair
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaused((p) => !p)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={paused ? "Continuar" : "Pausar"}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tap zones for nav */}
      <button
        onClick={() => setIdx((i) => Math.max(0, i - 1))}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-20"
        aria-label="Slide anterior"
      />
      <button
        onClick={() => setIdx((i) => Math.min(SLIDES.length - 1, i + 1))}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-20"
        aria-label="Próximo slide"
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: slide.accent }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl"
          style={{ background: slide.accent }}
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Slide content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: ease.cinematic }}
            className="w-full max-w-3xl"
          >
            {slide.render(stats)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase z-30 pointer-events-none">
        ← → para navegar · espaço para pausar
      </div>
    </div>
  );
}
