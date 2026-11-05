import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Database,
  FileSearch,
  CalendarClock,
  Sliders,
  Globe2,
  AlertTriangle,
  HelpCircle,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { EvidenceClaim } from '@/types/evidence';
import type { PrimaryDataPoint, CCEEntry } from '@/types/aegis';
import { lookupCanonicalSource } from '@/data/sourceRegistry';
import { SIB_WEIGHT_DISCLAIMER } from '@/data/aiSkills';

interface EvidencePassportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim?: EvidenceClaim | null;
  dataPoint?: PrimaryDataPoint | null;
  cceEntry?: CCEEntry | null;
  governmentName?: string;
  governmentPeriod?: string;
  axisName?: string;
  whatCouldChange?: string[];
}

const VERIFICATION_STATE_LABELS: Record<string, { label: string; color: string }> = {
  FACTUALLY_SUPPORTED: { label: 'Factualmente Suportado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  VALUE_MATCHED: { label: 'Valor Verificado na Série', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CLAIM_LOCATED: { label: 'Série Localizada na CCE', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  SOURCE_RETRIEVED: { label: 'Fonte Recuperada', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  SOURCE_IDENTIFIED: { label: 'Fonte Identificada (Catálogo)', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  INCONCLUSIVE: { label: 'Inconclusivo / Parcial', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  UNVERIFIED: { label: 'Não Verificado Independentemente', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  CONTRADICTED: { label: 'Contradito pelas Fontes', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  QUARANTINED: { label: 'Em Quarentena Epistêmica', color: 'bg-red-500/20 text-red-300 border-red-500/40' },
};

const EPISTEMIC_CATEGORY_LABELS: Record<string, string> = {
  DOCUMENTED_FACT: 'Fato Documentado',
  VALIDATED_STATISTICAL_DATA: 'Dado Estatístico Validado',
  DERIVED_RESULT: 'Resultado Derivado (Auditado)',
  ANALYTICAL_INTERPRETATION: 'Interpretação Analítica',
  HYPOTHESIS: 'Hipótese',
  SIMULATION: 'Simulação',
  UNVERIFIED: 'Não Verificado',
  CONTRADICTORY: 'Contraditório',
};

const DEGRADATION_LABELS: Record<string, string> = {
  VALIDATED_VALUE: 'Degrau 1 — Valor Validado na Série',
  JUSTIFIED_INTERVAL: 'Degrau 2 — Intervalo / Faixa Justificada',
  SUPPORTED_QUALITATIVE_TREND: 'Degrau 3 — Tendência Qualitativa Sustentada',
  DATA_UNAVAILABLE: 'Degrau 4 — Dado Não Disponível (Sem Imputação de Zero)',
};

export const EvidencePassportModal: React.FC<EvidencePassportModalProps> = ({
  open,
  onOpenChange,
  claim,
  dataPoint,
  cceEntry,
  governmentName,
  governmentPeriod,
  axisName,
  whatCouldChange,
}) => {
  const primaryRef = claim?.sourceReferences?.[0] || null;

  const canonicalLookup = React.useMemo(() => {
    const inst = primaryRef?.institution || dataPoint?.source || cceEntry?.institution || '';
    return lookupCanonicalSource(inst);
  }, [primaryRef, dataPoint, cceEntry]);

  const metricName = claim?.metricName || dataPoint?.metricName || cceEntry?.dataName || 'Indicador Analítico';
  const govLabel = governmentName || claim?.governmentId || 'Governo Analisado';
  const periodLabel = governmentPeriod || claim?.referencePeriod || 'Período do Mandato';
  const verificationState = claim?.verificationState || dataPoint?.verificationState || 'SOURCE_IDENTIFIED';
  const epistemicCategory = claim?.epistemicCategory || dataPoint?.epistemicCategory || 'ANALYTICAL_INTERPRETATION';
  const degradationRung = claim?.degradationRung || dataPoint?.degradationRung || (dataPoint?.value === null ? 'DATA_UNAVAILABLE' : 'VALIDATED_VALUE');

  const valueDisplay = React.useMemo(() => {
    const v = claim ? claim.value : dataPoint?.value;
    const unit = claim?.unit || dataPoint?.unit || '';
    if (v === null || v === undefined) {
      return 'Dado não disponível (S/D — Nunca imputado como 0)';
    }
    return `${v} ${unit}`.trim();
  }, [claim, dataPoint]);

  const stateBadge = VERIFICATION_STATE_LABELS[verificationState] || VERIFICATION_STATE_LABELS.SOURCE_IDENTIFIED;

  const reasonCodes = claim?.reasonCodes || dataPoint?.reasonCodes || [];
  const transformations = (claim?.transformations && claim.transformations.length > 0)
    ? claim.transformations.map(t => `${t.type}: ${t.formulaDisplay}`)
    : cceEntry?.transformationsApplied || ['Normalização em escala comparativa auditada (0–10)'];

  const contestability = claim?.contestabilityNote ||
    dataPoint?.contestabilityNote ||
    (whatCouldChange && whatCouldChange[0]) ||
    'Esta conclusão mudaria se revisões definitivas de contas nacionais ou microdados auditados alterassem o sinal da variação no período do mandato.';

  const hasPeriodMismatch = reasonCodes.includes('UNALIGNED_REFERENCE_PERIOD') || reasonCodes.includes('PARTIAL_MANDATE_OVERLAP');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-card border-border/80">
        <DialogHeader className="space-y-2 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                Passaporte de Evidências Ágora · FABLE 5.0
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={`text-[10px] font-mono ${stateBadge.color}`}>
                {stateBadge.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                {EPISTEMIC_CATEGORY_LABELS[epistemicCategory] || epistemicCategory}
              </Badge>
            </div>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {metricName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
            <span>Governo: <strong className="text-foreground">{govLabel}</strong> ({periodLabel})</span>
            {axisName && (
              <>
                <span>·</span>
                <span>Eixo: <strong className="text-foreground">{axisName}</strong></span>
              </>
            )}
            <span>·</span>
            <span>Valor Observado: <strong className="font-mono text-foreground">{valueDisplay}</strong></span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
          {/* 1. ORIGEM */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Database className="w-4 h-4 text-primary" />
              <span>1. Origem e Custódia Primária</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">Instituição:</span> {primaryRef?.institution || dataPoint?.source || cceEntry?.institution || 'Não especificada'}</p>
              <p><span className="text-foreground font-medium">Grupo de Origem (Desduplicação):</span> <code className="font-mono text-[11px] text-primary">{primaryRef?.originGroup || cceEntry?.originGroup || canonicalLookup.originGroup}</code></p>
              <p><span className="text-foreground font-medium">Dataset / Série:</span> {primaryRef?.documentTitle || canonicalLookup.matchedEntry?.methodologySummary || metricName}</p>
              <p><span className="text-foreground font-medium">Ano / Vintage:</span> {dataPoint?.year || cceEntry?.year || claim?.referencePeriod || '—'} (Vintage: {primaryRef?.dataVintage || dataPoint?.vintage || cceEntry?.vintage || 'Edição corrente'})</p>
              <p><span className="text-foreground font-medium">Autoridade Canônica:</span> {canonicalLookup.matchedEntry ? `${canonicalLookup.matchedEntry.institution} (${canonicalLookup.informationNature})` : 'Fonte declarada (sujeita a verificação externa)'}</p>
            </div>
          </div>

          {/* 2. DEFINIÇÃO */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FileSearch className="w-4 h-4 text-primary" />
              <span>2. Definição Técnica e Escopo</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">O que mede:</span> {dataPoint?.definitionSummary || claim?.claimText || `Indicador quantitativo de ${metricName}`}</p>
              <p><span className="text-foreground font-medium">Unidade:</span> <code className="font-mono text-foreground">{claim?.unit || dataPoint?.unit || 'un'}</code></p>
              <p><span className="text-foreground font-medium">Base de Preços / Normalização:</span> <code className="font-mono text-foreground">{dataPoint?.priceBasis || 'unspecified'}</code></p>
              <p><span className="text-foreground font-medium">População / Escopo:</span> {claim?.populationScope || dataPoint?.populationScope || 'Território nacional'}</p>
              <p><span className="text-foreground font-medium">Natureza Metodológica:</span> {(primaryRef?.isPerceptualIndex || cceEntry?.isPerceptualIndex || canonicalLookup.isPerceptualIndex) ? 'Índice Perceptual / Survey de Especialistas' : (cceEntry?.methodologyType || 'Registro Administrativo / Censo / Contas Nacionais')}</p>
            </div>
          </div>

          {/* 3. TEMPORALIDADE */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CalendarClock className="w-4 h-4 text-primary" />
              <span>3. Temporalidade e Janela do Mandato</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">Janela do Mandato:</span> <code className="font-mono text-foreground">{periodLabel}</code></p>
              <p><span className="text-foreground font-medium">Período de Referência da Série:</span> <code className="font-mono text-foreground">{claim?.referencePeriod || String(dataPoint?.year || cceEntry?.year || '—')}</code></p>
              <p className="flex items-center gap-1.5">
                <span className="text-foreground font-medium">Aderência Temporal:</span>
                {hasPeriodMismatch ? (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Fora da janela exata (Defasagem/Série adjacente)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coincide com o mandato
                  </span>
                )}
              </p>
              <p><span className="text-foreground font-medium">Degrau de Degradação AAM:</span> {DEGRADATION_LABELS[degradationRung] || degradationRung}</p>
            </div>
          </div>

          {/* 4. VERIFICAÇÃO */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Scale className="w-4 h-4 text-primary" />
              <span>4. Verificação Determinística (CCE v5.0)</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">Estado Auditado:</span> <code className="font-mono text-primary">{verificationState}</code></p>
              <p><span className="text-foreground font-medium">Status de Recuperação:</span> <code className="font-mono">{primaryRef?.retrievalStatus || cceEntry?.retrievalStatus || 'LIVE_RETRIEVAL_NOT_IMPLEMENTED'}</code></p>
              <p><span className="text-foreground font-medium">Justificativa:</span> Estado atribuído pelo motor determinístico FABLE 5.0 (flags de autoaprovação do LLM foram ignoradas).</p>
              {reasonCodes.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {reasonCodes.map(rc => (
                    <span key={rc} className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                      {rc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. TRANSFORMAÇÕES */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sliders className="w-4 h-4 text-primary" />
              <span>5. Transformações e Padronização</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                {transformations.map((t, i) => (
                  <li key={i} className="leading-relaxed">{t}</li>
                ))}
              </ul>
              <p className="pt-1 text-[11px] text-muted-foreground/80">
                Regra SK-04: taxas em % nunca são somadas como se fossem pontos percentuais (p.p.) sem declaração explícita.
              </p>
            </div>
          </div>

          {/* 6. COMPARABILIDADE */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Globe2 className="w-4 h-4 text-primary" />
              <span>6. Comparabilidade e Limitações</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-foreground font-medium">Nota de Comparabilidade:</span> {claim?.comparabilityNote || dataPoint?.comparabilityWarning || 'Nenhuma quebra estrutural crítica reportada para a janela.'}</p>
              <p><span className="text-foreground font-medium">Limitações Conhecidas da Fonte:</span> {canonicalLookup.matchedEntry?.knownLimitations || 'Comparações entre mandatos estão sujeitas a defasagens de implementação e ciclos exógenos.'}</p>
            </div>
          </div>

          {/* 7. INCERTEZA E SIB */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Info className="w-4 h-4 text-primary" />
              <span>7. Incerteza e Índice SIB Auditado</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">SIB Recalculado:</span>{' '}
                <strong className="font-mono text-primary">
                  {((dataPoint?.sib?.value ?? cceEntry?.sibConfidence ?? 0.75) * 100).toFixed(0)}%
                </strong>{' '}
                ({dataPoint?.sib?.band || cceEntry?.sibBand || 'MODERADA'})
              </p>
              <p><span className="text-foreground font-medium">Cobertura Estimada:</span> {dataPoint?.sib?.coveragePct ?? 80}%</p>
              <p><span className="text-foreground font-medium">Nota de Sensibilidade:</span> SIB penalizado quando múltiplas citações compartilham o mesmo originGroup (n^0.7).</p>
            </div>
          </div>

          {/* 8. CONTESTABILIDADE */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <HelpCircle className="w-4 h-4" />
              <span>8. Contestabilidade ("Mudaria se…")</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="leading-relaxed text-foreground/90">{contestability}</p>
              {whatCouldChange && whatCouldChange.length > 1 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-muted-foreground">
                  {whatCouldChange.slice(1, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Nota Metodológica Obrigatória sobre Pesos SIB (SK-02) */}
        <div className="rounded-md bg-muted/40 border border-border/50 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Declaração Metodológica SK-02 (SIB v5.0): </span>
            {SIB_WEIGHT_DISCLAIMER}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
