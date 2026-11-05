/**
 * FinalSynthesisDashboard — Premium UX v5 (FABLE 5.0 Evidence-First Governance)
 * - Uses computeSessionRankingGovernance so missing/quarantined scores are NEVER imputed as 0
 * - Blocks podium ranking when evidence coverage or eligibility is insufficient
 * - Shows 4 separated evaluation dimensions per government
 * - Heatmap matrix with null-safe S/D cells and leader highlight per eligible axis
 */
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Download, Share2, Plus, Eye, BarChart3, RefreshCw, Crown, Medal, Trophy,
  TrendingUp, TrendingDown, Sparkles, ChevronRight, ShieldAlert, Scale,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ComparativeSession } from "@/types/aegis";
import { getComparativeScoreBand } from "@/types/aegis";
import { computeSessionRankingGovernance } from "@/lib/evidence/engine";

const BAND_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  'Referência Global':     { bg: '#173404', text: '#C0DD97', ring: 'rgba(192,221,151,0.45)' },
  'Alto Desempenho':       { bg: '#1a2e0a', text: '#97C459', ring: 'rgba(151,196,89,0.40)' },
  'Sólido':                { bg: '#1f3306', text: '#C0DD97', ring: 'rgba(192,221,151,0.35)' },
  'Medíocre':              { bg: '#412402', text: '#FAC775', ring: 'rgba(250,199,117,0.35)' },
  'Fraco':                 { bg: '#412402', text: '#EF9F27', ring: 'rgba(239,159,39,0.35)' },
  'Crítico':               { bg: '#501313', text: '#F7C1C1', ring: 'rgba(247,193,193,0.35)' },
  'Colapso':               { bg: '#2d0a0a', text: '#F09595', ring: 'rgba(240,149,149,0.35)' },
  'Inelegível / Sem Dados': { bg: '#27272a', text: '#a1a1aa', ring: 'rgba(161,161,170,0.25)' },
};

const PODIUM = [
  { icon: Crown,  label: '1º', tone: 'text-amber-300',  bg: 'from-amber-500/20 to-amber-500/0',  ring: 'border-amber-400/40' },
  { icon: Trophy, label: '2º', tone: 'text-slate-200',  bg: 'from-slate-300/15 to-slate-300/0',  ring: 'border-slate-300/30' },
  { icon: Medal,  label: '3º', tone: 'text-orange-300', bg: 'from-orange-500/15 to-orange-500/0', ring: 'border-orange-400/30' },
];

interface Props {
  session: ComparativeSession;
  synthesis: { executiveSummary: string; trajectoryAnalysis: string; lessons: string[] } | null;
  isGenerating: boolean;
  onViewAxis?: (axisId: string) => void;
}

export function FinalSynthesisDashboard({ session, synthesis, isGenerating, onViewAxis }: Props) {
  const [weightMode, setWeightMode] = useState<'simple' | 'weighted'>('simple');
  const [showDelta, setShowDelta] = useState(false);
  const govs = session.selectedGovernments;
  const axes = session.completedAxes;
  const lessons = (synthesis?.lessons ?? []).filter((l): l is string => typeof l === 'string' && l.trim().length > 0);

  // ===== FABLE 5.0 Deterministic Session Governance (Never imputes 0 for null) =====
  const governance = useMemo(() => computeSessionRankingGovernance(govs, axes), [govs, axes]);

  const ranking = useMemo(() => {
    return governance.aggregates
      .map((summary, idx) => {
        return {
          gov: summary.government,
          summary,
          avg: summary.averageScore,
          idx,
        };
      })
      .sort((a, b) => {
        if (a.summary.eligibleForGlobalRanking !== b.summary.eligibleForGlobalRanking) {
          return a.summary.eligibleForGlobalRanking ? -1 : 1;
        }
        return (b.avg ?? -1) - (a.avg ?? -1);
      });
  }, [governance]);

  const axisInsights = useMemo(() => axes.map(axis => {
    const validScores = axis.governmentScores
      .filter(s => s.score !== null && s.eligibleForRanking !== false && !s.isQuarantined)
      .map(s => s.score as number);
    if (validScores.length === 0) {
      return { axisId: axis.axisId, max: null, min: null, std: 0, gap: 0, leader: 'Inelegível / S/D' };
    }
    const max = Math.max(...validScores);
    const min = Math.min(...validScores);
    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    const variance = validScores.reduce((acc, s) => acc + (s - mean) ** 2, 0) / validScores.length;
    const std = Math.sqrt(variance);
    const leader = axis.governmentScores.find(s => s.score === max && s.eligibleForRanking !== false);
    return { axisId: axis.axisId, max, min, std, gap: max - min, leader: leader?.governmentName || '—' };
  }), [axes]);

  const convergence = useMemo(() => {
    return [...axisInsights].filter(a => a.max !== null).sort((a, b) => a.std - b.std).slice(0, 3);
  }, [axisInsights]);
  const divergence = useMemo(() => {
    return [...axisInsights].filter(a => a.max !== null).sort((a, b) => b.std - a.std).slice(0, 3);
  }, [axisInsights]);

  return (
    <div className="space-y-10">
      {/* ============ HERO — PODIUM & GOVERNANCE ============ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-brand-accent/25 bg-gradient-to-br from-brand-accent/[0.06] via-white/[0.02] to-transparent p-6 md:p-8"
      >
        <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-brand-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-axis-a/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-micro uppercase tracking-[0.24em] text-brand-accent mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Veredito comparativo · FABLE 5.0
            </p>
            <h2 className="font-display text-heading-xl md:text-display-md text-neutral-50 leading-tight">
              {!governance.rankingPublished
                ? 'Síntese Comparativa (Pódio Bloqueado por Governança)'
                : governance.hasTieAtTop
                ? 'Pódio de Desempenho (Empate Técnico no Topo)'
                : 'Pódio de Desempenho Elegível'}
            </h2>
            <p className="text-body-sm text-neutral-400 mt-1">
              Média calculada exclusivamente sobre eixos elegíveis ({axes.length} eixos analisados · {govs.length} governos · zero nunca imputado para dado ausente)
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-micro font-mono text-brand-accent flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            {governance.rankingPublished ? 'Ranking Auditado & Elegível' : 'Modo Parcial / Quarentena'}
          </div>
        </div>

        {/* Governance Notice when ranking is blocked or tied */}
        {(!governance.rankingPublished || governance.hasTieAtTop) && (
          <div className="relative mb-6 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-amber-200">
                {!governance.rankingPublished
                  ? 'Governança Anti-Distorção Ativada: Pódio Geral Retido'
                  : 'Empate Técnico Detectado na Liderança'}
              </p>
              <p className="text-amber-200/80 leading-relaxed">
                {governance.rankingBlockedReason ||
                  'A diferença entre os dois primeiros colocados é inferior a 0.05 ponto, configurando empate técnico dentro da margem de sensibilidade metodológica.'}
              </p>
            </div>
          </div>
        )}

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {ranking.slice(0, 3).map((r, i) => {
            const meta = PODIUM[i];
            const Icon = meta.icon;
            const isEligible = r.summary.eligibleForGlobalRanking && r.avg !== null;
            const band = getComparativeScoreBand(r.avg, isEligible);
            const colors = BAND_COLORS[band] || BAND_COLORS['Medíocre'];
            const order = i === 0 ? 'md:order-2' : i === 1 ? 'md:order-1' : 'md:order-3';
            const elevation = i === 0 ? 'md:-mt-2' : i === 1 ? 'md:mt-4' : 'md:mt-8';
            const rankBadgeLabel = !isEligible
              ? 'Inelegível'
              : governance.hasTieAtTop && i < 2
              ? 'Empate 1º'
              : meta.label;

            return (
              <motion.article
                key={r.gov.id}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 220, damping: 22 }}
                className={`${order} ${elevation} relative rounded-2xl border ${isEligible ? meta.ring : 'border-red-500/30'} bg-gradient-to-b ${meta.bg} backdrop-blur-md p-5`}
                aria-label={`${rankBadgeLabel}: ${r.gov.name}, média ${r.avg !== null ? r.avg.toFixed(2) : 'S/D'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 ${isEligible ? meta.tone : 'text-red-300'} text-micro font-bold`}>
                    <Icon className="w-3.5 h-3.5" /> {rankBadgeLabel}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {band}
                  </span>
                </div>
                <p className="text-body-md font-semibold text-neutral-50 leading-tight line-clamp-2">{r.gov.name}</p>
                <p className="font-mono text-micro text-neutral-500 mt-0.5">{r.gov.yearStart}–{r.gov.yearEnd ?? '…'}</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  {r.avg !== null && isEligible ? (
                    <>
                      <span className="font-display text-[3rem] leading-none" style={{ color: colors.text }}>
                        {r.avg.toFixed(2)}
                      </span>
                      <span className="text-micro text-neutral-500">/10</span>
                    </>
                  ) : (
                    <span className="font-mono text-xl font-bold text-neutral-300 py-2">
                      {r.avg !== null ? `${r.avg.toFixed(2)} (Parcial)` : 'S/D (Sem Dados)'}
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-black/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.avg !== null && isEligible ? r.avg * 10 : 0}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.text, boxShadow: `0 0 18px ${colors.ring}` }}
                  />
                </div>

                {/* 4 Dimensões Separadas */}
                <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-1 text-[10px] font-mono text-neutral-400">
                  <div>Status: <strong className="text-neutral-200">{r.summary.statusLabel}</strong></div>
                  <div>SIB Médio: <strong className="text-neutral-200">{(r.summary.averageSib * 100).toFixed(0)}%</strong></div>
                  <div className="col-span-2">
                    Eixos Elegíveis: <strong className="text-neutral-200">{r.summary.eligibleAxesCount}/{r.summary.totalAxesCount}</strong>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {ranking.length > 3 && (
          <div className="relative mt-5 pt-5 border-t border-neutral-700/30">
            <p className="text-micro uppercase tracking-[0.18em] text-neutral-500 mb-3">Demais governos</p>
            <div className="flex flex-wrap gap-2">
              {ranking.slice(3).map((r, i) => (
                <div key={r.gov.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700/40 bg-white/[0.02]">
                  <span className="font-mono text-micro text-neutral-500">{i + 4}º</span>
                  <span className="text-micro text-neutral-200">{r.gov.name}</span>
                  <span className="font-mono text-micro text-brand-accent">
                    {r.avg !== null ? r.avg.toFixed(2) : 'S/D'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* ============ HEATMAP MATRIX ============ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-heading-xl text-neutral-50">Matriz Heatmap Auditada</h2>
            <p className="text-body-sm text-neutral-400 mt-1">
              Líder elegível de cada eixo destacado · células sem evidência exibem <span className="font-mono text-neutral-200">S/D</span> (nunca 0.0)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-neutral-700/30">
              <button
                onClick={() => setWeightMode('simple')}
                className={`px-3 py-1.5 rounded text-micro font-medium transition-all ${weightMode === 'simple' ? 'bg-brand-accent text-brand-primary' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Simples
              </button>
              <button
                onClick={() => setWeightMode('weighted')}
                className={`px-3 py-1.5 rounded text-micro font-medium transition-all ${weightMode === 'weighted' ? 'bg-brand-accent text-brand-primary' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Ponderada
              </button>
            </div>
            <button
              onClick={() => setShowDelta(v => !v)}
              className={`px-3 py-1.5 rounded-lg text-micro font-medium border transition-all ${showDelta ? 'border-brand-accent/60 bg-brand-accent/10 text-brand-accent' : 'border-neutral-700/40 text-neutral-400 hover:text-neutral-200'}`}
              aria-pressed={showDelta}
            >
              Δ vs Líder
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-700/30 bg-white/[0.01]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700/30 bg-white/[0.02]">
                <th className="text-left p-3 text-micro text-neutral-500 font-medium min-w-[180px]">Eixo</th>
                {govs.map(g => (
                  <th key={g.id} className="p-3 text-micro text-neutral-300 font-medium text-center min-w-[110px]">
                    <span className="block truncate max-w-[140px]">{g.name}</span>
                    <span className="font-mono text-neutral-600 text-[10px]">{g.yearStart}–{g.yearEnd ?? '…'}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {axes.map((axis, ai) => {
                const eligibleScores = axis.governmentScores
                  .filter(s => s.score !== null && s.eligibleForRanking !== false && !s.isQuarantined)
                  .map(s => s.score as number);
                const maxScore = eligibleScores.length > 0 ? Math.max(...eligibleScores) : null;

                return (
                  <tr
                    key={axis.axisId}
                    onClick={onViewAxis ? () => onViewAxis(axis.axisId) : undefined}
                    className={`border-b border-neutral-800/30 transition-colors group ${onViewAxis ? 'cursor-pointer hover:bg-brand-accent/[0.05]' : 'hover:bg-white/[0.02]'}`}
                    title={onViewAxis ? `Abrir análise completa de ${axis.axisName}` : undefined}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-600 px-1.5 py-0.5 rounded bg-white/[0.03]">{axis.axisId}</span>
                        <span className="text-body-sm text-neutral-300 truncate max-w-[160px] group-hover:text-brand-accent transition-colors" title={axis.axisName}>{axis.axisName}</span>
                        {onViewAxis && <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all" />}
                      </div>
                    </td>
                    {govs.map(g => {
                      const gs = axis.governmentScores.find(s => s.governmentId === g.id);
                      const isCellEligible = Boolean(gs && gs.score !== null && gs.eligibleForRanking !== false && !gs.isQuarantined);
                      const score = isCellEligible ? (gs!.score as number) : null;
                      const band = getComparativeScoreBand(score, isCellEligible);
                      const colors = BAND_COLORS[band] || BAND_COLORS['Inelegível / Sem Dados'];
                      const isLeader = isCellEligible && maxScore !== null && score === maxScore && eligibleScores.filter(s => Math.abs(s - maxScore) < 0.15).length === 1;
                      const delta = score !== null && maxScore !== null ? score - maxScore : 0;
                      const display = score === null
                        ? (gs?.isQuarantined ? 'QUAR' : 'S/D')
                        : showDelta && !isLeader
                        ? `${delta.toFixed(1)}`
                        : score.toFixed(1);

                      return (
                        <td key={g.id} className="p-2.5 text-center">
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: ai * 0.015, type: 'spring', stiffness: 280 }}
                            className={`relative inline-flex items-center justify-center min-w-[52px] h-9 px-2 rounded-lg font-display text-body-md font-medium ${isLeader ? 'ring-2 ring-offset-1 ring-offset-transparent' : ''}`}
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              ...(isLeader ? { boxShadow: `0 0 0 2px ${colors.ring}, 0 0 22px ${colors.ring}` } : {}),
                            }}
                            title={score !== null ? `${band} · score ${score.toFixed(2)}${isLeader ? ' · líder elegível do eixo' : delta !== 0 ? ` · Δ ${delta.toFixed(2)} vs líder` : ''}` : 'Dado não disponível ou em quarentena (não imputado como 0)'}
                          >
                            {isLeader && <Crown className="absolute -top-2 -right-2 w-3.5 h-3.5 text-amber-300 drop-shadow" aria-hidden />}
                            {display}
                          </motion.div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-brand-accent/40 bg-brand-accent/[0.04]">
                <td className="p-3 text-body-sm font-bold text-neutral-50">Média Global Elegível</td>
                {govs.map((g, i) => {
                  const summary = governance.aggregates.find(item => item.government.id === g.id);
                  const avg = summary?.averageScore ?? null;
                  const isElig = summary?.eligibleForGlobalRanking ?? false;
                  const band = getComparativeScoreBand(avg, isElig);
                  const colors = BAND_COLORS[band] || BAND_COLORS['Inelegível / Sem Dados'];
                  const rank = ranking.findIndex(r => r.gov.id === g.id) + 1;
                  return (
                    <td key={g.id || i} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-display text-heading-md" style={{ color: colors.text }}>
                          {avg !== null ? avg.toFixed(2) : 'S/D'}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {isElig ? `#${rank}` : 'Inelegível'}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Heatmap legend */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-micro text-neutral-500 mr-1">Bandas:</span>
          {Object.entries(BAND_COLORS).map(([name, c]) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: c.bg, color: c.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.text }} />
              {name}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ============ EXPLORE POR EIXO — CTA de aprofundamento ============ */}
      {onViewAxis && axes.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="relative overflow-hidden rounded-2xl border border-brand-accent/25 bg-gradient-to-br from-brand-accent/[0.05] via-white/[0.02] to-transparent p-5 md:p-6"
        >
          <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-micro uppercase tracking-[0.22em] text-brand-accent mb-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Aprofunde a análise
              </p>
              <h3 className="font-display text-heading-lg text-neutral-50">Explore por eixo</h3>
              <p className="text-body-sm text-neutral-400 mt-1">
                Abra a análise PIR+ completa de cada eixo — com Passaporte de Evidências, Tese/Antítese/Síntese, radar e transparência ToT.
              </p>
            </div>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {axes.map((axis, i) => {
              const validScores = axis.governmentScores
                .filter(s => s.score !== null && s.eligibleForRanking !== false && !s.isQuarantined)
                .map(s => s.score as number);
              const max = validScores.length > 0 ? Math.max(...validScores) : null;
              const leader = max !== null ? axis.governmentScores.find(s => s.score === max && s.eligibleForRanking !== false) : null;
              const band = getComparativeScoreBand(max, max !== null);
              const colors = BAND_COLORS[band] || BAND_COLORS['Inelegível / Sem Dados'];
              return (
                <motion.button
                  key={axis.axisId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  onClick={() => onViewAxis(axis.axisId)}
                  className="group relative text-left p-4 rounded-xl border border-neutral-700/40 bg-white/[0.02] hover:border-brand-accent/60 hover:bg-brand-accent/[0.05] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  aria-label={`Abrir análise completa de ${axis.axisName}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] text-neutral-500 px-1.5 py-0.5 rounded bg-white/[0.04]">{axis.axisId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {band}
                    </span>
                  </div>
                  <p className="text-body-sm font-medium text-neutral-50 leading-snug line-clamp-2 group-hover:text-brand-accent transition-colors">
                    {axis.axisName}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-micro text-neutral-500">
                    <span className="truncate">Líder: <span className="text-neutral-300">{leader?.governmentName ?? 'S/D'}</span></span>
                    <span className="font-mono text-brand-accent">{max !== null ? max.toFixed(1) : 'S/D'}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-micro text-brand-accent/70 group-hover:text-brand-accent">
                    <span>Ver Passaporte & Análise</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ============ INSIGHTS — Convergência / Divergência ============ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="rounded-2xl border border-confidence-high/25 bg-confidence-high/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-confidence-high" />
            <h3 className="text-body-sm font-semibold text-neutral-50">Maior Convergência</h3>
            <span className="text-micro text-neutral-500">(menor σ)</span>
          </div>
          <ul className="space-y-2">
            {convergence.map(c => {
              const axis = axes.find(a => a.axisId === c.axisId);
              return (
                <li key={c.axisId} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.02]">
                  <div className="min-w-0">
                    <p className="text-body-sm text-neutral-200 truncate">{axis?.axisName}</p>
                    <p className="font-mono text-[10px] text-neutral-500">gap {c.gap.toFixed(2)} · σ {c.std.toFixed(2)}</p>
                  </div>
                  <span className="font-mono text-micro text-confidence-high shrink-0">{c.std.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-semantic-warning/25 bg-semantic-warning/[0.04] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-semantic-warning" />
            <h3 className="text-body-sm font-semibold text-neutral-50">Maior Divergência</h3>
            <span className="text-micro text-neutral-500">(maior σ)</span>
          </div>
          <ul className="space-y-2">
            {divergence.map(d => {
              const axis = axes.find(a => a.axisId === d.axisId);
              return (
                <li key={d.axisId} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.02]">
                  <div className="min-w-0">
                    <p className="text-body-sm text-neutral-200 truncate">{axis?.axisName}</p>
                    <p className="font-mono text-[10px] text-neutral-500">líder: {d.leader} · gap {d.gap.toFixed(2)}</p>
                  </div>
                  <span className="font-mono text-micro text-semantic-warning shrink-0">{d.std.toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.section>

      {/* ============ EXECUTIVE SUMMARY ============ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="font-display text-heading-xl text-neutral-50 mb-4">Síntese Executiva</h2>
        {isGenerating ? (
          <div className="space-y-3 p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 rounded bg-neutral-700/30 animate-pulse" style={{ width: `${95 - i * 8}%` }} />
            ))}
          </div>
        ) : synthesis ? (
          <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl border border-neutral-700/30 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-accent via-brand-accent/40 to-transparent" />
            <p className="text-body-md text-neutral-200 leading-relaxed whitespace-pre-line">{synthesis.executiveSummary}</p>
            {synthesis.trajectoryAnalysis && (
              <div className="mt-6 pt-6 border-t border-neutral-700/30">
                <h3 className="text-body-sm font-semibold text-neutral-50 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-accent" /> Análise de Trajetória
                </h3>
                <p className="text-body-sm text-neutral-300 leading-relaxed">{synthesis.trajectoryAnalysis}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-body-sm text-neutral-500">Síntese será gerada após conclusão de todos os eixos.</p>
        )}
      </motion.section>

      {/* ============ LESSONS ============ */}
      {lessons.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="font-display text-heading-xl text-neutral-50 mb-4">Lições Estratégicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lessons.map((lesson, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="group relative overflow-hidden p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02] hover:border-brand-accent/40 transition-all"
              >
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-brand-accent/5 blur-2xl group-hover:bg-brand-accent/15 transition-all" />
                <span className="relative font-display text-display-lg text-brand-accent/30 group-hover:text-brand-accent/60 block mb-2 transition-colors">
                  0{i + 1}
                </span>
                <p className="relative text-body-sm text-neutral-300 leading-relaxed">{lesson}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ============ EXPORTS ============ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button className="col-span-2 md:col-span-3 flex items-center justify-center gap-2 py-3.5 rounded-full bg-brand-accent text-brand-primary font-semibold hover:scale-[1.02] active:scale-[0.99] transition-transform text-body-sm shadow-lg shadow-brand-accent/20">
            <Download className="w-4 h-4" /> Baixar PDF Completo
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-body-sm">
            <BarChart3 className="w-4 h-4" /> Infográfico
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-body-sm">
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <Link to={`/analyze/${session.countryId.toLowerCase()}`} className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-body-sm">
            <Eye className="w-4 h-4" /> Ver por Eixo
          </Link>
          <button className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-body-sm">
            <Plus className="w-4 h-4" /> Mais Governos
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent/50 hover:text-brand-accent transition-all text-body-sm">
            <RefreshCw className="w-4 h-4" /> Nova Análise
          </button>
        </div>
      </motion.section>
    </div>
  );
}
