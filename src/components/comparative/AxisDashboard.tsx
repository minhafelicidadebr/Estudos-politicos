/**
 * AxisDashboard — Premium dashboard for each completed axis analysis (FABLE 5.0 Evidence-First)
 */
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ChevronDown, ChevronRight, Download, Copy, TrendingUp, TrendingDown, Minus,
  Check, AlertTriangle, ArrowLeft, ArrowRight, LayoutGrid, ShieldCheck, HelpCircle,
  FileSearch, ShieldAlert,
} from "lucide-react";
import type {
  AxisComparativeResult, UserDepthTier, GovernmentAxisScore, GovernmentRecord,
  PrimaryDataPoint, CCEEntry,
} from "@/types/aegis";
import type { EvidenceClaim } from "@/types/evidence";
import { getComparativeScoreBand } from "@/types/aegis";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AIPromptTransparency } from "./AIPromptTransparency";
import { EvidencePassportModal } from "./EvidencePassportModal";

const BAND_COLORS: Record<string, { bg: string; text: string }> = {
  'Referência Global': { bg: '#173404', text: '#C0DD97' },
  'Alto Desempenho': { bg: '#1a2e0a', text: '#97C459' },
  'Sólido': { bg: '#1f3306', text: '#C0DD97' },
  'Medíocre': { bg: '#412402', text: '#FAC775' },
  'Fraco': { bg: '#412402', text: '#EF9F27' },
  'Crítico': { bg: '#501313', text: '#F7C1C1' },
  'Colapso': { bg: '#2d0a0a', text: '#F09595' },
  'Inelegível / Sem Dados': { bg: '#27272a', text: '#a1a1aa' },
};

const GOV_COLORS = ['#378ADD', '#1D9E75', '#BA7517', '#D85A30', '#7F77DD'];
const DIRECTION_COLORS: Record<string, string> = {
  positivo: 'hsl(var(--confidence-high))',
  negativo: 'hsl(var(--semantic-error))',
  neutro: 'hsl(var(--neutral-400))',
  ambiguo: 'hsl(var(--semantic-warning))',
};

const EXECUTION_MODE_BADGES: Record<string, { label: string; tone: string }> = {
  VERIFIED_LIVE: {
    label: 'VERIFIED_LIVE · Evidência Primária Verificada',
    tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  RESEARCH_PARTIAL: {
    label: 'RESEARCH_PARTIAL · Pesquisa Assistida + Governança Determinística',
    tone: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  DEMO_FIXTURE: {
    label: 'DEMO_FIXTURE · Cenário Demonstrativo Auditado',
    tone: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
};

function ScoreCard({
  gs,
  index,
  rank,
  totalEligible,
  hasTieAtTop,
}: {
  gs: GovernmentAxisScore;
  index: number;
  rank: number | null;
  totalEligible: number;
  hasTieAtTop: boolean;
}) {
  const isEligible = gs.eligibleForRanking !== false && gs.score !== null && !gs.isQuarantined;
  const band = isEligible ? (gs.band || getComparativeScoreBand(gs.score, true)) : 'Inelegível / Sem Dados';
  const colors = BAND_COLORS[band] || BAND_COLORS['Medíocre'];
  const isLeader = isEligible && rank === 1 && totalEligible > 1 && !hasTieAtTop;
  const isTiedTop = isEligible && rank === 1 && totalEligible > 1 && hasTieAtTop;

  const rankMeta = !isEligible
    ? { label: gs.isQuarantined ? 'Quarentena' : 'Sem Dados', tone: 'text-red-300 bg-red-500/15 border-red-400/30' }
    : isTiedTop
    ? { label: 'Empate Técnico', tone: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30' }
    : rank === 1
    ? { label: 'Líder Elegível', tone: 'text-amber-300 bg-amber-500/15 border-amber-400/30' }
    : rank === 2
    ? { label: '2º', tone: 'text-slate-200 bg-slate-300/10 border-slate-300/25' }
    : rank === 3
    ? { label: '3º', tone: 'text-orange-300 bg-orange-500/10 border-orange-400/25' }
    : { label: `${rank}º`, tone: 'text-neutral-400 bg-white/[0.03] border-neutral-700/40' };

  const methScore = (gs.separatedEvaluation?.methodologicalQualityScore ?? gs.sibAverage ?? 0) * 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 rounded-xl border transition-all ${
        isLeader ? 'border-amber-400/40' : !isEligible ? 'border-red-500/30' : 'border-neutral-700/30'
      }`}
      style={{
        backgroundColor: colors.bg + '33',
        ...(isLeader ? { boxShadow: '0 0 0 1px rgba(251,191,36,0.25), 0 0 24px rgba(251,191,36,0.12)' } : {}),
      }}
    >
      {isLeader && (
        <Check
          className="absolute -top-1.5 -right-1.5 w-4 h-4 text-amber-300 bg-brand-primary rounded-full p-0.5 border border-amber-400/40"
          aria-label="Líder do eixo"
        />
      )}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GOV_COLORS[index % GOV_COLORS.length] }} />
          <span className="text-body-sm font-medium text-neutral-50 truncate">{gs.governmentName}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${rankMeta.tone}`}>
          {rankMeta.label}
        </span>
      </div>
      <p className="font-mono text-micro text-neutral-500 mb-2">{gs.period}</p>

      {/* Score principal ou S/D (nunca 0 para dado ausente) */}
      <div className="flex items-baseline gap-2 mb-2">
        {gs.score !== null && isEligible ? (
          <>
            <span className="font-display text-[2.5rem] leading-none" style={{ color: colors.text }}>
              {gs.score.toFixed(1)}
            </span>
            <span className="text-micro text-neutral-500">/10</span>
          </>
        ) : (
          <div className="py-1">
            <span className="font-mono text-lg font-bold text-neutral-300">
              {gs.score !== null ? `${gs.score.toFixed(1)} (Bloqueado)` : 'S/D (Sem Imputação)'}
            </span>
          </div>
        )}
      </div>

      <motion.div
        className="h-1.5 rounded-full bg-neutral-800 overflow-hidden mb-3"
        role="progressbar"
        aria-valuenow={gs.score ?? 0}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`Score ${gs.score ?? 'S/D'}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${gs.score !== null && isEligible ? gs.score * 10 : 0}%` }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="h-full rounded-full"
          style={{ backgroundColor: colors.text }}
        />
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap mb-2.5">
        <span className="px-2 py-0.5 rounded-full text-micro font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {band}
        </span>
        <span className="font-mono text-micro text-neutral-400">SIB {(gs.sibAverage * 100).toFixed(0)}%</span>
      </div>

      {/* 4 Dimensões Separadas FABLE 5.0 */}
      <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-1.5 text-[10px] font-mono text-neutral-400">
        <div>
          <span className="text-neutral-500 block">Qualidade Metod.:</span>
          <span className="text-neutral-200 font-semibold">{methScore.toFixed(1)}/10</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Elegibilidade:</span>
          <span className={isEligible ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
            {isEligible ? 'ELEGÍVEL' : 'RESTRITO'}
          </span>
        </div>
      </div>

      {gs.quarantineReasons && gs.quarantineReasons.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {gs.quarantineReasons.map(r => (
            <span key={r} className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 font-mono text-[9px]">
              {r}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface Props {
  result: AxisComparativeResult;
  userTier: UserDepthTier;
  countryName: string;
  onDownloadPDF?: () => void;
  governments?: GovernmentRecord[];
  onBackToSynthesis?: () => void;
  onPrevAxis?: () => void;
  onNextAxis?: () => void;
  prevAxisName?: string;
  nextAxisName?: string;
  axisIndex?: number;
  axisTotal?: number;
}

export function AxisDashboard({
  result, userTier, countryName, onDownloadPDF, governments,
  onBackToSynthesis, onPrevAxis, onNextAxis, prevAxisName, nextAxisName, axisIndex, axisTotal,
}: Props) {
  const [expandedGov, setExpandedGov] = useState<string | null>(null);
  const [pedTier, setPedTier] = useState<UserDepthTier>(userTier);
  const [cceOpen, setCceOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);

  // Passaporte de Evidências Modal state
  const [passportOpen, setPassportOpen] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<{
    claim?: EvidenceClaim | null;
    dataPoint?: PrimaryDataPoint | null;
    cceEntry?: CCEEntry | null;
    governmentName?: string;
    governmentPeriod?: string;
  }>({});

  const openPassportForDataPoint = (gs: GovernmentAxisScore, d: PrimaryDataPoint) => {
    const matchedClaim = result.evidenceClaims?.find(
      c => c.claimId === d.claimId || (c.governmentId === gs.governmentId && c.metricName === d.metricName)
    ) || null;
    const matchedCce = result.cceTable?.find(
      row => row.dataName.toLowerCase() === d.metricName.toLowerCase() || row.institution.toLowerCase() === d.source.toLowerCase()
    ) || null;

    setSelectedPassport({
      claim: matchedClaim,
      dataPoint: d,
      cceEntry: matchedCce,
      governmentName: gs.governmentName,
      governmentPeriod: gs.period,
    });
    setPassportOpen(true);
  };

  const openPassportForCce = (row: CCEEntry) => {
    const matchedClaim = result.evidenceClaims?.find(
      c => c.metricName.toLowerCase() === row.dataName.toLowerCase()
    ) || null;
    setSelectedPassport({
      claim: matchedClaim,
      dataPoint: null,
      cceEntry: row,
      governmentName: 'Cadeia de Custódia Consolidada',
      governmentPeriod: String(row.year),
    });
    setPassportOpen(true);
  };

  const pedContent = pedTier === 'cidadao' ? result.pedagogicalOutput.citizen
    : pedTier === 'gestor' ? result.pedagogicalOutput.manager
    : result.pedagogicalOutput.specialist;

  // Radar data (null-safe)
  const metrics = result.governmentScores[0]?.primaryData?.map(d => d.metricName) || [];
  const radarSize = 280;
  const center = radarSize / 2;
  const radius = radarSize * 0.35;
  const n = metrics.length || 1;

  const { eligibleScores, rankMap, hasTieAtTop } = useMemo(() => {
    const eligible = result.governmentScores.filter(
      gs => gs.eligibleForRanking !== false && gs.score !== null && !gs.isQuarantined
    );
    const sorted = [...eligible].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const map = new Map<string, number>();
    sorted.forEach((s, idx) => map.set(s.governmentId, idx + 1));
    const tie = sorted.length >= 2 && Math.abs((sorted[0].score ?? 0) - (sorted[1].score ?? 0)) < 0.15;
    return { eligibleScores: sorted, rankMap: map, hasTieAtTop: tie };
  }, [result.governmentScores]);

  const radarInsights = useMemo(() => {
    const topGovernment = eligibleScores[0] || null;
    const strongestMetric = result.governmentScores
      .flatMap((gs) => (gs.primaryData || []).map((item) => ({ governmentName: gs.governmentName, ...item })))
      .filter((item) => item.value !== null && Number.isFinite(item.value))
      .sort((a, b) => Math.abs(b.value ?? 0) - Math.abs(a.value ?? 0))[0];

    return { topGovernment, strongestMetric };
  }, [result.governmentScores, eligibleScores]);

  const showNav = Boolean(onBackToSynthesis || onPrevAxis || onNextAxis);
  const execMode = result.executionMode || result.auditTrail?.executionMode || 'RESEARCH_PARTIAL';
  const execBadge = EXECUTION_MODE_BADGES[execMode] || EXECUTION_MODE_BADGES.RESEARCH_PARTIAL;

  return (
    <div className="space-y-6">
      {/* Sticky Axis Navigator */}
      {showNav && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-30 -mx-6 lg:-mx-10 px-6 lg:px-10 py-3 backdrop-blur-xl bg-brand-primary/85 border-b border-brand-accent/20"
          aria-label="Navegação entre eixos analisados"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {onBackToSynthesis && (
              <button
                onClick={onBackToSynthesis}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-brand-accent/15 border border-brand-accent/40 text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all text-body-sm font-medium"
                aria-label="Voltar ao veredito comparativo"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar ao Veredito</span>
                <span className="sm:hidden">Veredito</span>
              </button>
            )}
            {typeof axisIndex === 'number' && typeof axisTotal === 'number' && (
              <span className="text-micro text-neutral-400 font-mono">
                Eixo {axisIndex + 1} de {axisTotal}
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onPrevAxis}
                disabled={!onPrevAxis}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-700/50 text-neutral-300 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-micro disabled:opacity-30 disabled:cursor-not-allowed max-w-[220px]"
                title={prevAxisName ? `Anterior: ${prevAxisName}` : 'Sem eixo anterior'}
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{prevAxisName || 'Anterior'}</span>
              </button>
              <button
                onClick={onNextAxis}
                disabled={!onNextAxis}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-neutral-700/50 text-neutral-300 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-micro disabled:opacity-30 disabled:cursor-not-allowed max-w-[220px]"
                title={nextAxisName ? `Próximo: ${nextAxisName}` : 'Sem próximo eixo'}
              >
                <span className="truncate">{nextAxisName || 'Próximo'}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Header + Execution Mode Badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-micro font-bold" style={{
              backgroundColor: result.layer === 'A' ? 'hsl(var(--axis-a) / 0.15)' : result.layer === 'B' ? 'hsl(var(--axis-b) / 0.15)' : 'hsl(var(--axis-c) / 0.15)',
              color: result.layer === 'A' ? 'hsl(var(--axis-a))' : result.layer === 'B' ? 'hsl(var(--axis-b))' : 'hsl(var(--axis-c))'
            }}>
              {result.axisId}
            </span>
            <h2 className="font-display text-heading-lg text-neutral-50">{result.axisName}</h2>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${execBadge.tone}`}>
            {execBadge.label}
          </span>
        </div>
        <p className="text-micro text-neutral-500">
          {countryName} · {result.governmentScores.length} governos · Governança de Evidências FABLE 5.0
        </p>

        {/* Quarantine Banner if triggered */}
        {result.evidenceQuarantine && result.evidenceQuarantine.length > 0 && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-amber-200">
                Governança Epistêmica Ativa — {result.evidenceQuarantine[0].explanation}
              </p>
              <p className="text-amber-300/80 font-mono text-[11px]">
                Códigos de razão: {Array.from(new Set(result.evidenceQuarantine.flatMap(q => q.reasonCodes))).join(', ')}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* BLOCO 1 — Hero Score Cards (com elegibilidade auditada) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {result.governmentScores.map((gs, i) => (
          <ScoreCard
            key={gs.governmentId}
            gs={gs}
            index={i}
            rank={rankMap.get(gs.governmentId) ?? null}
            totalEligible={eligibleScores.length}
            hasTieAtTop={hasTieAtTop}
          />
        ))}
      </div>

      {/* BLOCO 2 — Radar */}
      {metrics.length > 2 && (
        <div className="relative overflow-hidden p-5 rounded-[1.5rem] border border-brand-accent/20 bg-white/[0.02]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent" />
          <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-axis-a/10 blur-3xl" />
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-micro uppercase tracking-[0.22em] text-brand-accent mb-2">Visual premium de dados</p>
              <h3 className="text-body-sm font-semibold text-neutral-50">Radar Comparativo — Métricas Primárias</h3>
              <p className="text-micro text-neutral-400 mt-2 max-w-2xl">
                Cada vértice representa uma métrica primária do eixo. Métricas sem dado verificável permanecem não imputadas.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-brand-accent/30 bg-background/40 text-brand-accent hover:bg-brand-accent hover:text-primary-foreground">
                  Saber como ler este gráfico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl border-brand-accent/20 bg-card/95 text-card-foreground backdrop-blur-xl">
                <DialogHeader className="space-y-3">
                  <p className="text-micro uppercase tracking-[0.22em] text-brand-accent">Leitura guiada premium</p>
                  <DialogTitle className="font-display text-3xl text-neutral-50">Como interpretar o Radar Comparativo</DialogTitle>
                  <DialogDescription className="text-neutral-300">
                    Este pop-out instrucional transforma o radar em leitura orientada: forma, amplitude, equilíbrio e densidade narrativa das métricas.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-700/30 bg-white/[0.03] p-4">
                    <p className="text-micro uppercase tracking-[0.16em] text-axis-a mb-2">1. Forma</p>
                    <p className="text-body-sm text-neutral-300 leading-relaxed">Polígonos mais equilibrados sugerem desempenho distribuído entre métricas; polígonos com pontas agudas revelam concentração de força em poucos indicadores.</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-700/30 bg-white/[0.03] p-4">
                    <p className="text-micro uppercase tracking-[0.16em] text-axis-b mb-2">2. Amplitude</p>
                    <p className="text-body-sm text-neutral-300 leading-relaxed">Quanto mais distante do centro, maior a expressão relativa daquela métrica no conjunto analisado. Isso não substitui a leitura do valor bruto — ela complementa.</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-700/30 bg-white/[0.03] p-4">
                    <p className="text-micro uppercase tracking-[0.16em] text-axis-c mb-2">3. Comparação justa</p>
                    <p className="text-body-sm text-neutral-300 leading-relaxed">O radar facilita contraste visual, mas a decisão analítica continua ancorada na tese, antítese, trilha de evidências e nível de confiança SIB.</p>
                  </div>
                  <div className="rounded-2xl border border-brand-accent/25 bg-brand-accent/5 p-4">
                    <p className="text-micro uppercase tracking-[0.16em] text-brand-accent mb-2">4. Leitura estratégica</p>
                    <p className="text-body-sm text-neutral-200 leading-relaxed">Use o radar para identificar padrões, não para encerrar o julgamento. O veredito metodológico nasce do conjunto: forma visual + dados primários + CCE + protocolo anti-alucinação.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="flex justify-center gap-4 mb-3 flex-wrap">
                {result.governmentScores.map((gs, i) => (
                  <span key={gs.governmentId} className="flex items-center gap-1.5 text-micro text-neutral-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOV_COLORS[i % GOV_COLORS.length] }} />
                    {gs.governmentName}
                  </span>
                ))}
              </div>
              <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full max-w-xs mx-auto drop-shadow-[0_0_24px_hsl(var(--brand-accent)/0.12)]" aria-label={`Radar comparativo de métricas para ${result.axisName}`}>
                {[2, 4, 6, 8, 10].map(level => {
                  const pts = Array.from({ length: n }, (_, i) => {
                    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                    const r = (level / 10) * radius;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  }).join(' ');
                  return <polygon key={level} points={pts} fill="none" stroke="hsl(var(--neutral-700))" strokeWidth="0.5" opacity={0.4} />;
                })}
                {Array.from({ length: n }, (_, i) => {
                  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={center}
                      y1={center}
                      x2={center + radius * Math.cos(angle)}
                      y2={center + radius * Math.sin(angle)}
                      stroke="hsl(var(--neutral-700))"
                      strokeWidth="0.5"
                      opacity={0.5}
                    />
                  );
                })}
                {result.governmentScores.map((gs, ci) => {
                  if (!gs.primaryData?.length) return null;
                  const numericVals = gs.primaryData.map(d => (d.value !== null && Number.isFinite(d.value) ? Math.abs(d.value) : 0));
                  const maxVal = Math.max(...numericVals, 1);
                  const pts = gs.primaryData.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                    const valAbs = d.value !== null && Number.isFinite(d.value) ? Math.abs(d.value) : 0;
                    const normalized = Math.min(valAbs / maxVal, 1);
                    const r = normalized * radius;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  }).join(' ');
                  return <polygon key={ci} points={pts} fill={GOV_COLORS[ci % GOV_COLORS.length]} fillOpacity={0.12} stroke={GOV_COLORS[ci % GOV_COLORS.length]} strokeWidth="1.6" />;
                })}
                {metrics.map((metric, i) => {
                  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                  const labelRadius = radius + 22;
                  const x = center + labelRadius * Math.cos(angle);
                  const y = center + labelRadius * Math.sin(angle);
                  return (
                    <text
                      key={metric}
                      x={x}
                      y={y}
                      textAnchor={x < center - 8 ? "end" : x > center + 8 ? "start" : "middle"}
                      dominantBaseline="middle"
                      fill="hsl(var(--neutral-400))"
                      fontSize="8"
                    >
                      {metric.slice(0, 18)}
                    </text>
                  );
                })}
              </svg>
            </div>
            <div className="grid gap-3 content-start">
              <div className="rounded-2xl border border-brand-accent/20 bg-brand-accent/5 p-4">
                <p className="text-micro uppercase tracking-[0.16em] text-brand-accent mb-2">Leitura rápida</p>
                <p className="text-body-sm text-neutral-200 leading-relaxed">
                  {radarInsights.topGovernment && radarInsights.topGovernment.score !== null ? (
                    hasTieAtTop ? (
                      `Empate técnico na liderança deste eixo (${radarInsights.topGovernment.score.toFixed(1)}/10). A leitura deve priorizar os indicadores individuais.`
                    ) : (
                      `${radarInsights.topGovernment.governmentName} apresenta o maior score elegível neste eixo (${radarInsights.topGovernment.score.toFixed(1)}/10).`
                    )
                  ) : (
                    'Ranking de liderança bloqueado neste eixo por insuficiência de cobertura ou quarentena epistêmica.'
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-700/30 bg-white/[0.03] p-4">
                <p className="text-micro uppercase tracking-[0.16em] text-axis-a mb-2">Métrica em destaque</p>
                <p className="text-body-sm text-neutral-300 leading-relaxed">
                  {radarInsights.strongestMetric ? (
                    `${radarInsights.strongestMetric.metricName} aparece com destaque em ${radarInsights.strongestMetric.governmentName}. Clique em "Passaporte" nos dados abaixo para inspecionar custódia e série.`
                  ) : (
                    'Inspecione o Passaporte de Evidências de cada métrica abaixo para verificar série, janela e transformações.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 3 — PIR+ Accordion + Passaporte de Evidências por Indicador + Decomposição Macro SK-08 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-body-sm font-semibold text-neutral-50">Análise PIR+ e Passaporte de Evidências por Governo</h3>
          <span className="text-micro text-brand-accent font-mono">Clique em qualquer indicador para abrir o Passaporte</span>
        </div>
        {result.governmentScores.map((gs, i) => (
          <div key={gs.governmentId} className="rounded-xl border border-neutral-700/30 overflow-hidden">
            <button
              onClick={() => setExpandedGov(expandedGov === gs.governmentId ? null : gs.governmentId)}
              aria-expanded={expandedGov === gs.governmentId}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: GOV_COLORS[i % GOV_COLORS.length] }} />
              <span className="text-body-sm font-medium text-neutral-50 flex-1">{gs.governmentName}</span>
              <span className="font-display text-heading-md text-brand-accent">
                {gs.score !== null && gs.eligibleForRanking !== false ? gs.score.toFixed(1) : 'S/D'}
              </span>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${expandedGov === gs.governmentId ? 'rotate-180' : ''}`} />
            </button>
            {expandedGov === gs.governmentId && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-4 pb-4 space-y-3">
                <div className="p-3 rounded-lg border-l-2 border-confidence-high/50 bg-confidence-high/5">
                  <p className="text-micro font-bold text-confidence-high mb-1">TESE (Evidência Favorável)</p>
                  <p className="text-body-sm text-neutral-300 leading-relaxed">{gs.thesisSummary}</p>
                </div>
                <div className="p-3 rounded-lg border-l-2 border-semantic-warning/50 bg-semantic-warning/5">
                  <p className="text-micro font-bold text-semantic-warning mb-1">ANTÍTESE (Evidência Contrária — Paridade APP+)</p>
                  <p className="text-body-sm text-neutral-300 leading-relaxed">{gs.antithesisSummary}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-neutral-700/20">
                  <p className="text-micro font-bold text-neutral-400 mb-1">NOTA METODOLÓGICA E CRITÉRIO ToT</p>
                  <p className="text-body-sm text-neutral-400 leading-relaxed">{gs.methodologicalNote}</p>
                </div>

                {/* Decomposição Macro-Histórica SK-08 */}
                {gs.macroDecomposition && (
                  <div className="p-3 rounded-lg bg-brand-accent/5 border border-brand-accent/20 space-y-1.5">
                    <p className="text-micro font-bold text-brand-accent">DECOMPOSIÇÃO MACRO-HISTÓRICA (SK-08)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-micro text-neutral-300 font-mono">
                      <div>Componente Global/Externo: <strong>{gs.macroDecomposition.globalComponentWeightPct}%</strong></div>
                      <div>Tendência Pré-Mandato: <strong>{gs.macroDecomposition.structuralTrendWeightPct}%</strong></div>
                      <div>Resíduo Doméstico Não Atribuído: <strong>{gs.macroDecomposition.idiossyncraticResidualPct}%</strong></div>
                    </div>
                    <p className="text-[11px] text-neutral-400 italic">{gs.macroDecomposition.nonCausalDisclaimer}</p>
                  </div>
                )}

                {/* Primary Data Rows with Passaporte Button */}
                <div className="space-y-1.5">
                  {gs.primaryData?.map((d, di) => (
                    <div
                      key={di}
                      className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.01] border border-neutral-800 hover:border-brand-accent/40 transition-colors"
                    >
                      {d.trend === 'crescente' ? <TrendingUp className="w-3.5 h-3.5 text-confidence-high" /> :
                       d.trend === 'decrescente' ? <TrendingDown className="w-3.5 h-3.5 text-semantic-error" /> :
                       <Minus className="w-3.5 h-3.5 text-neutral-500" />}
                      <span className="text-micro text-neutral-200 font-medium flex-1 min-w-[160px]">{d.metricName}</span>
                      <span className="font-mono text-micro text-neutral-50">
                        {d.value !== null ? `${d.value} ${d.unit}` : 'Dado não disponível (S/D)'}
                      </span>
                      <span className="text-micro text-neutral-400">{d.source} ({d.year})</span>
                      <button
                        type="button"
                        onClick={() => openPassportForDataPoint(gs, d)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-colors text-[10px] font-mono font-semibold"
                      >
                        <FileSearch className="w-3 h-3" />
                        Passaporte
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* BLOCO 3.5 — Seção Pública Obrigatória: "O que poderia mudar esta conclusão?" (Contestabilidade & SK-06) */}
      <div className="p-5 rounded-2xl border border-brand-accent/25 bg-brand-accent/[0.04] space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-accent" />
          <h3 className="text-body-sm font-semibold text-neutral-50">
            O que poderia mudar esta conclusão? (Critérios de Falseabilidade & Auditoria Adversária SK-06)
          </h3>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-body-sm text-neutral-300">
          {(result.evidenceAudit?.whatCouldChangeConclusion && result.evidenceAudit.whatCouldChangeConclusion.length > 0
            ? result.evidenceAudit.whatCouldChangeConclusion
            : [
                'Revisões definitivas de séries históricas oficiais (IBGE, Banco Central, OCDE ou Banco Mundial) que alterem o sinal da variação no período do mandato.',
                'Inclusão de controles econométricos para choques exógenos de commodities ou pandemias que explique integralmente o resíduo doméstico.',
                'Harmonização de quebras metodológicas entre edições de surveys ou censos.',
              ]
          ).map((item, idx) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>

        {result.evidenceAudit && result.evidenceAudit.findings.length > 0 && (
          <div className="pt-3 border-t border-brand-accent/20 space-y-2">
            <p className="text-micro font-mono uppercase tracking-wider text-brand-accent">
              Achados da Auditoria Adversária ({result.evidenceAudit.findings.length})
            </p>
            <div className="grid gap-2">
              {result.evidenceAudit.findings.map((finding, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-black/20 border border-neutral-800 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-neutral-200">{finding.finding}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px]">
                      {finding.severity} · {finding.threatCategory}
                    </span>
                  </div>
                  <p className="text-neutral-400"><strong>Evidência:</strong> {finding.evidence}</p>
                  <p className="text-neutral-400"><strong>Ação corretiva:</strong> {finding.correctiveAction}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BLOCO 4 — Pedagogical Layer */}
      <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-neutral-700/30 mb-4 w-fit">
          {(['cidadao', 'gestor', 'especialista'] as UserDepthTier[]).map(t => (
            <button key={t} onClick={() => setPedTier(t)} className={`px-3 py-1.5 rounded-lg text-micro font-medium transition-all ${
              pedTier === t ? 'bg-brand-accent text-brand-primary' : 'text-neutral-400 hover:text-neutral-200'
            }`}>
              {t === 'cidadao' ? 'Cidadão' : t === 'gestor' ? 'Gestor' : 'Especialista'}
            </button>
          ))}
        </div>
        <p className="text-body-sm text-neutral-300 leading-relaxed">{pedContent}</p>
        <blockquote className="mt-4 pl-4 border-l-2 border-brand-accent/40 italic text-body-sm text-brand-accent/80">
          {result.pedagogicalOutput.socraticQuestion}
        </blockquote>
      </div>

      {/* BLOCO 5 — International Comparison */}
      {result.internationalComparison?.length > 0 && (
        <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
          <h3 className="text-body-sm font-semibold text-neutral-50 mb-3">Comparação Internacional</h3>
          <div className="space-y-1">
            {result.internationalComparison.map((ic, i) => {
              const avg = result.internationalComparison.reduce((a, c) => a + c.value, 0) / result.internationalComparison.length;
              const above = ic.value >= avg;
              return (
                <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${
                  ic.countryName === countryName ? 'border border-brand-accent/30 bg-brand-accent/5' : ''
                }`}>
                  <span className="text-body-sm text-neutral-300">{ic.countryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-body-sm text-neutral-50">{ic.value.toFixed(1)}</span>
                    <span className={`text-micro ${above ? 'text-confidence-high' : 'text-semantic-error'}`}>
                      {above ? '↑' : '↓'}
                    </span>
                    <span className="font-mono text-micro text-neutral-600">{ic.year}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BLOCO 6 — Cross Effects */}
      {result.crossEffects?.length > 0 && (
        <div>
          <h3 className="text-body-sm font-semibold text-neutral-50 mb-3">Efeitos Cruzados</h3>
          <div className="space-y-2">
            {result.crossEffects.map((ce, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-neutral-700/20 bg-white/[0.01]">
                <span className="font-mono text-micro font-bold shrink-0" style={{ color: DIRECTION_COLORS[ce.direction] }}>
                  → {ce.destinationAxisId}
                </span>
                <p className="text-body-sm text-neutral-400 flex-1">{ce.mechanismDescription}</p>
                <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${
                  ce.intensity === 'alta' ? 'bg-confidence-high/10 text-confidence-high' :
                  ce.intensity === 'moderada' ? 'bg-confidence-medium/10 text-confidence-medium' :
                  'bg-neutral-700 text-neutral-400'
                }`}>{ce.intensity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOCO 7 — CCE Table */}
      <Collapsible open={cceOpen} onOpenChange={setCceOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer">
          <ChevronRight className={`w-4 h-4 transition-transform ${cceOpen ? 'rotate-90' : ''}`} />
          Cadeia de Custódia de Evidências ({result.cceTable?.length || 0})
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-micro">
              <thead>
                <tr className="border-b border-neutral-700/30">
                  <th className="text-left py-2 text-neutral-500 font-medium">Indicador</th>
                  <th className="text-left py-2 text-neutral-500 font-medium">Instituição</th>
                  <th className="text-left py-2 text-neutral-500 font-medium">Grupo de Origem</th>
                  <th className="text-center py-2 text-neutral-500 font-medium">Ano</th>
                  <th className="text-left py-2 text-neutral-500 font-medium">Tipo</th>
                  <th className="text-center py-2 text-neutral-500 font-medium">SIB</th>
                  <th className="text-right py-2 text-neutral-500 font-medium">Auditoria</th>
                </tr>
              </thead>
              <tbody>
                {result.cceTable?.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-800/30">
                    <td className="py-2 text-neutral-300">{row.dataName}</td>
                    <td className="py-2 text-neutral-400">{row.institution}</td>
                    <td className="py-2 font-mono text-[10px] text-neutral-400">{row.originGroup || '—'}</td>
                    <td className="py-2 text-center font-mono text-neutral-400">{row.year}</td>
                    <td className="py-2 text-neutral-500">{row.methodologyType}</td>
                    <td className="py-2 text-center">
                      <span className={`font-mono font-bold ${
                        row.sibBand === 'ALTA' ? 'text-confidence-high' :
                        row.sibBand === 'MODERADA' ? 'text-confidence-medium' :
                        'text-semantic-error'
                      }`}>{(row.sibConfidence * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => openPassportForCce(row)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-colors font-mono text-[10px]"
                      >
                        <ShieldCheck className="w-3 h-3" /> Inspecionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* BLOCO 8 — Audit Trail */}
      <Collapsible open={auditOpen} onOpenChange={setAuditOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer">
          <ChevronRight className={`w-4 h-4 transition-transform ${auditOpen ? 'rotate-90' : ''}`} />
          Trilha de Auditoria
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] font-mono text-micro text-neutral-400 space-y-1.5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-micro font-bold ${
                result.auditTrail.vcoStatus === 'approved' ? 'bg-confidence-high/10 text-confidence-high' : 'bg-confidence-medium/10 text-confidence-medium'
              }`}>
                VCO: {result.auditTrail.vcoStatus === 'approved' ? 'Aprovado' : 'Aprovado com ressalvas'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-micro font-bold bg-brand-accent/10 text-brand-accent">
                Modo: {execMode}
              </span>
            </div>
            <p><span className="text-neutral-600">Modelo Executado:</span> {result.auditTrail.modelVersion}</p>
            <p><span className="text-neutral-600">Framework:</span> {result.auditTrail.frameworkVersion}</p>
            <p><span className="text-neutral-600">Prompt Canônico:</span> {result.auditTrail.promptId}</p>
            <p><span className="text-neutral-600">Governos:</span> {result.auditTrail.governmentsCount}</p>
            <p><span className="text-neutral-600">Fontes Catalogadas:</span> {result.auditTrail.sourcesCount} (Grupos independentes: {result.auditTrail.independentOriginsCount ?? result.auditTrail.sourcesCount})</p>
            <p><span className="text-neutral-600">SIB médio auditado:</span> {(result.auditTrail.averageSibConfidence * 100).toFixed(0)}%</p>
            <p><span className="text-neutral-600">Timestamp:</span> {result.auditTrail.timestamp}</p>
            {result.auditTrail.aamFlagsTriggered?.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertTriangle className="w-3.5 h-3.5 text-semantic-warning" />
                <span className="text-semantic-warning">{result.auditTrail.aamFlagsTriggered.join(', ')}</span>
              </div>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result.auditTrail, null, 2))}
              className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-500 hover:text-neutral-200 transition-colors"
            >
              <Copy className="w-3 h-3" /> Copiar Trilha JSON
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* BLOCO 8.5 — Transparência da IA (ToT + super-prompt + skill + sugestão) */}
      <AIPromptTransparency result={result} countryName={countryName} governments={governments} />

      {/* BLOCO 9 — Download */}
      <button
        onClick={onDownloadPDF || (() => {})}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-brand-accent/30 text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all text-body-sm font-semibold"
      >
        <Download className="w-4 h-4" /> Baixar PDF deste Eixo
      </button>

      {/* Modal do Passaporte de Evidências Ágora */}
      <EvidencePassportModal
        open={passportOpen}
        onOpenChange={setPassportOpen}
        claim={selectedPassport.claim}
        dataPoint={selectedPassport.dataPoint}
        cceEntry={selectedPassport.cceEntry}
        governmentName={selectedPassport.governmentName}
        governmentPeriod={selectedPassport.governmentPeriod}
        axisName={result.axisName}
        whatCouldChange={result.evidenceAudit?.whatCouldChangeConclusion}
      />
    </div>
  );
}
