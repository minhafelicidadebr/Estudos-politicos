/** AEGIS World — Core Type Contracts */

// === Country & Capital ===
export type CountryId = string; // ISO 3166-1 alpha-2
export type RegimeType = 'presidential' | 'parliamentary' | 'semi-presidential' | 'monarchy' | 'hybrid' | 'other';
export type TerritoryStructure = 'federal' | 'unitary' | 'confederate' | 'hybrid';
export type StatisticalMaturity = 'high' | 'medium' | 'low' | 'limited';
export type GovernanceType = 'municipal' | 'special_district' | 'federal_district' | 'regional';
export type OutlierStatus = 'positive' | 'negative' | 'representative' | 'insufficient_data';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'inconclusive';
export type AxisLayer = 'A' | 'B' | 'C';

export interface DataSource {
  institution: string;
  abbreviation: string;
  url?: string;
  date?: string;
  data_type: string;
  confidence: number;
  validated: boolean;
}

export interface CapitalProfile {
  name: string;
  lat: number;
  lng: number;
  governance_type: GovernanceType;
  demographic_share: number;
  gdp_share: number;
  outlier_status: OutlierStatus;
  data_sources: DataSource[];
}

export interface CountryProfile {
  id: CountryId;
  name_official: string;
  name_display_pt: string;
  flag_emoji: string;
  capital: CapitalProfile;
  regime: RegimeType;
  territory_structure: TerritoryStructure;
  statistical_maturity: StatisticalMaturity;
  continent: 'África' | 'Américas' | 'Ásia' | 'Europa' | 'Oceania';
  active_axes_A: AxisDefinition[];
  active_axes_B: AxisDefinition[];
  active_axes_C: AxisDefinition[];
}

export interface AxisDefinition {
  id: string;
  name: string;
  layer: AxisLayer;
  icon_name: string;
  description: string;
  color: string;
}

// === Analysis ===
export interface AxisAnalysis {
  axis_id: string;
  axis_name: string;
  layer: AxisLayer;
  score: number;
  confidence: number;
  coverage: number;
  summary: string;
  thesis: string;
  antithesis: string;
  judgment: string;
  context: string;
  distribution: string;
  methodology_note: string;
  sources: DataSource[];
  warnings: WarningType[];
}

export type WarningType =
  | 'INFERÊNCIA'
  | 'CONFLITO_FONTES'
  | 'QUEBRA_SERIE'
  | 'DADO_PRELIMINAR'
  | 'COBERTURA_LIMITADA'
  | 'CONFIANCA_BAIXA'
  | 'ATENCAO_METODOLOGICA';

export interface CrossEffect {
  from_axis: string;
  to_axis: string;
  description: string;
  strength: 'strong' | 'moderate' | 'weak';
}

export interface VCOResult {
  passed: boolean;
  severity?: 'critical' | 'major' | 'minor';
  issues: string[];
  model: string;
  checked_at: string;
}

export interface HallucinationFlag {
  type: string;
  description: string;
  affected_claim: string;
  action_taken: string;
}

export interface AuditTrail {
  prompt_id: string;
  prompt_version: string;
  model: string;
  model_version: string;
  sources_consulted: DataSource[];
  generated_at: string;
  confidence_declared: number;
  vco_result: VCOResult;
  public_approved: boolean;
}

export interface AnalysisOutput {
  id: string;
  country_id: CountryId;
  capital_id: string;
  period: string;
  axes: AxisAnalysis[];
  global_score: number;
  confidence_overall: number;
  pir_applied: boolean;
  vco_passed: boolean;
  vco_issues: string[];
  hallucination_flags: HallucinationFlag[];
  methodology_note: string;
  sources: DataSource[];
  audit_trail: AuditTrail;
  cross_effects: CrossEffect[];
  generated_at: string;
  framework_version: string;
  model_used: string;
  public: boolean;
}

export type PedagogicalLayer = 1 | 2 | 3;

export type ScoreBand =
  | 'Colapso'
  | 'Crise'
  | 'Fragilidade'
  | 'Transição'
  | 'Estabilidade'
  | 'Progresso'
  | 'Consolidação'
  | 'Avanço'
  | 'Excelência'
  | 'Referência';

export function getScoreBand(score: number): ScoreBand {
  if (score <= 1) return 'Colapso';
  if (score <= 2) return 'Crise';
  if (score <= 3) return 'Fragilidade';
  if (score <= 4) return 'Transição';
  if (score <= 5) return 'Estabilidade';
  if (score <= 6) return 'Progresso';
  if (score <= 7) return 'Consolidação';
  if (score <= 8) return 'Avanço';
  if (score <= 9) return 'Excelência';
  return 'Referência';
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.65) return 'medium';
  if (confidence >= 0.45) return 'low';
  return 'inconclusive';
}

// === Avatar ===
export interface AvatarProfile {
  id: string;
  country_id: CountryId;
  name: string;
  name_meaning: string;
  archetype: string;
  tone_adjectives: string[];
  persona_description: string;
  mission_in_app: string;
  welcome_message: string;
  symbolic_palette: { primary: string; secondary: string; accent: string };
  ux_microtexts: string[];
}

// === Export ===
export type ExportFormat = 'pdf_basic' | 'pdf_premium' | 'infographic' | 'slides' | 'video_script' | 'data_csv';
export type ExportTier = 'free' | 'pro' | 'institutional';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  tier: ExportTier;
  icon_name: string;
}

// === AR+ Audit ===
export interface ARTestResult {
  id: string;
  prompt_original: string;
  prompt_variant: string;
  variable_tested: 'language' | 'location' | 'profile' | 'phrasing';
  response_original: string;
  response_variant: string;
  asymmetry_score: number;
  asymmetry_type: 'tonal' | 'factual' | 'omission' | 'framing';
  severity: 'critical' | 'significant' | 'minor' | 'none';
  model_tested: string;
  tested_at: string;
}

// ═══ COMPARATIVE ANALYSIS TYPES ═══
import type {
  EpistemicCategory,
  ExecutionMode,
  VerificationState,
  DegradationRung,
  ReasonCode,
  EvidenceClaim,
  EvidenceSource,
  EvidenceQuarantine,
  EvidenceAudit,
  EvidenceCoverage,
  GovernmentSeparatedEvaluation,
  ToTDecisionRecord,
  PipelineStageReport,
} from './evidence';

export type SIBBand = 'ALTA' | 'MODERADA' | 'BAIXA' | 'INCONCLUSIVA';
export type ComparativeScoreBand = 'Referência Global' | 'Alto Desempenho' | 'Sólido' | 'Medíocre' | 'Fraco' | 'Crítico' | 'Colapso' | 'Inelegível / Sem Dados';
export type CrossEffectDirection = 'positivo' | 'negativo' | 'neutro' | 'ambiguo';
export type UserDepthTier = 'cidadao' | 'gestor' | 'especialista';
export type AnalysisPhase = 'welcome' | 'country_context' | 'axis_selection' | 'confirmation' | 'analyzing' | 'axis_transition' | 'synthesis' | 'complete';
export type AAMFlag =
  | 'INFERENCIA_NAO_FATO'
  | 'CONFLITO_FONTES'
  | 'QUEBRA_SERIE'
  | 'DADO_PRELIMINAR'
  | 'COBERTURA_LIMITADA'
  | 'CONFIANCA_BAIXA'
  | 'ATENCAO_METODOLOGICA'
  | 'DADO_INDISPONIVEL'
  | 'APS_TRIGGERED'
  | 'APP_SWAP_PASS'
  | 'APP_SWAP_FAIL'
  | 'QUARENTENA_METODOLOGICA';

export interface GovernmentRecord {
  id: string;
  countryId: string;
  name: string;
  leaderName: string;
  party: string;
  regimeType: string;
  yearStart: number;
  yearEnd: number | null;
  dataCoveragePct: number;
  analyticalMaturity: 'Alta' | 'Média' | 'Baixa' | 'Limitada';
  contextFlags: string[];
  color: string;
}

export interface SIBConfidence {
  value: number;
  band: SIBBand;
  coveragePct: number;
  dataBase: string;
}

export interface PrimaryDataPoint {
  metricName: string;
  value: number | null;
  unit: string;
  year: number;
  source: string;
  trend: 'crescente' | 'decrescente' | 'estavel';
  sib: SIBConfidence;
  aamFlags: AAMFlag[];
  // FABLE 5.0 Evidence Passport fields
  claimId?: string;
  verificationState?: VerificationState;
  epistemicCategory?: EpistemicCategory;
  degradationRung?: DegradationRung;
  reasonCodes?: ReasonCode[];
  priceBasis?: 'real' | 'nominal' | 'index' | 'rate' | 'percentage' | 'percentage_point' | 'unspecified';
  vintage?: string;
  definitionSummary?: string;
  populationScope?: string;
  comparabilityWarning?: string;
  contestabilityNote?: string;
}

export interface GovernmentAxisScore {
  governmentId: string;
  governmentName: string;
  period: string;
  score: number | null;
  band: ComparativeScoreBand;
  sibAverage: number;
  thesisSummary: string;
  antithesisSummary: string;
  primaryData: PrimaryDataPoint[];
  methodologicalNote: string;
  // FABLE 5.0 Separated Evaluation & Governance
  separatedEvaluation?: GovernmentSeparatedEvaluation;
  eligibleForRanking?: boolean;
  isQuarantined?: boolean;
  quarantineReasons?: string[];
  macroDecomposition?: {
    globalComponentWeightPct: number;
    structuralTrendWeightPct: number;
    idiossyncraticResidualPct: number;
    policyLagNote: string;
    nonCausalDisclaimer: string;
  };
}

export interface PedagogicalContent {
  citizen: string;
  manager: string;
  specialist: string;
  socraticQuestion: string;
}

export interface ComparativeCrossEffect {
  destinationAxisId: string;
  destinationAxisName: string;
  mechanismDescription: string;
  direction: CrossEffectDirection;
  intensity: 'alta' | 'moderada' | 'baixa';
}

export interface CCEEntry {
  dataName: string;
  institution: string;
  year: number;
  methodologyType: string;
  sibConfidence: number;
  sibBand: SIBBand;
  // FABLE 5.0 Provenance & Independence
  sourceId?: string;
  originGroup?: string;
  vintage?: string;
  originalUrl?: string | null;
  retrievalStatus?: 'LIVE_RETRIEVAL_NOT_IMPLEMENTED' | 'SOURCE_DECLARED_NOT_RETRIEVED' | 'RETRIEVED_AND_LOCATED' | 'RETRIEVAL_FAILED_OR_NOT_FOUND';
  authorityVerified?: boolean;
  isPerceptualIndex?: boolean;
  transformationsApplied?: string[];
}

export interface ComparativeAuditTrail {
  timestamp: string;
  modelVersion: string;
  frameworkVersion: string;
  promptId: string;
  governmentsCount: number;
  sourcesCount: number;
  independentOriginsCount?: number;
  verifiedSourcesCount?: number;
  aamFlagsTriggered: AAMFlag[];
  vcoStatus: 'approved' | 'approved_with_caveats' | 'quarantined';
  averageSibConfidence: number;
  executionMode?: ExecutionMode;
  liveRetrievalImplemented?: boolean;
}

export interface AxisComparativeResult {
  axisId: string;
  axisName: string;
  layer: 'A' | 'B' | 'C';
  governmentScores: GovernmentAxisScore[];
  crossEffects: ComparativeCrossEffect[];
  pedagogicalOutput: PedagogicalContent;
  cceTable: CCEEntry[];
  auditTrail: ComparativeAuditTrail;
  internationalComparison: { countryName: string; value: number; year: number }[];
  // FABLE 5.0 Evidence Engine Outputs
  executionMode?: ExecutionMode;
  evidenceClaims?: EvidenceClaim[];
  evidenceSources?: EvidenceSource[];
  evidenceCoverage?: EvidenceCoverage[];
  evidenceQuarantine?: EvidenceQuarantine[];
  evidenceAudit?: EvidenceAudit;
  totDecisions?: ToTDecisionRecord[];
  pipelineStages?: PipelineStageReport[];
  rankingEligible?: boolean;
  rankingBlockedReason?: string;
}

export interface ComparativeSession {
  id: string;
  countryId: string;
  countryName: string;
  selectedGovernments: GovernmentRecord[];
  selectedAxes: string[];
  userTier: UserDepthTier;
  phase: AnalysisPhase;
  completedAxes: AxisComparativeResult[];
  currentAxisIndex: number;
  isAnalyzing: boolean;
}

export function getComparativeScoreBand(score: number | null | undefined, eligible = true): ComparativeScoreBand {
  if (!eligible || score === null || score === undefined || Number.isNaN(score)) {
    return 'Inelegível / Sem Dados';
  }
  if (score >= 9.0) return 'Referência Global';
  if (score >= 7.5) return 'Alto Desempenho';
  if (score >= 6.0) return 'Sólido';
  if (score >= 4.5) return 'Medíocre';
  if (score >= 3.0) return 'Fraco';
  if (score >= 1.5) return 'Crítico';
  return 'Colapso';
}

export function getSIBBand(confidence: number): SIBBand {
  if (confidence >= 0.85) return 'ALTA';
  if (confidence >= 0.65) return 'MODERADA';
  if (confidence >= 0.45) return 'BAIXA';
  return 'INCONCLUSIVA';
}

// ═══ SYNTHETIC CONTROL METHOD (JSON_18) ═══

export type PolicyType = 'fiscal' | 'monetary' | 'social' | 'environmental' | 'institutional' | 'security';
export type BifurcationDirection = 'positive' | 'negative' | 'mixed' | 'counterfactual_positive' | 'counterfactual_negative';

export interface BifurcationPoint {
  id: string;
  country_id: string;
  year: number;
  title_pt: string;
  description_pt: string;
  policy_type: PolicyType;
  affected_axes: string[];
  direction_actual: BifurcationDirection;
  minimum_pre_bifurcation_years: number;
  minimum_peer_countries: number;
  data_quality_note: string | null;
  tags: string[];
  is_user_defined?: boolean;
}

export interface SCMInput {
  target_country_id: string;
  bifurcation_year: number;
  affected_axis_id: string;
  horizon_years: number;
  donor_pool: string[];
  pre_bifurcation_variables: string[];
}

export interface ExternalShockAdjustment {
  year: number;
  event: string;
  weight_reduction_factor: number;
  source: string;
}

export interface SCMMetadata {
  donor_countries_used: string[];
  pre_bifurcation_years: number;
  optimization_iterations: number;
  convergence_achieved: boolean;
  computation_time_ms: number;
  data_quality_score: number;
}

export interface SCMResult {
  synthetic_weights: Record<string, number>;
  pre_fit_r_squared: number;
  pre_fit_rmse: number;
  counterfactual_trajectory: number[];
  actual_trajectory: number[];
  effect_trajectory: number[];
  confidence_intervals: { p10: number[]; p50: number[]; p90: number[] };
  sib_confidence_by_year: number[];
  external_shock_adjustments: ExternalShockAdjustment[];
  placebo_p_value: number;
  computation_metadata: SCMMetadata;
  narrative?: string;
}

// ═══ INSTITUTIONAL DNA (JSON_19) ═══

export type DNAClassificationType = 'structural' | 'conjunctural' | 'intermediate';

export interface AxisDNAClassification {
  axis_id: string;
  axis_name: string;
  persistence_score: number;
  structural_pct: number;
  conjunctural_pct: number;
  classification: DNAClassificationType;
  historical_range: { min: number; max: number; mean: number };
  cross_government_stdev: number;
  pc1_loading: number;
  pc2_loading: number;
}

export interface DNAPattern {
  pattern_id: string;
  title: string;
  description: string;
  axes_involved: string[];
  persistence_years: number;
  persistence_across_govs: string;
  direction: 'positive' | 'negative';
  international_rarity: 'common' | 'uncommon' | 'rare' | 'unique';
}

export interface DNASignature {
  label: string;
  description: string;
  core_tension: string;
  structural_strengths: DNAPattern[];
  structural_vulnerabilities: DNAPattern[];
}

export interface CountryArchetype {
  id: string;
  label: string;
  description: string;
  examples: string[];
  policy_implication: string;
}

export interface DNANarrative {
  assinatura: string;
  padroes_estruturais: string;
  tensao_central: string;
}

export interface DNAAnalysisResult {
  country_id: string;
  country_name: string;
  governments_analyzed: GovernmentRecord[];
  axes_analyzed: { id: string; name: string }[];
  pca_metadata: { pc1_explained_variance_pct: number; pc2_explained_variance_pct: number; matrix_r_squared: number };
  axis_classifications: AxisDNAClassification[];
  structural_patterns: DNAPattern[];
  conjunctural_patterns: DNAPattern[];
  dna_signature: DNASignature;
  archetype: CountryArchetype;
  narrative: DNANarrative;
  computed_at: string;
}

// ═══ CIVIC AGENCY (JSON_20) ═══

export type CivicActionType = 'public_consultation' | 'legislative_hearing_attendance' | 'legislative_monitoring' | 'cso_engagement' | 'evidence_submission' | 'awareness_qualified_sharing' | 'informed_voting';
export type IACLevel = 'Observador' | 'Cidadão Informado' | 'Participante Ativo' | 'Agente Cívico' | 'Referência Democrática';

export interface CivicOpportunity {
  id: string;
  title: string;
  organization: string;
  organization_type: 'government' | 'parliament' | 'cso' | 'academic' | 'international';
  action_type: CivicActionType;
  relevant_axes: string[];
  country_id: string;
  deadline: string | null;
  estimated_time_minutes: number;
  iac_points_if_completed: number;
  url: string;
  description_short: string;
  description_long?: string;
  why_relevant_to_user?: string;
  participants_count?: number;
  is_verified: boolean;
}

export interface UserCivicAction {
  id: string;
  action_type: CivicActionType;
  relevant_axes: string[];
  iac_points_earned: number;
  days_since_analysis: number;
  notes?: string;
  created_at: string;
}

export interface IACProfile {
  iac_score: number;
  iac_level: IACLevel;
  action_quality_score: number;
  analysis_depth_score: number;
  breadth_diversity_score: number;
  total_actions: number;
  verified_actions: number;
  axes_covered: string[];
  current_streak_months: number;
  badges_earned: string[];
}

export function getIACLevel(score: number): IACLevel {
  if (score >= 8) return 'Referência Democrática';
  if (score >= 6) return 'Agente Cívico';
  if (score >= 4) return 'Participante Ativo';
  if (score >= 2) return 'Cidadão Informado';
  return 'Observador';
}
