/**
 * ÁGORA FABLE 5.0 — Evidence-First Comparative Intelligence Contracts
 *
 * Principle: Evidence before interpretation. Verification before scoring.
 * Transparency before conclusions.
 */

// ─── 1. Epistemic Categories (Section 5) ────────────────────────────────────
export type EpistemicCategory =
  | 'DOCUMENTED_FACT'            // Fato Documentado: evidência documental consultada e conferida
  | 'VALIDATED_STATISTICAL_DATA' // Dado Estatístico Validado: fonte rastreável, unidade e método compatíveis
  | 'DERIVED_RESULT'             // Resultado Derivado: transformação matemática reproduzível com insumos verificáveis
  | 'ANALYTICAL_INTERPRETATION'  // Interpretação Analítica: conclusão fundamentada sujeita a pressupostos
  | 'HYPOTHESIS'                 // Hipótese: proposição plausível ainda não demonstrada
  | 'SIMULATION'                 // Simulação: cenário ou exercício pedagógico não empírico
  | 'UNVERIFIED'                 // Não Verificado: afirmação ou valor sem evidência suficiente
  | 'CONTRADICTORY';             // Contraditório: evidências incompatíveis exigindo apresentação explícita do conflito

export const EPISTEMIC_CATEGORY_LABELS: Record<EpistemicCategory, { label: string; description: string }> = {
  DOCUMENTED_FACT: {
    label: 'Fato Documentado',
    description: 'Sustentado por evidência documental identificável, efetivamente consultada e com correspondência verificável.',
  },
  VALIDATED_STATISTICAL_DATA: {
    label: 'Dado Estatístico Validado',
    description: 'Valor identificado em fonte rastreável com definição, período, unidade e método compatíveis.',
  },
  DERIVED_RESULT: {
    label: 'Resultado Derivado',
    description: 'Valor obtido por transformação matemática reproduzível com insumos verificáveis e fórmula explícita.',
  },
  ANALYTICAL_INTERPRETATION: {
    label: 'Interpretação Analítica',
    description: 'Conclusão fundamentada nos dados, porém sujeita a pressupostos e escolhas de indicadores.',
  },
  HYPOTHESIS: {
    label: 'Hipótese',
    description: 'Proposição plausível ainda não demonstrada empiricamente.',
  },
  SIMULATION: {
    label: 'Simulação',
    description: 'Cenário ou exercício pedagógico que não constitui constatação empírica.',
  },
  UNVERIFIED: {
    label: 'Não Verificado',
    description: 'Afirmação ou valor sem evidência documental ou estatística suficiente no estado atual.',
  },
  CONTRADICTORY: {
    label: 'Contraditório',
    description: 'Afirmação confrontada com evidência incompatível, exigindo apresentação explícita do conflito.',
  },
};

// ─── 2. Execution Modes (Section 14) ────────────────────────────────────────
export type ExecutionMode =
  | 'VERIFIED_LIVE'     // Recuperação real de fontes + validação factual determinística operacional
  | 'RESEARCH_PARTIAL'  // Parte das informações validada estruturalmente; sem recuperação documental ao vivo completa
  | 'DEMO_FIXTURE';     // Simulações, demonstrações ou testes com dados sintéticos/fixtures

export const EXECUTION_MODE_META: Record<ExecutionMode, {
  label: string;
  shortLabel: string;
  description: string;
  tone: 'high' | 'medium' | 'low';
}> = {
  VERIFIED_LIVE: {
    label: 'Verificação Documental ao Vivo (VERIFIED_LIVE)',
    shortLabel: 'VERIFIED_LIVE',
    description: 'Fontes primárias foram efetivamente recuperadas e as observações numéricas foram conferidas contra os documentos.',
    tone: 'high',
  },
  RESEARCH_PARTIAL: {
    label: 'Pesquisa Parcialmente Verificada (RESEARCH_PARTIAL)',
    shortLabel: 'RESEARCH_PARTIAL',
    description: 'Fontes catalogadas e consistência interna/metodológica validadas deterministicamente, mas sem recuperação HTTP ao vivo do documento original (LIVE_RETRIEVAL_NOT_IMPLEMENTED).',
    tone: 'medium',
  },
  DEMO_FIXTURE: {
    label: 'Demonstração / Dados Sintéticos (DEMO_FIXTURE)',
    shortLabel: 'DEMO_FIXTURE',
    description: 'Resultado originado de fixture de demonstração ou simulação pedagógica. Não deve ser citado como evidência empírica.',
    tone: 'low',
  },
};

// ─── 3. Deterministic Verification States (Section 9) ───────────────────────
export type VerificationState =
  | 'UNVERIFIED'
  | 'SOURCE_IDENTIFIED'
  | 'SOURCE_RETRIEVED'
  | 'CLAIM_LOCATED'
  | 'VALUE_MATCHED'
  | 'FACTUALLY_SUPPORTED'
  | 'CONTRADICTED'
  | 'INCONCLUSIVE'
  | 'QUARANTINED';

export const VERIFICATION_STATE_LABELS: Record<VerificationState, { label: string; badgeTone: 'high' | 'medium' | 'low' | 'neutral' }> = {
  UNVERIFIED:          { label: 'Não Verificado', badgeTone: 'neutral' },
  SOURCE_IDENTIFIED:   { label: 'Fonte Identificada (Catálogo)', badgeTone: 'medium' },
  SOURCE_RETRIEVED:    { label: 'Fonte Consultada', badgeTone: 'medium' },
  CLAIM_LOCATED:       { label: 'Série Localizada', badgeTone: 'medium' },
  VALUE_MATCHED:       { label: 'Valor Conferido', badgeTone: 'high' },
  FACTUALLY_SUPPORTED: { label: 'Suportado Factualmente', badgeTone: 'high' },
  CONTRADICTED:        { label: 'Contradito por Evidência', badgeTone: 'low' },
  INCONCLUSIVE:        { label: 'Inconclusivo', badgeTone: 'neutral' },
  QUARANTINED:         { label: 'Em Quarentena', badgeTone: 'low' },
};

// ─── 4. Source Retrieval & Nature (Section 7 SK-02, SK-05, Section 8) ───────
export type SourceRetrievalStatus =
  | 'LIVE_RETRIEVAL_NOT_IMPLEMENTED'
  | 'SOURCE_DECLARED_NOT_RETRIEVED'
  | 'RETRIEVED_AND_LOCATED'
  | 'RETRIEVAL_FAILED_OR_NOT_FOUND';

export type SourceInformationNature =
  | 'PRIMARY_OFFICIAL_DATASET'
  | 'ADMINISTRATIVE_RECORD'
  | 'INTERNATIONAL_HARMONIZED'
  | 'PERCEPTUAL_EXPERT_INDEX'
  | 'SECONDARY_REPRODUCTION'
  | 'INTERPRETIVE_COMMENTARY'
  | 'UNREGISTERED_SOURCE';

export type DegradationRung =
  | 'VALIDATED_VALUE'            // Degrau 1: valor validado
  | 'JUSTIFIED_INTERVAL'         // Degrau 2: intervalo justificado
  | 'SUPPORTED_QUALITATIVE_TREND'// Degrau 3: descrição qualitativa sustentada
  | 'DATA_UNAVAILABLE';          // Degrau 4: dado não disponível

export type ReasonCode =
  | 'OK_VERIFIED_LIVE'
  | 'OK_CATALOG_SOURCE_IDENTIFIED'
  | 'LIVE_RETRIEVAL_NOT_IMPLEMENTED'
  | 'UNREGISTERED_INSTITUTION'
  | 'INVENTED_OR_INVALID_DOI_URL'
  | 'AGGREGATOR_OR_WIKI_REJECTED'
  | 'SHARED_ORIGIN_DISCOUNT_APPLIED'
  | 'UNALIGNED_REFERENCE_PERIOD'
  | 'MISSING_GOVERNMENT_DATA'
  | 'NOMINAL_VS_REAL_MISMATCH'
  | 'PERCENT_VS_PERCENTAGE_POINT_ERROR'
  | 'SOURCE_VALUE_CONFLICT'
  | 'UNEXECUTED_CALCULATION_CLAIM'
  | 'UNCALIBRATED_CONFIDENCE_REJECTED'
  | 'PROMPT_INJECTION_STRIPPED'
  | 'PARTISAN_LEXICON_DETECTED'
  | 'ASYMMETRIC_THESIS_ANTITHESIS'
  | 'SELF_DECLARED_VERIFIED_OVERRIDDEN'
  | 'DEMO_FIXTURE_LABELED'
  | 'SERIES_VINTAGE_REVISION_DETECTED'
  | 'PARTIAL_MANDATE_OVERLAP'
  | 'AMBIGUOUS_NUMBER_FORMAT'
  | 'UNJUSTIFIED_CAUSAL_CLAIM'
  | 'PERCEPTUAL_INDEX_CAVEAT'
  | 'SERIES_METHODOLOGICAL_BREAK';

// ─── 5. Core Evidence Contracts (Section 7 SK-05 & Section 9) ───────────────
export interface EvidenceSource {
  sourceId: string;
  institution: string;
  documentTitle: string;
  originalUrl: string | null;
  datasetOrTableId: string | null;
  publicationDate: string | null;
  accessedAt: string | null;
  dataVintage: string;
  locator: string | null;
  methodology: string;
  originGroup: string; // Identificador da fonte primária subjacente para deduplicação de eco
  informationNature: SourceInformationNature;
  isPerceptualIndex: boolean;
  retrievalStatus: SourceRetrievalStatus;
  authorityVerifiedInRegistry: boolean;
}

export interface EvidenceObservation {
  observationId: string;
  sourceId: string;
  metricId: string;
  metricName: string;
  governmentId: string;
  countryId: string;
  rawValue: number | string | null;
  parsedNumericValue: number | null;
  isAmbiguousFormat: boolean;
  unit: string;
  priceBasis: 'real' | 'nominal' | 'index' | 'rate' | 'percentage' | 'percentage_point' | 'unspecified';
  deflatorOrBaseYear?: string | null;
  referencePeriod: string;
  year: number | null;
  vintage: string;
  isPreliminary: boolean;
  hasSeriesBreak: boolean;
}

export interface EvidenceTransformation {
  transformationId: string;
  type: 'delta_pct' | 'delta_pp' | 'cagr' | 'moving_average_3y' | 'per_capita' | 'real_deflation' | 'synthetic_control' | 'bootstrap_ci';
  formulaDisplay: string;
  inputs: { label: string; value: number; year?: number; unit?: string }[];
  declaredOutput: number | null;
  recomputedOutput: number | null;
  computationVerified: boolean;
  discrepancyNote?: string;
}

export interface EvidenceVerification {
  state: VerificationState;
  epistemicCategory: EpistemicCategory;
  degradationRung: DegradationRung;
  sourceIdentified: boolean;
  sourceRetrieved: boolean;
  claimLocated: boolean;
  valueMatched: boolean;
  unitAndPeriodCompatible: boolean;
  transformationsVerified: boolean;
  reasonCodes: ReasonCode[];
  verifiedAt: string;
}

export interface EvidenceClaim {
  claimId: string;
  claimText: string;
  metricId: string;
  metricName: string;
  governmentId: string;
  countryId: string;
  value: number | null;
  intervalValue?: [number, number] | null;
  qualitativeTrend?: 'crescente' | 'decrescente' | 'estavel' | 'indisponivel';
  unit: string;
  referencePeriod: string;
  geography: string;
  populationScope: string;
  methodologyVersion: string;
  verificationState: VerificationState;
  epistemicCategory: EpistemicCategory;
  degradationRung: DegradationRung;
  reasonCodes: ReasonCode[];
  sourceReferences: EvidenceSource[];
  transformations: EvidenceTransformation[];
  comparabilityNote: string;
  contestabilityNote: string; // O que poderia mudar esta interpretação
}

export interface EvidenceCoverage {
  governmentId: string;
  expectedIndicatorsCount: number;
  validIndicatorsCount: number;
  independentOriginsCount: number;
  totalDeclaredSourcesCount: number;
  effectiveIndependentSources: number; // Com desconto de dependência (n^0.7 quando origem compartilhada)
  coveragePct: number;
  hasMinimumComparability: boolean;
}

export interface EvidenceQuarantine {
  quarantineId: string;
  targetType: 'claim' | 'government_score' | 'axis_ranking' | 'synthesis';
  targetId: string;
  governmentId?: string;
  reasonCodes: ReasonCode[];
  explanation: string;
  howToResolve: string;
  quarantinedAt: string;
}

export interface EvidenceAuditFinding {
  findingId: string;
  threatCategory:
    | 'omitted_variable'
    | 'reverse_causality'
    | 'measurement_error'
    | 'unequal_periods'
    | 'indicator_selection_bias'
    | 'arbitrary_weights'
    | 'global_shock_confounding'
    | 'window_instability'
    | 'single_source_dependency'
    | 'data_narrative_divergence'
    | 'causal_overclaim';
  finding: string;
  evidence: string;
  severity: 'critical' | 'major' | 'minor';
  impact: string;
  correctiveAction: string;
}

export interface EvidenceAudit {
  auditId: string;
  axisId: string;
  findings: EvidenceAuditFinding[];
  whatCouldChangeConclusion: string[];
  symmetryCheck: {
    passed: boolean;
    thesisLengthWords: number;
    antithesisLengthWords: number;
    lengthDeltaRatio: number;
    partisanTermsDetected: string[];
    labelSwapStable: boolean;
  };
  econometricCheck: {
    passed: boolean;
    comparableWindows: boolean;
    nominalRealConsistent: boolean;
    percentVsPpConsistent: boolean;
    unverifiedCalculationsRejected: string[];
  };
}

// ─── 6. Separated Score & Eligibility Dimensions (Section 10) ───────────────
export type RankingEligibilityStatus =
  | 'ELIGIBLE'
  | 'ELIGIBLE_WITH_CAVEATS'
  | 'INELIGIBLE_INSUFFICIENT_DATA'
  | 'QUARANTINED_METHODOLOGICAL_CONFLICT';

export interface GovernmentSeparatedEvaluation {
  governmentId: string;
  /** 1. Desempenho Observado: calculado apenas sobre indicadores comparáveis (null se sem dados) */
  observedPerformanceScore: number | null;
  /** 2. Avaliação Metodológica (0–1): consistência de janelas, unidades e transformações */
  methodologicalQualityScore: number;
  /** 3. Confiabilidade das Evidências (0–1): índice metodológico de proveniência (não é probabilidade empírica de verdade) */
  evidenceReliabilityIndex: number;
  /** Nota explícita de que os pesos do SIB são escolhas metodológicas do produto */
  sibCalibrationDisclaimer: string;
  /** 4. Elegibilidade para Ranking: decisão determinística */
  rankingEligibility: RankingEligibilityStatus;
  eligibilityReasons: ReasonCode[];
  isQuarantined: boolean;
}

// ─── 7. Tree of Thoughts Operational Decision Record (Section 2 & SK-01) ────
export interface ToTDecisionRecord {
  decisionId: string;
  stage: string;
  problem: string;
  alternatives: { id: string; label: string; description: string; score: number }[];
  criteria: string[];
  decision: string;
  evidence: string;
  limitations: string;
}

// ─── 8. Canonical 13-Stage Pipeline Status (Section 6) ──────────────────────
export type PipelineStageOperationalState =
  | 'OPERATIONAL'
  | 'PARTIAL'
  | 'DEMO_FIXTURE'
  | 'LIVE_RETRIEVAL_NOT_IMPLEMENTED';

export interface PipelineStageReport {
  stepNumber: number;
  stageId: string;
  stageName: string;
  status: PipelineStageOperationalState;
  detail: string;
}
