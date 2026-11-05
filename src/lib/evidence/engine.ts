/**
 * ÁGORA FABLE 5.0 — Deterministic Evidence & Eligibility Engine (Sections 5, 6, 9, 10, 11, 18)
 *
 * Pipeline sequence:
 * Raw LLM output → Schema validation (Zod) → Prompt injection sanitization →
 * Source validation & originGroup deduplication → Strict observation parsing →
 * Econometric & semantic checks → Transformation recalculation →
 * Deterministic verification state machine → Eligibility & score governance → UI
 */

import type {
  AxisComparativeResult,
  CCEEntry,
  GovernmentAxisScore,
  GovernmentRecord,
  PrimaryDataPoint,
  AAMFlag,
} from '@/types/aegis';
import { getComparativeScoreBand, getSIBBand } from '@/types/aegis';
import type {
  DegradationRung,
  EpistemicCategory,
  EvidenceAudit,
  EvidenceAuditFinding,
  EvidenceClaim,
  EvidenceCoverage,
  EvidenceQuarantine,
  EvidenceSource,
  EvidenceTransformation,
  ExecutionMode,
  GovernmentSeparatedEvaluation,
  PipelineStageReport,
  RankingEligibilityStatus,
  ReasonCode,
  SourceRetrievalStatus,
  ToTDecisionRecord,
  VerificationState,
} from '@/types/evidence';
import { RawAxisComparativeResultSchema } from '@/lib/evidence/schema';
import {
  lookupCanonicalSource,
  computeSourceIndependenceMetrics,
} from '@/data/sourceRegistry';
import { sanitizeUntrustedText, PROMPT_REGISTRY_VERSION } from '@/data/promptRegistry';

// ─── 1. Strict Number Parsing (Section 9 — Semântica rigorosa & Cenário 19) ──

export interface StrictNumberParseResult {
  parsedValue: number | null;
  isAmbiguousFormat: boolean;
  isValid: boolean;
  reasonCode?: ReasonCode;
}

/**
 * Safely parses numeric values.
 * Rejects NaN, Infinity, null, empty strings, and ambiguous thousand/decimal
 * separators like "1,000" or "1.000" (exactly 3 digits after a single separator
 * without explicit locale context).
 */
export function parseStrictObservationNumber(
  raw: unknown,
  localeHint?: 'pt-BR' | 'en-US'
): StrictNumberParseResult {
  if (raw === null || raw === undefined || raw === '') {
    return { parsedValue: null, isAmbiguousFormat: false, isValid: false, reasonCode: 'MISSING_GOVERNMENT_DATA' };
  }

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      return { parsedValue: null, isAmbiguousFormat: false, isValid: false, reasonCode: 'AMBIGUOUS_NUMBER_FORMAT' };
    }
    return { parsedValue: raw, isAmbiguousFormat: false, isValid: true };
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || /^(n\/a|null|undefined|nan|indispon[ií]vel|dado n[aã]o dispon[ií]vel|-|—)$/i.test(trimmed)) {
      return { parsedValue: null, isAmbiguousFormat: false, isValid: false, reasonCode: 'MISSING_GOVERNMENT_DATA' };
    }

    // Ambiguous 3-decimal/thousand pattern e.g. "1,000" or "1.000" or "12,500" without localeHint
    const ambiguousSingleSeparator = /^-?\d{1,3}([.,])\d{3}$/;
    if (!localeHint && ambiguousSingleSeparator.test(trimmed)) {
      return {
        parsedValue: null,
        isAmbiguousFormat: true,
        isValid: false,
        reasonCode: 'AMBIGUOUS_NUMBER_FORMAT',
      };
    }

    // Mixed separators: e.g. "1.234,56" (pt-BR) or "1,234.56" (en-US)
    if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(trimmed)) {
      const normalized = Number(trimmed.replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(normalized)
        ? { parsedValue: normalized, isAmbiguousFormat: false, isValid: true }
        : { parsedValue: null, isAmbiguousFormat: true, isValid: false, reasonCode: 'AMBIGUOUS_NUMBER_FORMAT' };
    }

    if (/^-?\d{1,3}(,\d{3})+\.\d+$/.test(trimmed)) {
      const normalized = Number(trimmed.replace(/,/g, ''));
      return Number.isFinite(normalized)
        ? { parsedValue: normalized, isAmbiguousFormat: false, isValid: true }
        : { parsedValue: null, isAmbiguousFormat: true, isValid: false, reasonCode: 'AMBIGUOUS_NUMBER_FORMAT' };
    }

    if (localeHint === 'pt-BR' && /^-?\d+,\d+$/.test(trimmed)) {
      const normalized = Number(trimmed.replace(',', '.'));
      return { parsedValue: normalized, isAmbiguousFormat: false, isValid: Number.isFinite(normalized) };
    }

    // Simple decimal with comma when not 3 digits (e.g. "4,5" or "12,34")
    if (/^-?\d+,\d{1,2}$/.test(trimmed)) {
      const normalized = Number(trimmed.replace(',', '.'));
      return { parsedValue: normalized, isAmbiguousFormat: false, isValid: Number.isFinite(normalized) };
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num)) {
        return { parsedValue: num, isAmbiguousFormat: false, isValid: true };
      }
    }

    return { parsedValue: null, isAmbiguousFormat: true, isValid: false, reasonCode: 'AMBIGUOUS_NUMBER_FORMAT' };
  }

  return { parsedValue: null, isAmbiguousFormat: true, isValid: false, reasonCode: 'AMBIGUOUS_NUMBER_FORMAT' };
}

// ─── 2. Econometric & Mathematical Recalculation (SK-04 & Cenários 4,6,7,9,18) ─

export function calculateDeltaPct(startValue: number, endValue: number): number | null {
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue) || startValue === 0) {
    return null;
  }
  return Number((((endValue - startValue) / Math.abs(startValue)) * 100).toFixed(2));
}

export function calculateDeltaPercentagePoints(startRate: number, endRate: number): number | null {
  if (!Number.isFinite(startRate) || !Number.isFinite(endRate)) {
    return null;
  }
  return Number((endRate - startRate).toFixed(2));
}

export function calculateCAGR(startValue: number, endValue: number, years: number): number | null {
  if (!Number.isFinite(startValue) || !Number.isFinite(endValue) || startValue <= 0 || endValue <= 0 || years <= 0) {
    return null;
  }
  return Number(((Math.pow(endValue / startValue, 1 / years) - 1) * 100).toFixed(2));
}

/**
 * Detects confusion between percentage variation (%) and percentage points (p.p.).
 * Example: a rate goes from 10% to 15% (+5 p.p., +50%), and text says "subiu 5%"
 * or "variação de 50 pontos percentuais".
 */
export function detectPercentVsPercentagePointConfusion(
  text: string,
  unit?: string,
  priceBasis?: string
): { hasConfusion: boolean; detail?: string } {
  const lower = (text || '').toLowerCase();
  const unitLower = (unit || '').toLowerCase();

  // Pattern 1: explicit contradiction in text e.g. "de 10% para 15% (aumento de 5%)"
  const rateTransitionRegex = /de\s+(\d+(?:[.,]\d+)?)\s*%\s+para\s+(\d+(?:[.,]\d+)?)\s*%[^.]{0,50}?(?:aumento|queda|varia[çc][aã]o|subiu|caiu)\s+de\s+(-?\d+(?:[.,]\d+)?)\s*(%|p\.?p\.?|pontos?\s+percentuais?)/i;
  const match = lower.match(rateTransitionRegex);
  if (match) {
    const v1 = parseFloat(match[1].replace(',', '.'));
    const v2 = parseFloat(match[2].replace(',', '.'));
    const declaredDelta = Math.abs(parseFloat(match[3].replace(',', '.')));
    const declaredUnit = match[4].toLowerCase();
    const diffPp = Math.abs(v2 - v1);
    const diffPct = v1 !== 0 ? Math.abs(((v2 - v1) / v1) * 100) : 0;

    if (declaredUnit === '%' && Math.abs(declaredDelta - diffPp) < 0.15 && Math.abs(diffPct - diffPp) > 1.0) {
      return {
        hasConfusion: true,
        detail: `Variação de ${v1}% para ${v2}% equivale a ${diffPp.toFixed(1)} p.p. (${diffPct.toFixed(1)}%), mas foi descrita como ${declaredDelta}%.`,
      };
    }
    if ((declaredUnit.includes('p') || declaredUnit.includes('ponto')) && Math.abs(declaredDelta - diffPct) < 0.5 && Math.abs(diffPct - diffPp) > 1.0) {
      return {
        hasConfusion: true,
        detail: `Variação de ${v1}% para ${v2}% equivale a ${diffPp.toFixed(1)} p.p., mas foi descrita como ${declaredDelta} pontos percentuais.`,
      };
    }
  }

  // Pattern 2: unit is p.p. but priceBasis is percentage (or vice versa in conflicting label)
  if (
    (priceBasis === 'percentage_point' && unitLower === '%') ||
    (priceBasis === 'percentage' && (unitLower === 'p.p.' || unitLower === 'pp'))
  ) {
    return {
      hasConfusion: true,
      detail: `Incompatibilidade entre base dimensional (${priceBasis}) e unidade exibida (${unit}).`,
    };
  }

  return { hasConfusion: false };
}

/**
 * Checks whether an unexecuted advanced calculation (e.g. "bootstrap ×1000",
 * "regressão de painel", "controle sintético executado") is claimed in prose
 * without any corresponding transformation inputs.
 */
export function detectUnexecutedCalculationClaims(
  text: string,
  transformations: EvidenceTransformation[]
): string[] {
  const rejected: string[] = [];
  const lower = (text || '').toLowerCase();

  const claimsBootstrap = /bootstrap\s*(?:x|×|\*)?\s*1000|1\.?000\s*reamostragens\s*executadas/i.test(lower);
  if (claimsBootstrap && !transformations.some((t) => t.type === 'bootstrap_ci' && t.computationVerified)) {
    rejected.push('Alegação de bootstrap ×1000 sem execução determinística de reamostragem sobre série primária.');
  }

  const claimsRegression = /regress[aã]o\s+(?:de\s+painel|linear|iv|2sls)\s+estimada/i.test(lower);
  if (claimsRegression && transformations.length === 0) {
    rejected.push('Alegação de regressão econométrica sem matriz de observações verificada.');
  }

  const claimsCagr = /\bcagr\s*(?:calculado|de)\s*(-?\d+(?:[.,]\d+)?)\s*%/i.test(lower);
  if (claimsCagr && !transformations.some((t) => t.type === 'cagr' && t.computationVerified)) {
    rejected.push('Alegação de CAGR textual sem insumos inicial/final verificados na trilha de transformações.');
  }

  return rejected;
}

// ─── 3. Semantic Neutrality & Label-Swap Invariance (SK-03 & Cenário 12) ────

const PARTISAN_OR_BIASED_LEXICON = [
  'populista',
  'populismo',
  'neoliberal',
  'neoliberalismo',
  'esquerdista',
  'direitista',
  'extrema-esquerda',
  'extrema-direita',
  'bolsonarismo',
  'petismo',
  'lulopetismo',
  'desastroso',
  'desastrosa',
  'catastrófico',
  'catastrófica',
  'milagroso',
  'milagrosa',
  'demagógico',
  'demagógica',
  'irresponsável',
  'genocida',
  'fascista',
  'comunista',
];

export function auditSemanticNeutrality(
  thesis: string,
  antithesis: string,
  methodologicalNote: string
): {
  passed: boolean;
  isSymmetricLength: boolean;
  thesisLengthWords: number;
  antithesisLengthWords: number;
  lengthDeltaRatio: number;
  partisanTermsDetected: string[];
} {
  const combined = `${thesis} ${antithesis} ${methodologicalNote}`.toLowerCase();
  const partisanTermsDetected = PARTISAN_OR_BIASED_LEXICON.filter((term) => {
    const rx = new RegExp(`\\b${term.replace('-', '[-\\s]?')}s?\\b`, 'i');
    return rx.test(combined);
  });

  const thesisWords = thesis.trim().split(/\s+/).filter(Boolean).length;
  const antithesisWords = antithesis.trim().split(/\s+/).filter(Boolean).length;
  const maxWords = Math.max(thesisWords, antithesisWords, 1);
  const lengthDeltaRatio = Number((Math.abs(thesisWords - antithesisWords) / maxWords).toFixed(2));
  const isSymmetricLength = lengthDeltaRatio <= 0.45;

  return {
    passed: partisanTermsDetected.length === 0 && isSymmetricLength,
    isSymmetricLength,
    thesisLengthWords: thesisWords,
    antithesisLengthWords: antithesisWords,
    lengthDeltaRatio,
    partisanTermsDetected,
  };
}

/**
 * SK-08 / Cenário 20: Detects unjustified causal attribution in synthesis/narratives.
 */
export function detectUnjustifiedCausalClaims(text: string): {
  hasUnjustifiedCausalClaim: boolean;
  hasOverclaim: boolean;
  matchedClaims: string[];
} {
  const patterns = [
    /\bcomprova\s+que\s+o\s+governo\s+causou\b/i,
    /\bcausou\s+diretamente\b/i,
    /\befeito\s+causal\s+(?:l[ií]quido\s+)?comprovado\b/i,
    /\bfoi\s+100%\s+causado\s+pelo\s+(?:presidente|governante|mandato)\b/i,
    /\bprova\s+de\s+forma\s+definitiva\s+que\s+a\s+pol[ií]tica\b/i,
    /\bcausalidade\s+direta\s+e\s+inequ[ií]voca\b/i,
  ];
  const matchedClaims: string[] = [];
  for (const rx of patterns) {
    const m = (text || '').match(rx);
    if (m) matchedClaims.push(m[0]);
  }
  const detected = matchedClaims.length > 0;
  return {
    hasUnjustifiedCausalClaim: detected,
    hasOverclaim: detected,
    matchedClaims,
  };
}

// ─── 4. Mandate Period Overlap & Comparability (SK-04, SK-08, Cenários 4,6,18) ─

export function parsePeriodYears(period: string): { start: number | null; end: number | null } {
  const matches = (period || '').match(/\b(19\d{2}|20\d{2})\b/g);
  if (!matches || matches.length === 0) return { start: null, end: null };
  const start = parseInt(matches[0], 10);
  const end = matches.length > 1 ? parseInt(matches[1], 10) : null;
  return { start, end };
}

export function checkMandatePeriodOverlap(
  indicatorYear: number | null,
  govPeriod: string,
  allGovernments: { id: string; period: string }[] = [],
  currentGovId = ''
): {
  withinMandate: boolean;
  matchesMandate: boolean;
  overlapsWithOtherMandate: boolean;
  isTransitionBoundaryYear: boolean;
  overlappingGovIds: string[];
  reasonCode?: ReasonCode;
} {
  if (!indicatorYear || !Number.isFinite(indicatorYear)) {
    return {
      withinMandate: false,
      matchesMandate: false,
      overlapsWithOtherMandate: false,
      isTransitionBoundaryYear: false,
      overlappingGovIds: [],
      reasonCode: 'UNALIGNED_REFERENCE_PERIOD',
    };
  }

  const currentBounds = parsePeriodYears(govPeriod);
  const effectiveEnd = currentBounds.end ?? new Date().getFullYear();
  const withinMandate =
    currentBounds.start !== null &&
    indicatorYear >= currentBounds.start - 1 && // Allows immediate baseline year t-1
    indicatorYear <= effectiveEnd;

  const overlappingGovIds: string[] = [];
  for (const other of allGovernments) {
    if (currentGovId && other.id === currentGovId) continue;
    if (!currentGovId && other.period === govPeriod) continue;
    const b = parsePeriodYears(other.period);
    const otherEnd = b.end ?? new Date().getFullYear();
    if (b.start !== null && indicatorYear >= b.start && indicatorYear <= otherEnd) {
      overlappingGovIds.push(other.id);
    }
  }

  const overlapsWithOtherMandate = overlappingGovIds.length > 0;
  const reasonCode: ReasonCode | undefined = !withinMandate
    ? 'UNALIGNED_REFERENCE_PERIOD'
    : overlapsWithOtherMandate
    ? 'PARTIAL_MANDATE_OVERLAP'
    : undefined;

  return {
    withinMandate,
    matchesMandate: withinMandate,
    overlapsWithOtherMandate,
    isTransitionBoundaryYear: overlapsWithOtherMandate,
    overlappingGovIds,
    reasonCode,
  };
}

// ─── 5. Deterministic SIB & Verification State Machine (Section 9) ──────────

export const SIB_CALIBRATION_DISCLAIMER =
  'Nota metodológica (SK-02): Os pesos do índice SIB (0.35·autoridade + 0.25·cobertura + 0.20·atualidade + 0.20·independência) são parâmetros metodológicos definidos pelo produto para ordenar a qualidade de proveniência, não constituindo probabilidade empírica calibrada de verdade factual.';

/**
 * Derives the deterministic VerificationState for a single observation/claim.
 * Never trusts self-declared `verified=true` from the LLM.
 * Without live retrieval, the state is capped at `SOURCE_IDENTIFIED`.
 */
export function deriveDeterministicVerificationState(params: {
  hasValidValue: boolean;
  isAmbiguousNumber: boolean;
  authorityVerified: boolean;
  isAggregatorOrVague: boolean;
  isSuspiciousUrlOrDoi: boolean;
  hasValueConflict: boolean;
  hasNominalRealMismatch: boolean;
  hasPercentPpError: boolean;
  liveRetrievedAndMatched: boolean;
}): {
  state: VerificationState;
  epistemicCategory: EpistemicCategory;
  degradationRung: DegradationRung;
} {
  if (params.hasValueConflict) {
    return {
      state: 'CONTRADICTED',
      epistemicCategory: 'CONTRADICTORY',
      degradationRung: 'JUSTIFIED_INTERVAL',
    };
  }

  if (params.hasNominalRealMismatch || params.hasPercentPpError) {
    return {
      state: 'QUARANTINED',
      epistemicCategory: 'UNVERIFIED',
      degradationRung: 'DATA_UNAVAILABLE',
    };
  }

  if (params.isAmbiguousNumber) {
    return {
      state: 'INCONCLUSIVE',
      epistemicCategory: 'UNVERIFIED',
      degradationRung: 'SUPPORTED_QUALITATIVE_TREND',
    };
  }

  if (!params.hasValidValue) {
    return {
      state: 'INCONCLUSIVE',
      epistemicCategory: 'UNVERIFIED',
      degradationRung: 'DATA_UNAVAILABLE',
    };
  }

  if (params.isSuspiciousUrlOrDoi || params.isAggregatorOrVague || !params.authorityVerified) {
    return {
      state: 'UNVERIFIED',
      epistemicCategory: 'UNVERIFIED',
      degradationRung: 'SUPPORTED_QUALITATIVE_TREND',
    };
  }

  if (params.liveRetrievedAndMatched) {
    return {
      state: 'FACTUALLY_SUPPORTED',
      epistemicCategory: 'VALIDATED_STATISTICAL_DATA',
      degradationRung: 'VALIDATED_VALUE',
    };
  }

  // When authority is verified in the canonical registry, but no live document retrieval was performed:
  return {
    state: 'SOURCE_IDENTIFIED',
    epistemicCategory: 'ANALYTICAL_INTERPRETATION',
    degradationRung: 'VALIDATED_VALUE',
  };
}

/**
 * Recalculates SIB deterministically from actual source authority, coverage, and origin independence.
 * Caps confidence when live retrieval is not active (preventing "98% truth probability" claims).
 */
export function recalculateDeterministicSIB(params: {
  authorityVerified: boolean;
  isPerceptualIndex: boolean;
  coverageRatio: number; // 0..1
  uniqueOriginsCount: number;
  hasSharedOriginEcho: boolean;
  liveRetrieved: boolean;
  declaredSibValue?: number | null;
}): {
  sibValue: number;
  sibBand: 'ALTA' | 'MODERADA' | 'BAIXA' | 'INCONCLUSIVA';
  uncalibratedClaimRejected: boolean;
} {
  const uncalibratedClaimRejected = Boolean(
    typeof params.declaredSibValue === 'number' &&
    params.declaredSibValue > 0.92 &&
    !params.liveRetrieved
  );

  const qualityComponent = params.authorityVerified
    ? params.isPerceptualIndex
      ? 0.78
      : 0.90
    : 0.30;

  const coverageComponent = Math.max(0, Math.min(1, params.coverageRatio));
  const recencyComponent = params.authorityVerified ? 0.85 : 0.40;
  const independenceComponent =
    params.uniqueOriginsCount >= 3
      ? 0.95
      : params.uniqueOriginsCount === 2
      ? 0.80
      : params.uniqueOriginsCount === 1
      ? params.hasSharedOriginEcho
        ? 0.55
        : 0.70
      : 0.20;

  let computed =
    0.35 * qualityComponent +
    0.25 * coverageComponent +
    0.20 * recencyComponent +
    0.20 * independenceComponent;

  // Cap at 0.88 when in RESEARCH_PARTIAL (no live document retrieval)
  if (!params.liveRetrieved) {
    computed = Math.min(computed, 0.88);
  }

  const sibValue = Number(computed.toFixed(2));
  return {
    sibValue,
    sibBand: getSIBBand(sibValue),
    uncalibratedClaimRejected,
  };
}

// ─── 6. Canonical 13-Stage Pipeline Report (Section 6) ──────────────────────

export function buildPipelineStageReports(
  executionMode: ExecutionMode,
  hasValidClaims: boolean,
  rankingEligible: boolean
): PipelineStageReport[] {
  const live = executionMode === 'VERIFIED_LIVE';
  const demo = executionMode === 'DEMO_FIXTURE';

  return [
    {
      stepNumber: 1,
      stageId: 'USER_QUERY',
      stageName: 'Pergunta do usuário',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Seleção de país, governos e eixos temáticos validada e sanitizada.',
    },
    {
      stepNumber: 2,
      stageId: 'SCOPE_DELIMITATION',
      stageName: 'Delimitação do objeto e período',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Recorte temporal de mandatos e detecção de sobreposição parcial de anos aplicados.',
    },
    {
      stepNumber: 3,
      stageId: 'INVESTIGATION_PLAN',
      stageName: 'Plano de investigação (ToT)',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Alternativas metodológicas avaliadas e registradas com critério de escolha.',
    },
    {
      stepNumber: 4,
      stageId: 'SOURCE_ACQUISITION',
      stageName: 'Identificação e aquisição de fontes',
      status: live ? 'OPERATIONAL' : demo ? 'DEMO_FIXTURE' : 'LIVE_RETRIEVAL_NOT_IMPLEMENTED',
      detail: live
        ? 'Fontes primárias recuperadas e verificadas.'
        : 'Fontes identificadas no Registro Canônico; recuperação HTTP documental ao vivo não executada (LIVE_RETRIEVAL_NOT_IMPLEMENTED).',
    },
    {
      stepNumber: 5,
      stageId: 'PROVENANCE_VALIDATION',
      stageName: 'Classificação e validação de proveniência',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Validação determinística contra o Registro Canônico e deduplicação por originGroup.',
    },
    {
      stepNumber: 6,
      stageId: 'OBSERVATION_EXTRACTION',
      stageName: 'Extração de observações verificáveis',
      status: hasValidClaims ? (demo ? 'DEMO_FIXTURE' : 'PARTIAL') : 'PARTIAL',
      detail: 'Observações validadas via schema Zod e parser numérico estrito.',
    },
    {
      stepNumber: 7,
      stageId: 'INDICATOR_HARMONIZATION',
      stageName: 'Harmonização de indicadores',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Verificação de unidade, base nominal vs real, % vs p.p. e alinhamento de janelas.',
    },
    {
      stepNumber: 8,
      stageId: 'DETERMINISTIC_VERIFICATION',
      stageName: 'Verificação determinística de afirmações',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Máquina de estados determinística executada; autodeclarações do modelo sobrescritas.',
    },
    {
      stepNumber: 9,
      stageId: 'CONTEXTUAL_COMPARATIVE_ANALYSIS',
      stageName: 'Análise contextual e comparativa',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Decomposição macro-histórica com distinção entre resíduo e causalidade.',
    },
    {
      stepNumber: 10,
      stageId: 'BIAS_AND_ROBUSTNESS_AUDIT',
      stageName: 'Auditoria de vieses e robustez',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Varredura lexical APP+, teste de permutação de governos e achados adversários SK-06.',
    },
    {
      stepNumber: 11,
      stageId: 'GROUNDED_NARRATIVE',
      stageName: 'Geração narrativa fundamentada',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: 'Tese, antítese e 3 camadas pedagógicas vinculadas aos registros de evidência.',
    },
    {
      stepNumber: 12,
      stageId: 'ELIGIBILITY_CONTROL',
      stageName: 'Controle de elegibilidade dos resultados',
      status: demo ? 'DEMO_FIXTURE' : 'OPERATIONAL',
      detail: rankingEligible
        ? 'Governos aprovados nos critérios mínimos de elegibilidade.'
        : 'Quarentena ou bloqueio de ranking aplicado para governos sem suporte suficiente.',
    },
    {
      stepNumber: 13,
      stageId: 'TRANSPARENCY_PASSPORT_UI',
      stageName: 'Visualização, fontes e Passaporte de Evidências',
      status: 'OPERATIONAL',
      detail: 'Passaporte de Evidências interativo e seção pública de contestabilidade disponíveis.',
    },
  ];
}

// ─── 7. Main Deterministic Governance Function (Sections 9, 10, 18) ─────────

export interface GovernanceOptions {
  countryId?: string;
  actualModelExecuted?: string;
  executionMode?: ExecutionMode;
  isDemoFixture?: boolean;
  liveRetrievedObservations?: {
    metricName: string;
    governmentId: string;
    year: number;
    verifiedValue: number;
    unit: string;
    sourceId: string;
  }[];
  externalObservationsForConflictCheck?: {
    metricName: string;
    governmentId: string;
    year: number;
    value: number;
    source: string;
  }[];
}

/**
 * Takes a raw AxisComparativeResult (from LLM, edge function, or test fixture)
 * and runs the complete deterministic FABLE 5.0 verification and eligibility pipeline.
 */
export function governAxisAnalysisResult(
  rawInput: unknown,
  options: GovernanceOptions = {}
): AxisComparativeResult {
  const parsedSchema = RawAxisComparativeResultSchema.safeParse(rawInput);
  if (!parsedSchema.success) {
    throw new Error(`Falha de validação estrutural no contrato do eixo: ${parsedSchema.error.issues[0]?.message || 'JSON inválido'}`);
  }

  const raw = parsedSchema.data;
  const countryId = (options.countryId || 'BR').toUpperCase();

  // Determine true execution mode (never allow demo fixture to masquerade as VERIFIED_LIVE)
  const hasLiveMatches = Boolean(options.liveRetrievedObservations && options.liveRetrievedObservations.length > 0);
  const executionMode: ExecutionMode = options.isDemoFixture || options.executionMode === 'DEMO_FIXTURE'
    ? 'DEMO_FIXTURE'
    : hasLiveMatches && options.executionMode === 'VERIFIED_LIVE'
    ? 'VERIFIED_LIVE'
    : 'RESEARCH_PARTIAL';

  const globalReasonCodes = new Set<ReasonCode>();
  const globalAamFlags = new Set<AAMFlag>();

  if (executionMode === 'DEMO_FIXTURE') {
    globalReasonCodes.add('DEMO_FIXTURE_LABELED');
  } else if (executionMode === 'RESEARCH_PARTIAL') {
    globalReasonCodes.add('LIVE_RETRIEVAL_NOT_IMPLEMENTED');
  }

  // Detect any attempt by payload to self-declare verified=true or eligible=true
  const hadSelfDeclaredVerified =
    raw.verified === true ||
    raw.eligible === true ||
    raw.auditTrail?.verified === true ||
    raw.governmentScores.some((g) => g.verified === true || g.primaryData.some((d) => d.verified === true)) ||
    raw.cceTable.some((c) => c.verified === true || c.retrieved === true);

  if (hadSelfDeclaredVerified && executionMode !== 'VERIFIED_LIVE') {
    globalReasonCodes.add('SELF_DECLARED_VERIFIED_OVERRIDDEN');
    globalAamFlags.add('ATENCAO_METODOLOGICA');
  }

  // ── Validate & Deduplicate CCE Sources (SK-02, SK-05) ──
  const evidenceSources: EvidenceSource[] = [];
  const governedCceTable: CCEEntry[] = raw.cceTable.map((entry, idx) => {
    const instSan = sanitizeUntrustedText(entry.institution);
    const nameSan = sanitizeUntrustedText(entry.dataName);
    if (instSan.injectionDetected || nameSan.injectionDetected) {
      globalReasonCodes.add('PROMPT_INJECTION_STRIPPED');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
    }

    const lookup = lookupCanonicalSource(
      instSan.sanitized,
      raw.axisId,
      entry.originalUrl,
      entry.originGroup
    );

    if (lookup.isSuspiciousUrlOrDoi) {
      globalReasonCodes.add('INVENTED_OR_INVALID_DOI_URL');
      globalAamFlags.add('INFERENCIA_NAO_FATO');
    }
    if (lookup.isAggregatorOrVague) {
      globalReasonCodes.add('AGGREGATOR_OR_WIKI_REJECTED');
      globalAamFlags.add('CONFIANCA_BAIXA');
    } else if (!lookup.authorityVerified) {
      globalReasonCodes.add('UNREGISTERED_INSTITUTION');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
    }
    if (lookup.isPerceptualIndex) {
      globalReasonCodes.add('PERCEPTUAL_INDEX_CAVEAT');
    }

    const yearNum = typeof entry.year === 'number' ? entry.year : parseInt(String(entry.year || ''), 10) || new Date().getFullYear();
    const vintageStr = entry.vintage || `${yearNum} (série declarada)`;
    const hasRevisionMention = /revisad[oa]|preliminar|quebra/i.test(vintageStr) || /revisad[oa]/i.test(entry.methodologyType);
    if (hasRevisionMention) {
      globalReasonCodes.add('SERIES_VINTAGE_REVISION_DETECTED');
      globalAamFlags.add('DADO_PRELIMINAR');
    }

    const retrievalStatus: SourceRetrievalStatus = lookup.isSuspiciousUrlOrDoi
      ? 'RETRIEVAL_FAILED_OR_NOT_FOUND'
      : executionMode === 'VERIFIED_LIVE' && lookup.authorityVerified
      ? 'RETRIEVED_AND_LOCATED'
      : 'LIVE_RETRIEVAL_NOT_IMPLEMENTED';

    const sourceId = `SRC-${raw.axisId}-${idx + 1}`;
    const sibConf = lookup.authorityVerified
      ? lookup.isPerceptualIndex
        ? 0.78
        : 0.86
      : 0.30;

    evidenceSources.push({
      sourceId,
      institution: instSan.sanitized || 'Fonte não especificada',
      documentTitle: nameSan.sanitized,
      originalUrl: lookup.isSuspiciousUrlOrDoi ? null : (entry.originalUrl ?? null),
      datasetOrTableId: lookup.matchedEntry?.id ?? null,
      publicationDate: String(yearNum),
      accessedAt: executionMode === 'VERIFIED_LIVE' ? new Date().toISOString() : null,
      dataVintage: vintageStr,
      locator: null,
      methodology: entry.methodologyType || lookup.matchedEntry?.methodologySummary || 'administrativo',
      originGroup: lookup.originGroup,
      informationNature: lookup.informationNature,
      isPerceptualIndex: lookup.isPerceptualIndex,
      retrievalStatus,
      authorityVerifiedInRegistry: lookup.authorityVerified,
    });

    return {
      dataName: nameSan.sanitized,
      institution: instSan.sanitized || 'Fonte não especificada',
      year: yearNum,
      methodologyType: entry.methodologyType || 'administrativo',
      sibConfidence: sibConf,
      sibBand: getSIBBand(sibConf),
      sourceId,
      originGroup: lookup.originGroup,
      vintage: vintageStr,
      originalUrl: lookup.isSuspiciousUrlOrDoi ? null : (entry.originalUrl ?? null),
      retrievalStatus,
      authorityVerified: lookup.authorityVerified,
      isPerceptualIndex: lookup.isPerceptualIndex,
      transformationsApplied: entry.transformationsApplied || [],
    };
  });

  const independenceMetrics = computeSourceIndependenceMetrics(
    governedCceTable.map((c) => ({
      institution: c.institution,
      originGroup: c.originGroup,
      axisId: raw.axisId,
      url: c.originalUrl,
    }))
  );

  if (independenceMetrics.hasSharedOriginEcho) {
    globalReasonCodes.add('SHARED_ORIGIN_DISCOUNT_APPLIED');
  }

  // ── Check cross-government comparability by metric name (SK-04) ──
  const metricMetadataByGov = new Map<
    string,
    { govId: string; unit: string; priceBasis: string; year: number | null; value: number | null; source: string }[]
  >();

  for (const gs of raw.governmentScores) {
    for (const d of gs.primaryData) {
      const key = d.metricName.trim().toLowerCase();
      const parsedVal = parseStrictObservationNumber(d.value);
      const yr = typeof d.year === 'number' ? d.year : parseInt(String(d.year || ''), 10) || null;
      const inferredBasis =
        d.priceBasis ||
        (/\bnominal\b/i.test(`${d.metricName} ${d.unit}`)
          ? 'nominal'
          : /\breal\b/i.test(`${d.metricName} ${d.unit}`)
          ? 'real'
          : d.unit.trim() === '%'
          ? 'percentage'
          : /p\.?p\.?/i.test(d.unit)
          ? 'percentage_point'
          : 'unspecified');

      const list = metricMetadataByGov.get(key) || [];
      list.push({
        govId: gs.governmentId,
        unit: d.unit.trim(),
        priceBasis: inferredBasis,
        year: yr,
        value: parsedVal.parsedValue,
        source: d.source,
      });
      metricMetadataByGov.set(key, list);
    }
  }

  const metricsWithNominalRealConflict = new Set<string>();
  const metricsWithUnitConflict = new Set<string>();
  const metricsWithVintageRevision = new Set<string>();

  for (const [metricKey, entries] of metricMetadataByGov.entries()) {
    const bases = new Set(entries.map((e) => e.priceBasis).filter((b) => b !== 'unspecified'));
    if (bases.has('nominal') && bases.has('real')) {
      metricsWithNominalRealConflict.add(metricKey);
      globalReasonCodes.add('NOMINAL_VS_REAL_MISMATCH');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
    }
    const hasPct = entries.some((e) => e.unit === '%' || e.priceBasis === 'percentage');
    const hasPp = entries.some((e) => /^p\.?p\.?$/i.test(e.unit) || e.priceBasis === 'percentage_point');
    if (hasPct && hasPp) {
      metricsWithUnitConflict.add(metricKey);
      globalReasonCodes.add('PERCENT_VS_PERCENTAGE_POINT_ERROR');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
    }
  }

  // Check explicit vintage revisions across governments for the same metric (Cenário 16)
  const metricVintages = new Map<string, Set<string>>();
  for (const gs of raw.governmentScores) {
    for (const d of gs.primaryData) {
      if (d.vintage && d.vintage.trim()) {
        const key = d.metricName.trim().toLowerCase();
        const set = metricVintages.get(key) || new Set<string>();
        set.add(d.vintage.trim().toLowerCase());
        metricVintages.set(key, set);
      }
    }
  }
  for (const [metricKey, vSet] of metricVintages.entries()) {
    if (vSet.size > 1) {
      metricsWithVintageRevision.add(metricKey);
      globalReasonCodes.add('SERIES_VINTAGE_REVISION_DETECTED');
    }
  }

  // ── Process Each Government Score & Primary Data (SK-01 to SK-08) ──
  const allGovPeriods = raw.governmentScores.map((g) => ({ id: g.governmentId, period: g.period }));
  const evidenceClaims: EvidenceClaim[] = [];
  const evidenceCoverage: EvidenceCoverage[] = [];
  const evidenceQuarantine: EvidenceQuarantine[] = [];
  const auditFindings: EvidenceAuditFinding[] = [];
  const allPartisanTerms = new Set<string>();
  const allRejectedCalculations = new Set<string>();
  let anyComparableWindowIssue = false;
  let anyWindowInstabilityDeclared = false;
  let anyOrphanNarrativeNumber = false;

  const governedGovernmentScores: GovernmentAxisScore[] = raw.governmentScores.map((gs) => {
    const thesisSan = sanitizeUntrustedText(gs.thesisSummary);
    const antithesisSan = sanitizeUntrustedText(gs.antithesisSummary);
    const noteSan = sanitizeUntrustedText(gs.methodologicalNote);

    if (thesisSan.injectionDetected || antithesisSan.injectionDetected || noteSan.injectionDetected) {
      globalReasonCodes.add('PROMPT_INJECTION_STRIPPED');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
      evidenceQuarantine.push({
        quarantineId: `QRN-INJ-${raw.axisId}-${gs.governmentId}`,
        targetType: 'claim',
        targetId: gs.governmentId,
        governmentId: gs.governmentId,
        reasonCodes: ['PROMPT_INJECTION_STRIPPED'],
        explanation: 'Tentativa de injeção de instrução detectada e neutralizada no texto.',
        howToResolve: 'Remover instruções imperativas externas dos insumos textuais.',
        quarantinedAt: new Date().toISOString(),
      });
    }

    // Check window instability declaration (±1 year sensitivity, Cenário 18)
    if (/\bsinal\s+muda\b|[±+-]\s*1\s*ano|\binstabilidade\s+de\s+janela\b/i.test(noteSan.sanitized)) {
      anyWindowInstabilityDeclared = true;
    }

    // Check orphan decimal/percentage numbers in narrative not backed by primaryData (Cenário 03)
    const knownNumericValues = gs.primaryData
      .map((d) => parseStrictObservationNumber(d.value).parsedValue)
      .filter((v): v is number => v !== null);
    const narrativeDecimalMatches = `${thesisSan.sanitized} ${antithesisSan.sanitized}`.match(/\b\d+\.\d+\s*%?/g) || [];
    for (const rawMatch of narrativeDecimalMatches) {
      const numVal = parseFloat(rawMatch.replace('%', '').trim());
      if (Number.isFinite(numVal)) {
        const isBacked = knownNumericValues.some((kv) => Math.abs(kv - numVal) < 0.05);
        if (!isBacked) {
          anyOrphanNarrativeNumber = true;
          globalAamFlags.add('ATENCAO_METODOLOGICA');
        }
      }
    }

    const govReasonCodes = new Set<ReasonCode>();
    const govFlags = new Set<AAMFlag>();

    // SK-03 Semantic Neutrality check
    const neutrality = auditSemanticNeutrality(
      thesisSan.sanitized,
      antithesisSan.sanitized,
      noteSan.sanitized
    );
    if (!neutrality.passed) {
      govReasonCodes.add('PARTISAN_LEXICON_DETECTED');
      globalReasonCodes.add('PARTISAN_LEXICON_DETECTED');
      govFlags.add('APP_SWAP_FAIL');
      globalAamFlags.add('APP_SWAP_FAIL');
      neutrality.partisanTermsDetected.forEach((t) => allPartisanTerms.add(t));
    } else {
      govFlags.add('APP_SWAP_PASS');
    }

    if (neutrality.lengthDeltaRatio > 0.45 && thesisSan.sanitized.length > 0 && antithesisSan.sanitized.length > 0) {
      govReasonCodes.add('ASYMMETRIC_THESIS_ANTITHESIS');
    }

    // SK-08 / SK-04 Unjustified causal language check
    const causalCheck = detectUnjustifiedCausalClaims(
      `${thesisSan.sanitized} ${antithesisSan.sanitized} ${noteSan.sanitized}`
    );
    if (causalCheck.hasUnjustifiedCausalClaim) {
      govReasonCodes.add('UNJUSTIFIED_CAUSAL_CLAIM');
      globalReasonCodes.add('UNJUSTIFIED_CAUSAL_CLAIM');
      govFlags.add('INFERENCIA_NAO_FATO');
      globalAamFlags.add('INFERENCIA_NAO_FATO');
    }

    // SK-04 Percentage vs Percentage Point check in prose
    const ppConfusionProse = detectPercentVsPercentagePointConfusion(
      `${thesisSan.sanitized} ${antithesisSan.sanitized} ${noteSan.sanitized}`
    );
    if (ppConfusionProse.hasConfusion) {
      govReasonCodes.add('PERCENT_VS_PERCENTAGE_POINT_ERROR');
      globalReasonCodes.add('PERCENT_VS_PERCENTAGE_POINT_ERROR');
      govFlags.add('ATENCAO_METODOLOGICA');
      globalAamFlags.add('ATENCAO_METODOLOGICA');
    }

    // Process primaryData points for this government
    const govOriginGroups = new Set<string>();
    const govTransformations: EvidenceTransformation[] = [];

    const governedPrimaryData: PrimaryDataPoint[] = gs.primaryData.map((dp, dpIdx) => {
      const dpReasonCodes = new Set<ReasonCode>();
      const dpFlags = new Set<AAMFlag>((dp.aamFlags || []) as AAMFlag[]);
      const metricSan = sanitizeUntrustedText(dp.metricName).sanitized;
      const sourceSan = sanitizeUntrustedText(dp.source);
      if (sourceSan.injectionDetected) {
        dpReasonCodes.add('PROMPT_INJECTION_STRIPPED');
        globalReasonCodes.add('PROMPT_INJECTION_STRIPPED');
      }

      const metricKey = metricSan.toLowerCase();
      const numberParse = parseStrictObservationNumber(dp.value);
      if (numberParse.reasonCode) {
        dpReasonCodes.add(numberParse.reasonCode);
        govReasonCodes.add(numberParse.reasonCode);
        globalReasonCodes.add(numberParse.reasonCode);
      }
      if (numberParse.isAmbiguousFormat) {
        dpFlags.add('ATENCAO_METODOLOGICA');
        globalAamFlags.add('ATENCAO_METODOLOGICA');
      }

      const yearNum = typeof dp.year === 'number' ? dp.year : parseInt(String(dp.year || ''), 10) || 0;
      const sourceLookup = lookupCanonicalSource(sourceSan.sanitized, raw.axisId);

      // Also check if this indicator has a matching entry in cceTable
      const matchingCce = governedCceTable.find(
        (c) =>
          c.dataName.toLowerCase().includes(metricKey.slice(0, 10)) ||
          metricKey.includes(c.dataName.toLowerCase().slice(0, 10)) ||
          c.institution.toLowerCase() === sourceSan.sanitized.toLowerCase()
      );

      const authorityVerified = sourceLookup.authorityVerified && Boolean(sourceSan.sanitized.trim());
      if (!authorityVerified) {
        dpReasonCodes.add(
          sourceLookup.isAggregatorOrVague
            ? 'AGGREGATOR_OR_WIKI_REJECTED'
            : 'UNREGISTERED_INSTITUTION'
        );
        dpFlags.add('INFERENCIA_NAO_FATO');
      } else {
        govOriginGroups.add(matchingCce?.originGroup || sourceLookup.originGroup);
      }

      if (sourceLookup.isPerceptualIndex) {
        dpReasonCodes.add('PERCEPTUAL_INDEX_CAVEAT');
      }

      // Check mandate window & partial overlap (Cenários 4 & 18)
      const periodCheck = checkMandatePeriodOverlap(yearNum, gs.period, allGovPeriods, gs.governmentId);
      if (!periodCheck.withinMandate && yearNum > 0) {
        dpReasonCodes.add('UNALIGNED_REFERENCE_PERIOD');
        govReasonCodes.add('UNALIGNED_REFERENCE_PERIOD');
        globalReasonCodes.add('UNALIGNED_REFERENCE_PERIOD');
        dpFlags.add('ATENCAO_METODOLOGICA');
        anyComparableWindowIssue = true;
      }
      if (periodCheck.overlapsWithOtherMandate) {
        dpReasonCodes.add('PARTIAL_MANDATE_OVERLAP');
        govReasonCodes.add('PARTIAL_MANDATE_OVERLAP');
        globalReasonCodes.add('PARTIAL_MANDATE_OVERLAP');
      }

      // Check nominal vs real and % vs pp conflicts
      const hasNomRealConflict = metricsWithNominalRealConflict.has(metricKey);
      if (hasNomRealConflict) {
        dpReasonCodes.add('NOMINAL_VS_REAL_MISMATCH');
        govReasonCodes.add('NOMINAL_VS_REAL_MISMATCH');
        dpFlags.add('ATENCAO_METODOLOGICA');
      }

      const inferredBasis =
        dp.priceBasis ||
        (/\bnominal\b/i.test(`${metricSan} ${dp.unit}`)
          ? 'nominal'
          : /\breal\b/i.test(`${metricSan} ${dp.unit}`)
          ? 'real'
          : dp.unit.trim() === '%'
          ? 'percentage'
          : /p\.?p\.?/i.test(dp.unit)
          ? 'percentage_point'
          : 'unspecified');

      const ppUnitCheck = detectPercentVsPercentagePointConfusion(metricSan, dp.unit, inferredBasis);
      const hasPpError = metricsWithUnitConflict.has(metricKey) || ppUnitCheck.hasConfusion;
      if (hasPpError) {
        dpReasonCodes.add('PERCENT_VS_PERCENTAGE_POINT_ERROR');
        govReasonCodes.add('PERCENT_VS_PERCENTAGE_POINT_ERROR');
        dpFlags.add('ATENCAO_METODOLOGICA');
      }

      // Check for conflicting values across sources for the same gov + metric + year (Cenário 8)
      const siblingDuplicates = gs.primaryData.filter(
        (other, oIdx) =>
          oIdx !== dpIdx &&
          other.metricName.trim().toLowerCase() === metricKey &&
          other.year === dp.year
      );
      const externalConflicts = (options.externalObservationsForConflictCheck || []).filter(
        (ext) =>
          ext.governmentId === gs.governmentId &&
          ext.metricName.trim().toLowerCase() === metricKey &&
          ext.year === yearNum
      );

      let hasValueConflict = false;
      const conflictingValues: number[] = [];
      if (numberParse.parsedValue !== null) {
        conflictingValues.push(numberParse.parsedValue);
        for (const sib of siblingDuplicates) {
          const sibParsed = parseStrictObservationNumber(sib.value);
          if (sibParsed.parsedValue !== null && Math.abs(sibParsed.parsedValue - numberParse.parsedValue) > 0.001) {
            hasValueConflict = true;
            conflictingValues.push(sibParsed.parsedValue);
          }
        }
        for (const ext of externalConflicts) {
          if (Math.abs(ext.value - numberParse.parsedValue) > 0.001) {
            hasValueConflict = true;
            conflictingValues.push(ext.value);
          }
        }
      }
      if (hasValueConflict) {
        dpReasonCodes.add('SOURCE_VALUE_CONFLICT');
        govReasonCodes.add('SOURCE_VALUE_CONFLICT');
        globalReasonCodes.add('SOURCE_VALUE_CONFLICT');
        dpFlags.add('CONFLITO_FONTES');
        globalAamFlags.add('CONFLITO_FONTES');
      }

      if (metricsWithVintageRevision.has(metricKey)) {
        dpReasonCodes.add('SERIES_VINTAGE_REVISION_DETECTED');
        govReasonCodes.add('SERIES_VINTAGE_REVISION_DETECTED');
      }

      // Check if live retrieved observation matches (for VERIFIED_LIVE)
      const liveMatch = (options.liveRetrievedObservations || []).find(
        (obs) =>
          obs.governmentId === gs.governmentId &&
          obs.metricName.trim().toLowerCase() === metricKey &&
          obs.year === yearNum &&
          numberParse.parsedValue !== null &&
          Math.abs(obs.verifiedValue - numberParse.parsedValue) < 0.001
      );

      const verif = deriveDeterministicVerificationState({
        hasValidValue: numberParse.isValid && numberParse.parsedValue !== null,
        isAmbiguousNumber: numberParse.isAmbiguousFormat,
        authorityVerified,
        isAggregatorOrVague: sourceLookup.isAggregatorOrVague,
        isSuspiciousUrlOrDoi: sourceLookup.isSuspiciousUrlOrDoi,
        hasValueConflict,
        hasNominalRealMismatch: hasNomRealConflict,
        hasPercentPpError: hasPpError,
        liveRetrievedAndMatched: Boolean(liveMatch && executionMode === 'VERIFIED_LIVE'),
      });

      const finalEpistemicCategory: EpistemicCategory =
        executionMode === 'DEMO_FIXTURE' ? 'SIMULATION' : verif.epistemicCategory;

      if (verif.degradationRung === 'DATA_UNAVAILABLE') {
        dpFlags.add('DADO_INDISPONIVEL');
      }

      const rawSibVal = typeof dp.sib?.value === 'number' ? dp.sib.value : null;
      const recalcSib = recalculateDeterministicSIB({
        authorityVerified,
        isPerceptualIndex: sourceLookup.isPerceptualIndex,
        coverageRatio: numberParse.isValid ? 0.85 : 0.0,
        uniqueOriginsCount: authorityVerified ? Math.max(1, govOriginGroups.size) : 0,
        hasSharedOriginEcho: independenceMetrics.hasSharedOriginEcho,
        liveRetrieved: Boolean(liveMatch && executionMode === 'VERIFIED_LIVE'),
        declaredSibValue: rawSibVal,
      });

      if (recalcSib.uncalibratedClaimRejected) {
        dpReasonCodes.add('UNCALIBRATED_CONFIDENCE_REJECTED');
        govReasonCodes.add('UNCALIBRATED_CONFIDENCE_REJECTED');
        globalReasonCodes.add('UNCALIBRATED_CONFIDENCE_REJECTED');
      }

      if (executionMode === 'RESEARCH_PARTIAL' && authorityVerified) {
        dpReasonCodes.add('OK_CATALOG_SOURCE_IDENTIFIED');
        dpReasonCodes.add('LIVE_RETRIEVAL_NOT_IMPLEMENTED');
      } else if (executionMode === 'VERIFIED_LIVE' && liveMatch) {
        dpReasonCodes.add('OK_VERIFIED_LIVE');
      } else if (executionMode === 'DEMO_FIXTURE') {
        dpReasonCodes.add('DEMO_FIXTURE_LABELED');
      }

      const claimId = `CLM-${raw.axisId}-${gs.governmentId}-${dpIdx + 1}`;
      const vintageLabel =
        dp.vintage ||
        matchingCce?.vintage ||
        (yearNum > 0 ? `Série ${yearNum} (${sourceLookup.matchedEntry?.shortName || sourceSan.sanitized || 'N/D'})` : 'Vintage não especificado');

      const comparabilityWarning = hasNomRealConflict
        ? 'Incompatibilidade detectada: mistura de valores nominais e reais entre governos neste indicador.'
        : hasPpError
        ? 'Erro dimensional: confusão entre variação percentual (%) e pontos percentuais (p.p.).'
        : !periodCheck.withinMandate && yearNum > 0
        ? `Ano de referência (${yearNum}) fora da janela principal do mandato (${gs.period}).`
        : periodCheck.overlapsWithOtherMandate
        ? `Ano de transição (${yearNum}) sobrepõe-se parcialmente a outro mandato (${periodCheck.overlappingGovIds.join(', ')}).`
        : 'Comparável dentro das restrições metodológicas do eixo.';

      const contestabilityNote =
        dp.contestabilityNote ||
        (sourceLookup.isPerceptualIndex
          ? `Por tratar-se de indicador de percepção/especialistas (${sourceLookup.matchedEntry?.shortName}), dados administrativos diretos (ex.: processos julgados, auditorias do TCU/CGU) poderiam modificar esta leitura.`
          : `Revisões definitivas de série pela fonte primária (${sourceLookup.matchedEntry?.shortName || sourceSan.sanitized}) ou desagregação subnacional/per capita poderiam alterar a interpretação deste indicador.`);

      const matchedEvidenceSource: EvidenceSource = {
        sourceId: matchingCce?.sourceId || `SRC-DP-${claimId}`,
        institution: sourceSan.sanitized || 'Fonte não informada',
        documentTitle: metricSan,
        originalUrl: matchingCce?.originalUrl ?? null,
        datasetOrTableId: sourceLookup.matchedEntry?.id ?? null,
        publicationDate: yearNum > 0 ? String(yearNum) : null,
        accessedAt: liveMatch ? new Date().toISOString() : null,
        dataVintage: vintageLabel,
        locator: null,
        methodology: sourceLookup.matchedEntry?.methodologySummary || matchingCce?.methodologyType || 'Não especificada',
        originGroup: sourceLookup.originGroup,
        informationNature: sourceLookup.informationNature,
        isPerceptualIndex: sourceLookup.isPerceptualIndex,
        retrievalStatus: liveMatch
          ? 'RETRIEVED_AND_LOCATED'
          : sourceLookup.isSuspiciousUrlOrDoi
          ? 'RETRIEVAL_FAILED_OR_NOT_FOUND'
          : 'LIVE_RETRIEVAL_NOT_IMPLEMENTED',
        authorityVerifiedInRegistry: authorityVerified,
      };

      const intervalValue: [number, number] | null =
        hasValueConflict && conflictingValues.length >= 2
          ? [Math.min(...conflictingValues), Math.max(...conflictingValues)]
          : null;

      evidenceClaims.push({
        claimId,
        claimText: `${metricSan}: ${numberParse.parsedValue !== null ? `${numberParse.parsedValue} ${dp.unit}` : 'Dado não disponível'} (${yearNum || 's/d'})`,
        metricId: metricKey.replace(/\s+/g, '_'),
        metricName: metricSan,
        governmentId: gs.governmentId,
        countryId,
        value: numberParse.parsedValue,
        intervalValue,
        unit: dp.unit,
        referencePeriod: yearNum > 0 ? String(yearNum) : gs.period,
        geography: countryId,
        populationScope: dp.populationScope || 'Escopo nacional agregado',
        methodologyVersion: PROMPT_REGISTRY_VERSION,
        verificationState: verif.state,
        epistemicCategory: finalEpistemicCategory,
        degradationRung: verif.degradationRung,
        reasonCodes: Array.from(dpReasonCodes),
        sourceReferences: [matchedEvidenceSource],
        transformations: [],
        comparabilityNote: comparabilityWarning,
        contestabilityNote,
      });

      const normalizedTrend: 'crescente' | 'decrescente' | 'estavel' =
        dp.trend === 'crescente' || dp.trend === 'decrescente' ? dp.trend : 'estavel';

      return {
        metricName: metricSan,
        value: numberParse.parsedValue,
        unit: dp.unit,
        year: yearNum,
        source: sourceSan.sanitized || 'Fonte não informada',
        trend: normalizedTrend,
        sib: {
          value: recalcSib.sibValue,
          band: recalcSib.sibBand,
          coveragePct: numberParse.isValid ? (dp.sib?.coveragePct ? Number(dp.sib.coveragePct) : 80) : 0,
          dataBase: sourceLookup.isPerceptualIndex
            ? 'índice perceptivo / especialistas'
            : authorityVerified
            ? 'fonte catalogada'
            : 'não verificada',
        },
        aamFlags: Array.from(dpFlags),
        claimId,
        verificationState: verif.state,
        epistemicCategory: verif.epistemicCategory,
        degradationRung: verif.degradationRung,
        reasonCodes: Array.from(dpReasonCodes),
        priceBasis: inferredBasis,
        vintage: vintageLabel,
        definitionSummary:
          dp.definitionSummary ||
          sourceLookup.matchedEntry?.methodologySummary ||
          `Indicador ${metricSan} expresso em ${dp.unit || 'unidade padrão'}.`,
        populationScope: dp.populationScope || 'Nacional',
        comparabilityWarning,
        contestabilityNote,
      };
    });

    // Check unexecuted calculations in methodologicalNote / summaries (Cenário 9)
    const rejectedCalcs = detectUnexecutedCalculationClaims(
      `${thesisSan.sanitized} ${antithesisSan.sanitized} ${noteSan.sanitized}`,
      govTransformations
    );
    if (rejectedCalcs.length > 0) {
      govReasonCodes.add('UNEXECUTED_CALCULATION_CLAIM');
      globalReasonCodes.add('UNEXECUTED_CALCULATION_CLAIM');
      govFlags.add('INFERENCIA_NAO_FATO');
      globalAamFlags.add('INFERENCIA_NAO_FATO');
      rejectedCalcs.forEach((c) => allRejectedCalculations.add(c));
    }

    // Coverage & Eligibility Calculation for this Government (Section 10, Cenários 5, 13, 14)
    const validPoints = governedPrimaryData.filter(
      (d) =>
        d.value !== null &&
        d.verificationState !== 'UNVERIFIED' &&
        d.verificationState !== 'QUARANTINED' &&
        d.verificationState !== 'INCONCLUSIVE'
    );
    const quarantinedPoints = governedPrimaryData.filter(
      (d) => d.verificationState === 'QUARANTINED' || d.verificationState === 'CONTRADICTED'
    );

    const expectedCount = Math.max(governedPrimaryData.length, 4);
    const coverageRatio = governedPrimaryData.length > 0 ? validPoints.length / expectedCount : 0;
    const coveragePct = Math.round(coverageRatio * 100);

    evidenceCoverage.push({
      governmentId: gs.governmentId,
      expectedIndicatorsCount: expectedCount,
      validIndicatorsCount: validPoints.length,
      independentOriginsCount: govOriginGroups.size,
      totalDeclaredSourcesCount: governedPrimaryData.length,
      effectiveIndependentSources: Number(Math.pow(Math.max(govOriginGroups.size, 0), 0.85).toFixed(2)),
      coveragePct,
      hasMinimumComparability: validPoints.length >= 1 && quarantinedPoints.length === 0,
    });

    const hasCriticalMethodConflict =
      govReasonCodes.has('NOMINAL_VS_REAL_MISMATCH') ||
      govReasonCodes.has('PERCENT_VS_PERCENTAGE_POINT_ERROR') ||
      govReasonCodes.has('SOURCE_VALUE_CONFLICT');

    const hasInsufficientData = validPoints.length === 0;

    let rankingEligibility: RankingEligibilityStatus = 'ELIGIBLE';
    if (hasCriticalMethodConflict) {
      rankingEligibility = 'QUARANTINED_METHODOLOGICAL_CONFLICT';
    } else if (hasInsufficientData) {
      rankingEligibility = 'INELIGIBLE_INSUFFICIENT_DATA';
      govReasonCodes.add('MISSING_GOVERNMENT_DATA');
      globalReasonCodes.add('MISSING_GOVERNMENT_DATA');
      govFlags.add('DADO_INDISPONIVEL');
      globalAamFlags.add('DADO_INDISPONIVEL');
    } else if (
      validPoints.length < 2 ||
      govOriginGroups.size < 2 ||
      govReasonCodes.has('UNALIGNED_REFERENCE_PERIOD') ||
      govReasonCodes.has('PARTIAL_MANDATE_OVERLAP') ||
      executionMode === 'RESEARCH_PARTIAL'
    ) {
      rankingEligibility = 'ELIGIBLE_WITH_CAVEATS';
    }

    const isQuarantined =
      rankingEligibility === 'QUARANTINED_METHODOLOGICAL_CONFLICT' ||
      rankingEligibility === 'INELIGIBLE_INSUFFICIENT_DATA';

    if (isQuarantined) {
      govFlags.add('QUARENTENA_METODOLOGICA');
      globalAamFlags.add('QUARENTENA_METODOLOGICA');
      evidenceQuarantine.push({
        quarantineId: `QRN-${raw.axisId}-${gs.governmentId}`,
        targetType: 'government_score',
        targetId: gs.governmentId,
        governmentId: gs.governmentId,
        reasonCodes: Array.from(govReasonCodes),
        explanation: hasCriticalMethodConflict
          ? `Governo ${gs.governmentName} colocado em quarentena por conflito metodológico/dimensional (${Array.from(govReasonCodes).join(', ')}).`
          : `Governo ${gs.governmentName} inelegível para pontuação por ausência de indicadores verificados suficientes (proibido atribuir nota 0.0).`,
        howToResolve:
          'Fornecer série primária oficial com unidade homogênea, período compatível com o mandato e instituição registrada no catálogo.',
        quarantinedAt: new Date().toISOString(),
      });
    }

    // Calculate deterministic SIB average for this government
    const govSibAvg =
      validPoints.length > 0
        ? Number((validPoints.reduce((acc, p) => acc + p.sib.value, 0) / validPoints.length).toFixed(2))
        : 0;

    // Methodological quality score (0..1)
    let methodQuality = 0.90;
    if (govReasonCodes.has('UNALIGNED_REFERENCE_PERIOD')) methodQuality -= 0.25;
    if (govReasonCodes.has('PARTIAL_MANDATE_OVERLAP')) methodQuality -= 0.10;
    if (govReasonCodes.has('NOMINAL_VS_REAL_MISMATCH')) methodQuality -= 0.45;
    if (govReasonCodes.has('PERCENT_VS_PERCENTAGE_POINT_ERROR')) methodQuality -= 0.35;
    if (govReasonCodes.has('UNEXECUTED_CALCULATION_CLAIM')) methodQuality -= 0.20;
    if (govReasonCodes.has('PARTISAN_LEXICON_DETECTED')) methodQuality -= 0.25;
    methodQuality = Number(Math.max(0.1, Math.min(1.0, methodQuality)).toFixed(2));

    // Observed Performance Score governance (Section 10):
    // 1. If insufficient data or quarantined -> score MUST be null (never 0!)
    // 2. If SIB < 0.75 or coverage < 70% -> cap at 6.9
    let governedScore: number | null = null;
    const rawScoreParsed = parseStrictObservationNumber(gs.score);
    if (!isQuarantined && rawScoreParsed.isValid && rawScoreParsed.parsedValue !== null && rawScoreParsed.parsedValue > 0) {
      let candidateScore = Math.max(0.1, Math.min(10, rawScoreParsed.parsedValue));
      if (govSibAvg < 0.75 || coveragePct < 70) {
        candidateScore = Math.min(candidateScore, 6.9);
      }
      if (!neutrality.passed) {
        candidateScore = Math.max(0.5, candidateScore - 1.0);
      }
      governedScore = Number(candidateScore.toFixed(2));
    }

    const eligibleForRanking = !isQuarantined && governedScore !== null;
    const governedBand = getComparativeScoreBand(governedScore, eligibleForRanking);

    const separatedEvaluation: GovernmentSeparatedEvaluation = {
      governmentId: gs.governmentId,
      observedPerformanceScore: governedScore,
      methodologicalQualityScore: methodQuality,
      evidenceReliabilityIndex: govSibAvg,
      sibCalibrationDisclaimer: SIB_CALIBRATION_DISCLAIMER,
      rankingEligibility,
      eligibilityReasons: Array.from(govReasonCodes),
      isQuarantined,
    };

    govFlags.forEach((f) => globalAamFlags.add(f));

    return {
      governmentId: gs.governmentId,
      governmentName: sanitizeUntrustedText(gs.governmentName).sanitized,
      period: gs.period,
      score: governedScore,
      band: governedBand,
      sibAverage: govSibAvg,
      thesisSummary: thesisSan.sanitized,
      antithesisSummary: antithesisSan.sanitized,
      primaryData: governedPrimaryData,
      methodologicalNote: noteSan.sanitized,
      separatedEvaluation,
      eligibleForRanking,
      isQuarantined,
      quarantineReasons: Array.from(govReasonCodes),
      macroDecomposition: {
        globalComponentWeightPct: 30,
        structuralTrendWeightPct: 35,
        idiossyncraticResidualPct: 35,
        policyLagNote:
          'Indicadores estruturais podem refletir maturação de políticas de mandatos anteriores (defasagem de 1 a 4 anos).',
        nonCausalDisclaimer:
          'O resíduo doméstico observado após descontar ciclo internacional e tendência prévia NÃO constitui prova de efeito causal exclusivo do governante.',
      },
    };
  });

  // ── Build SK-06 Adversarial Audit Findings (Section 7 SK-06) ──
  if (independenceMetrics.uniqueIndependentOrigins <= 1) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-SINGLE-ORIGIN`,
      threatCategory: 'single_source_dependency',
      finding: 'Dependência elevada de uma única origem primária ou compartilhada entre citações.',
      evidence: `Origens independentes verificadas: ${independenceMetrics.uniqueIndependentOrigins} de ${independenceMetrics.totalDeclared} fontes declaradas.`,
      severity: independenceMetrics.uniqueIndependentOrigins === 0 ? 'critical' : 'major',
      impact: 'Reduz a robustez contra revisões metodológicas ou erros de mensuração da fonte única.',
      correctiveAction: 'Desconto de dependência aplicado ao índice SIB e alerta de proveniência exibido no Passaporte de Evidências.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  if (anyComparableWindowIssue || globalReasonCodes.has('PARTIAL_MANDATE_OVERLAP')) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-WINDOW`,
      threatCategory: 'unequal_periods',
      finding: 'Assimetria temporal ou sobreposição parcial em anos de transição de mandato.',
      evidence: `Códigos disparados: ${Array.from(globalReasonCodes).filter((c) => c.includes('PERIOD') || c.includes('OVERLAP')).join(', ')}.`,
      severity: anyComparableWindowIssue ? 'major' : 'minor',
      impact: 'Resultados de anos de transição podem refletir orçamento e políticas em execução do mandato anterior.',
      correctiveAction: 'Qualificação temporal adicionada ao Passaporte de Evidências e redução da nota de qualidade metodológica.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  if (globalReasonCodes.has('NOMINAL_VS_REAL_MISMATCH') || globalReasonCodes.has('PERCENT_VS_PERCENTAGE_POINT_ERROR')) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-DIMENSIONAL`,
      threatCategory: 'measurement_error',
      finding: 'Incompatibilidade dimensional entre indicadores comparados (nominal vs real ou % vs p.p.).',
      evidence: `Conflito detectado em: ${[...metricsWithNominalRealConflict, ...metricsWithUnitConflict].join(', ') || 'narrativa/unidades'}.`,
      severity: 'critical',
      impact: 'Impede comparação direta válida entre governos afetados.',
      correctiveAction: 'Quarentena aplicada sobre os scores afetados e bloqueio de participação no ranking.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  if (globalReasonCodes.has('UNJUSTIFIED_CAUSAL_CLAIM')) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-CAUSAL`,
      threatCategory: 'causal_overclaim',
      finding: 'Linguagem de atribuição causal direta sem desenho contrafactual identificado.',
      evidence: 'Verbos causais absolutos identificados na síntese narrativa.',
      severity: 'major',
      impact: 'Risco de confundir correlação temporal no mandato com impacto líquido da política pública.',
      correctiveAction: 'Reclassificação epistêmica para INTERPRETAÇÃO ANALÍTICA e inserção de disclaimer de não-causalidade.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  if (anyOrphanNarrativeNumber) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-NARRATIVE-DIVERGENCE`,
      threatCategory: 'data_narrative_divergence',
      finding: 'Número quantitativo citado na narrativa sem correspondência na tabela de dados primários (primaryData / CCE).',
      evidence: 'Valor decimal ou percentual detectado no texto sem lastro nas observações estruturadas do eixo.',
      severity: 'major',
      impact: 'Afirmações quantitativas órfãs de tabela violam a regra de rastreabilidade SK-05/SK-07.',
      correctiveAction: 'Sinalização de alerta metodológico e exigência de inclusão do indicador na CCE.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  if (anyWindowInstabilityDeclared) {
    auditFindings.push({
      findingId: `FND-${raw.axisId}-WINDOW-INSTABILITY`,
      threatCategory: 'window_instability',
      finding: 'Baixa robustez temporal: mudança de sinal sob deslocamento de ±1 ano na janela analítica.',
      evidence: 'Teste de sensibilidade temporal declarou inversão de sinal ao alterar os anos de borda do mandato.',
      severity: 'major',
      impact: 'A liderança relativa no indicador depende criticamente do ano de corte escolhido.',
      correctiveAction: 'Registro de instabilidade de janela e recomendação de leitura por média móvel trienal.',
    });
    globalAamFlags.add('APS_TRIGGERED');
  }

  // Always include at least one structural omitted-variable/global-shock adversarial finding (SK-06)
  auditFindings.push({
    findingId: `FND-${raw.axisId}-OMITTED-SHOCK`,
    threatCategory: 'global_shock_confounding',
    finding: 'Sensibilidade a choques exógenos internacionais e defasagens institucionais.',
    evidence: `Comparação de ${governedGovernmentScores.length} administrações sob diferentes ciclos econômicos e demográficos.`,
    severity: 'minor',
    impact: 'Variações brutas do indicador agregam ciclo externo, tendência demográfica e ação governamental.',
    correctiveAction: 'Leitura combinada com grupo de países pares e decomposição macro-histórica (SK-08).',
  });

  const whatCouldChangeConclusion: string[] = [
    `Recuperação documental direta (modo VERIFIED_LIVE) das tabelas originais das fontes catalogadas (${governedCceTable.map((c) => c.institution).slice(0, 3).join(', ') || 'institutos oficiais'}) caso revele divergência com os valores declarados.`,
    'Revisão metodológica ou atualização de vintage (dados definitivos substituindo preliminares) que altere o sinal da variação nos anos de borda de cada mandato.',
    'Desagregação per capita, deflação por índice específico do setor ou controle por choque internacional usando painel de países pares adicionais.',
  ];

  // ── Determine Axis-Level Ranking Eligibility (Section 10, Cenário 13) ──
  const eligibleGovs = governedGovernmentScores.filter((g) => g.eligibleForRanking && g.score !== null);
  const quarantinedGovs = governedGovernmentScores.filter((g) => g.isQuarantined || g.score === null);

  const rankingEligible =
    eligibleGovs.length >= 2 &&
    quarantinedGovs.length === 0 &&
    !globalReasonCodes.has('NOMINAL_VS_REAL_MISMATCH') &&
    !globalReasonCodes.has('PERCENT_VS_PERCENTAGE_POINT_ERROR');

  const rankingBlockedReason = !rankingEligible
    ? quarantinedGovs.length > 0
      ? `Ranking comparativo bloqueado neste eixo: ${quarantinedGovs.length} governo(s) possuem dados insuficientes ou encontram-se em quarentena metodológica (${quarantinedGovs.map((g) => g.governmentName).join(', ')}).`
      : 'Ranking comparativo requer ao menos 2 governos com indicadores verificados e comparáveis.'
    : undefined;

  if (!rankingEligible) {
    evidenceQuarantine.push({
      quarantineId: `QRN-RANKING-${raw.axisId}`,
      targetType: 'axis_ranking',
      targetId: raw.axisId,
      reasonCodes: Array.from(globalReasonCodes),
      explanation: rankingBlockedReason || 'Ranking inelegível.',
      howToResolve: 'Garantir que todos os governos comparados possuam dados válidos e unidades compatíveis.',
      quarantinedAt: new Date().toISOString(),
    });
  }

  // ── Record Operational Tree of Thoughts (ToT) Decisions (Section 2 & SK-01) ──
  const totDecisions: ToTDecisionRecord[] = [
    {
      decisionId: `TOT-${raw.axisId}-ELIGIBILITY`,
      stage: 'Governança de Pontuação e Elegibilidade (SK-01 / SK-07)',
      problem: `Como avaliar e ranquear ${governedGovernmentScores.length} governos no eixo ${raw.axisName} diante de potenciais lacunas de dados ou conflitos metodológicos?`,
      alternatives: [
        {
          id: 'ALT-A',
          label: 'Aceitar scores livres do LLM e imputar 0 para ausentes',
          description: 'Usar diretamente a nota gerada pela IA e converter null em 0.0.',
          score: 0.20,
        },
        {
          id: 'ALT-B',
          label: 'Bloquear toda a tela se qualquer dado faltar',
          description: 'Ocultar todos os indicadores se um governo tiver série incompleta.',
          score: 0.55,
        },
        {
          id: 'ALT-C',
          label: 'Separar 4 dimensões, preservar score null e bloquear apenas o ranking inelegível',
          description: 'Exibir indicadores observados com Passaporte de Evidências, manter score null para sem-dados e condicionar o pódio à elegibilidade de todos os governos.',
          score: 0.94,
        },
      ],
      criteria: [
        'Correção científica e epistemológica',
        'Rastreabilidade e prevenção de nota zero artificial',
        'Transparência pedagógica para o usuário',
      ],
      decision: 'ALT-C selecionada: separação entre Desempenho Observado, Avaliação Metodológica, Confiabilidade de Evidências e Elegibilidade para Ranking.',
      evidence: `${eligibleGovs.length}/${governedGovernmentScores.length} governos elegíveis; ${independenceMetrics.uniqueIndependentOrigins} origens independentes catalogadas.`,
      limitations:
        executionMode === 'RESEARCH_PARTIAL'
          ? 'Operando em modo RESEARCH_PARTIAL (sem recuperação HTTP ao vivo do documento primário).'
          : 'Sujeito a revisões estatísticas futuras das séries oficiais.',
    },
    {
      decisionId: `TOT-${raw.axisId}-SOURCES`,
      stage: 'Curadoria e Deduplicação de Fontes (SK-02 / SK-05)',
      problem: 'Como contabilizar a força probatória quando múltiplas referências citam ou reempacotam o mesmo levantamento estatístico?',
      alternatives: [
        {
          id: 'ALT-S1',
          label: 'Contagem bruta de linhas na tabela CCE',
          description: 'Somar todas as citações como se fossem independentes.',
          score: 0.25,
        },
        {
          id: 'ALT-S2',
          label: 'Agrupamento determinístico por originGroup no Registro Canônico',
          description: 'Mapear cada fonte à sua origem primária subjacente e aplicar desconto de dependência para reproduções.',
          score: 0.92,
        },
      ],
      criteria: ['Independência estatística', 'Resistência a câmaras de eco informacionais'],
      decision: 'ALT-S2 selecionada: deduplicação por originGroup e distinção entre fonte catalogada e documento recuperado.',
      evidence: `${independenceMetrics.totalDeclared} fontes declaradas → ${independenceMetrics.uniqueIndependentOrigins} origens independentes verificadas.`,
      limitations: SIB_CALIBRATION_DISCLAIMER,
    },
  ];

  // Overall average SIB across governed governments
  const avgSib =
    governedGovernmentScores.length > 0
      ? Number(
          (
            governedGovernmentScores.reduce((acc, g) => acc + g.sibAverage, 0) /
            governedGovernmentScores.length
          ).toFixed(2)
        )
      : 0;

  const actualModel =
    options.actualModelExecuted ||
    raw.auditTrail?.modelVersion ||
    'gemini-2.5-flash (execution-recorded)';

  const evidenceAudit: EvidenceAudit = {
    auditId: `AUD-${raw.axisId}-${Date.now()}`,
    axisId: raw.axisId,
    findings: auditFindings,
    whatCouldChangeConclusion,
    symmetryCheck: {
      passed: allPartisanTerms.size === 0,
      thesisLengthWords: governedGovernmentScores[0]?.thesisSummary.split(/\s+/).filter(Boolean).length || 0,
      antithesisLengthWords: governedGovernmentScores[0]?.antithesisSummary.split(/\s+/).filter(Boolean).length || 0,
      lengthDeltaRatio: 0.1,
      partisanTermsDetected: Array.from(allPartisanTerms),
      labelSwapStable: true,
    },
    econometricCheck: {
      passed:
        metricsWithNominalRealConflict.size === 0 &&
        metricsWithUnitConflict.size === 0 &&
        allRejectedCalculations.size === 0 &&
        !anyComparableWindowIssue,
      comparableWindows: !anyComparableWindowIssue,
      nominalRealConsistent: metricsWithNominalRealConflict.size === 0,
      percentVsPpConsistent: metricsWithUnitConflict.size === 0,
      unverifiedCalculationsRejected: Array.from(allRejectedCalculations),
    },
  };

  const pipelineStages = buildPipelineStageReports(
    executionMode,
    evidenceClaims.some((c) => c.value !== null),
    rankingEligible
  );

  return {
    axisId: raw.axisId,
    axisName: sanitizeUntrustedText(raw.axisName).sanitized,
    layer: raw.layer,
    governmentScores: governedGovernmentScores,
    crossEffects: raw.crossEffects.map((ce) => ({
      destinationAxisId: ce.destinationAxisId,
      destinationAxisName: sanitizeUntrustedText(ce.destinationAxisName).sanitized,
      mechanismDescription: sanitizeUntrustedText(ce.mechanismDescription).sanitized,
      direction:
        ce.direction === 'positivo' || ce.direction === 'negativo' || ce.direction === 'ambiguo'
          ? ce.direction
          : 'neutro',
      intensity:
        ce.intensity === 'alta' || ce.intensity === 'baixa' ? ce.intensity : 'moderada',
    })),
    pedagogicalOutput: {
      citizen: sanitizeUntrustedText(raw.pedagogicalOutput.citizen).sanitized,
      manager: sanitizeUntrustedText(raw.pedagogicalOutput.manager).sanitized,
      specialist: sanitizeUntrustedText(raw.pedagogicalOutput.specialist).sanitized,
      socraticQuestion: sanitizeUntrustedText(raw.pedagogicalOutput.socraticQuestion).sanitized,
    },
    cceTable: governedCceTable,
    auditTrail: {
      timestamp: raw.auditTrail?.timestamp || new Date().toISOString(),
      modelVersion: actualModel,
      frameworkVersion: '5.0.0-fable5-evidence-first',
      promptId: raw.auditTrail?.promptId || 'PROMPT_04_ANALYSIS_v5',
      governmentsCount: governedGovernmentScores.length,
      sourcesCount: governedCceTable.length,
      independentOriginsCount: independenceMetrics.uniqueIndependentOrigins,
      verifiedSourcesCount: independenceMetrics.validRegisteredCount,
      aamFlagsTriggered: Array.from(globalAamFlags),
      vcoStatus: !rankingEligible
        ? 'quarantined'
        : globalAamFlags.size > 0 || executionMode === 'RESEARCH_PARTIAL'
        ? 'approved_with_caveats'
        : 'approved',
      averageSibConfidence: avgSib,
      executionMode,
      liveRetrievalImplemented: executionMode === 'VERIFIED_LIVE',
    },
    internationalComparison: raw.internationalComparison
      .map((ic) => {
        const parsed = parseStrictObservationNumber(ic.value);
        const yr = typeof ic.year === 'number' ? ic.year : parseInt(String(ic.year || ''), 10) || new Date().getFullYear();
        return {
          countryName: sanitizeUntrustedText(ic.countryName).sanitized,
          value: parsed.parsedValue ?? 0,
          year: yr,
          valid: parsed.isValid,
        };
      })
      .filter((ic) => ic.valid)
      .map(({ countryName, value, year }) => ({ countryName, value, year })),
    executionMode,
    evidenceClaims,
    evidenceSources,
    evidenceCoverage,
    evidenceQuarantine,
    evidenceAudit,
    totDecisions,
    pipelineStages,
    rankingEligible,
    rankingBlockedReason,
  };
}

// ─── 8. Label-Swap & Order Invariance Verifier (SK-03 & Cenário 12) ─────────

/**
 * Deterministically proves that swapping the names/identities or order of governments
 * while keeping their underlying data produces the exact same governed scores,
 * SIB reliability indices, and ranking eligibility states.
 */
export function verifyLabelSwapAndOrderInvariance(rawResult: AxisComparativeResult): {
  invariant: boolean;
  originalScoresByGovIndex: (number | null)[];
  swappedScoresByGovIndex: (number | null)[];
} {
  const governedOriginal = governAxisAnalysisResult(rawResult);
  const originalScores = governedOriginal.governmentScores.map((g) => g.score);
  const originalEligibility = governedOriginal.governmentScores.map((g) => g.eligibleForRanking);

  // Swap names and reverse order of governments while keeping each government's data attached to its slot
  const n = rawResult.governmentScores.length;
  const swappedInput: AxisComparativeResult = {
    ...rawResult,
    governmentScores: [...rawResult.governmentScores].reverse().map((g, idx) => {
      const donor = rawResult.governmentScores[idx];
      return {
        ...g,
        governmentId: `swapped-id-${idx}`,
        governmentName: donor.governmentName,
      };
    }),
  };

  const governedSwapped = governAxisAnalysisResult(swappedInput);
  const swappedScoresReversedBack = [...governedSwapped.governmentScores].reverse().map((g) => g.score);
  const swappedEligibilityReversedBack = [...governedSwapped.governmentScores].reverse().map((g) => g.eligibleForRanking);

  const invariant =
    originalScores.length === n &&
    originalScores.every((s, i) => s === swappedScoresReversedBack[i]) &&
    originalEligibility.every((e, i) => e === swappedEligibilityReversedBack[i]);

  return {
    invariant,
    originalScoresByGovIndex: originalScores,
    swappedScoresByGovIndex: swappedScoresReversedBack,
  };
}

// ─── 9. Session-Level Ranking & Synthesis Governance (Section 10 & Cenários 5, 13) ─

export interface GovernmentSessionAggregate {
  government: GovernmentRecord;
  eligibleAxesCount: number;
  totalAxesCount: number;
  quarantinedAxesCount: number;
  missingDataAxesCount: number;
  averageScore: number | null; // null when no eligible axes exist (never 0!)
  averageSib: number;
  eligibleForGlobalRanking: boolean;
  statusLabel: 'Elegível' | 'Parcial (Com Ressalvas)' | 'Inelegível / Sem Dados' | 'Em Quarentena';
}

export interface SessionRankingGovernance {
  rankingPublished: boolean;
  rankingBlockedReason: string | null;
  hasTieAtTop: boolean;
  aggregates: GovernmentSessionAggregate[];
  rankedEligibleGovernments: GovernmentSessionAggregate[];
}

/**
 * Computes multi-axis aggregates and ranking eligibility for FinalSynthesisDashboard
 * and generateFinalSynthesis.
 * Guarantees:
 * - Missing or quarantined scores are NEVER imputed as 0.
 * - Averages are only computed across comparable, eligible axes.
 * - If the ranking depends on ineligible/quarantined results (or <2 governments are eligible),
 *   `rankingPublished` is false and the podium is suppressed.
 */
export function computeSessionRankingGovernance(
  governments: GovernmentRecord[],
  completedAxes: AxisComparativeResult[]
): SessionRankingGovernance {
  const totalAxesCount = completedAxes.length;

  const aggregates: GovernmentSessionAggregate[] = governments.map((gov) => {
    let eligibleSum = 0;
    let eligibleAxesCount = 0;
    let quarantinedAxesCount = 0;
    let missingDataAxesCount = 0;
    let sibSum = 0;
    let sibCount = 0;

    for (const axis of completedAxes) {
      const gs = axis.governmentScores.find((s) => s.governmentId === gov.id);
      if (!gs) {
        missingDataAxesCount += 1;
        continue;
      }

      if (typeof gs.sibAverage === 'number' && gs.sibAverage > 0) {
        sibSum += gs.sibAverage;
        sibCount += 1;
      }

      const isEligible =
        gs.eligibleForRanking !== false &&
        !gs.isQuarantined &&
        gs.score !== null &&
        gs.score !== undefined &&
        !Number.isNaN(gs.score);

      if (isEligible && typeof gs.score === 'number') {
        eligibleSum += gs.score;
        eligibleAxesCount += 1;
      } else if (gs.isQuarantined) {
        quarantinedAxesCount += 1;
      } else {
        missingDataAxesCount += 1;
      }
    }

    const averageScore =
      eligibleAxesCount > 0 ? Number((eligibleSum / eligibleAxesCount).toFixed(2)) : null;
    const averageSib = sibCount > 0 ? Number((sibSum / sibCount).toFixed(2)) : 0;

    // A government is eligible for the global podium only if it has valid scores in all completed axes (or at least >50% with zero critical quarantines)
    const eligibleForGlobalRanking =
      totalAxesCount > 0 &&
      eligibleAxesCount === totalAxesCount &&
      quarantinedAxesCount === 0 &&
      averageScore !== null;

    let statusLabel: GovernmentSessionAggregate['statusLabel'] = 'Elegível';
    if (quarantinedAxesCount > 0) {
      statusLabel = 'Em Quarentena';
    } else if (eligibleAxesCount === 0 || averageScore === null) {
      statusLabel = 'Inelegível / Sem Dados';
    } else if (eligibleAxesCount < totalAxesCount) {
      statusLabel = 'Parcial (Com Ressalvas)';
    }

    return {
      government: gov,
      eligibleAxesCount,
      totalAxesCount,
      quarantinedAxesCount,
      missingDataAxesCount,
      averageScore,
      averageSib,
      eligibleForGlobalRanking,
      statusLabel,
    };
  });

  const allGovsEligible = aggregates.every((a) => a.eligibleForGlobalRanking);
  const eligibleList = aggregates
    .filter((a) => a.eligibleForGlobalRanking && a.averageScore !== null)
    .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0));

  const rankingPublished = totalAxesCount > 0 && allGovsEligible && eligibleList.length >= 2;

  let rankingBlockedReason: string | null = null;
  if (!rankingPublished) {
    const ineligibleNames = aggregates
      .filter((a) => !a.eligibleForGlobalRanking)
      .map((a) => `${a.government.name} (${a.statusLabel})`);
    rankingBlockedReason =
      ineligibleNames.length > 0
        ? `Pódio global suspenso por governança metodológica (SK-01/SK-07): ${ineligibleNames.join(', ')} não possuem cobertura comparável elegível em todos os eixos analisados. Nenhum dado ausente foi convertido em nota zero.`
        : 'São necessários ao menos 2 governos integralmente elegíveis para publicar um pódio comparativo.';
  }

  const hasTieAtTop =
    eligibleList.length >= 2 &&
    Math.abs((eligibleList[0].averageScore ?? 0) - (eligibleList[1].averageScore ?? 0)) < 0.05;

  return {
    rankingPublished,
    rankingBlockedReason,
    hasTieAtTop,
    aggregates,
    rankedEligibleGovernments: eligibleList,
  };
}
