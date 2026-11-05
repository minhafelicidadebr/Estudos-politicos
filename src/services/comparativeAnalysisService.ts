import type {
  GovernmentRecord, AxisComparativeResult,
} from '@/types/aegis';
import type { ExecutionMode } from '@/types/evidence';
import {
  governAxisAnalysisResult,
  computeSessionRankingGovernance,
} from '@/lib/evidence/engine';
import { sanitizeUntrustedText } from '@/data/promptRegistry';

const COMPARATIVE_ANALYSIS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comparative-analysis`;

function getComparativeAnalysisErrorMessage(status: number, fallback?: string) {
  if (status === 402) {
    return 'Os créditos de IA do workspace acabaram. Recarregue os créditos em Settings → Workspace → Usage para voltar a executar as análises.';
  }

  if (status === 429) {
    return 'Muitas análises foram enviadas em sequência. Aguarde alguns segundos e tente novamente.';
  }

  return fallback || 'Não foi possível executar a análise comparativa agora.';
}

interface ComparativeAnalysisEnvelope<T> {
  error?: string;
  result?: T;
  modelExecuted?: string;
  executionMode?: ExecutionMode;
}

async function invokeComparativeAnalysis<T>(body: unknown): Promise<{
  result: T;
  modelExecuted?: string;
  executionMode?: ExecutionMode;
}> {
  const response = await fetch(COMPARATIVE_ANALYSIS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null) as ComparativeAnalysisEnvelope<T> | null;

  if (!response.ok) {
    throw new Error(getComparativeAnalysisErrorMessage(response.status, payload?.error));
  }

  if (payload?.error) {
    throw new Error(payload.error);
  }

  if (!payload?.result) {
    throw new Error('A resposta da análise veio vazia. Tente novamente.');
  }

  return {
    result: payload.result,
    modelExecuted: payload.modelExecuted,
    executionMode: payload.executionMode,
  };
}

type FinalSynthesisPayload = {
  executiveSummary?: unknown;
  trajectoryAnalysis?: unknown;
  lessons?: unknown;
};

function getSafeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeFinalSynthesisLesson(lesson: unknown) {
  if (typeof lesson === 'string') return lesson.trim();

  if (lesson && typeof lesson === 'object') {
    const record = lesson as Record<string, unknown>;
    const title = getSafeText(record.title);
    const description = getSafeText(record.description);
    const summary = getSafeText(record.summary);

    return [title, description || summary].filter(Boolean).join(' — ');
  }

  return '';
}

function normalizeFinalSynthesis(payload: FinalSynthesisPayload): {
  executiveSummary: string;
  trajectoryAnalysis: string;
  lessons: string[];
} {
  const lessons = Array.isArray(payload.lessons)
    ? payload.lessons.map(normalizeFinalSynthesisLesson).filter((lesson): lesson is string => Boolean(lesson))
    : [];

  return {
    executiveSummary: getSafeText(payload.executiveSummary) || 'Síntese executiva indisponível para esta análise.',
    trajectoryAnalysis: getSafeText(payload.trajectoryAnalysis),
    lessons,
  };
}

const AXIS_DEFINITIONS: Record<string, { name: string; layer: 'A' | 'B' | 'C'; metrics: string[]; subcommittee: string[] }> = {
  A1: { name: 'Saúde Pública e Resiliência Sanitária', layer: 'A', metrics: ['gastos_saude_pct_pib', 'expectativa_vida', 'mortalidade_infantil', 'cobertura_vacinal'], subcommittee: ['OMS', 'PNUD', 'The Lancet'] },
  A2: { name: 'Educação e Capital Humano', layer: 'A', metrics: ['taxa_analfabetismo', 'pisa_scores', 'investimento_educacao_pct_pib', 'taxa_escolarizacao'], subcommittee: ['UNESCO', 'OCDE', 'WIPO'] },
  A3: { name: 'Macroeconomia e Estabilidade Fiscal', layer: 'A', metrics: ['inflacao', 'crescimento_pib', 'divida_bruta_pib', 'resultado_primario'], subcommittee: ['FMI', 'Banco Mundial', 'BIS'] },
  A4: { name: 'Justiça, Estado de Direito e Corrupção', layer: 'A', metrics: ['wjp_index', 'cpi_score', 'vdem_score'], subcommittee: ['World Justice Project', 'Transparency International', 'V-Dem'] },
  A5: { name: 'Infraestrutura, Energia e Logística', layer: 'A', metrics: ['qualidade_infraestrutura', 'investimento_infraestrutura', 'energia_renovavel_pct'], subcommittee: ['IEA', 'WEF', 'Banco Mundial'] },
  A6: { name: 'Governança Pública e Transformação Digital', layer: 'A', metrics: ['un_egdi', 'gov_effectiveness', 'abertura_empresa_dias'], subcommittee: ['UN DESA', 'OCDE', 'Banco Mundial'] },
  A7: { name: 'Meio Ambiente e Sustentabilidade Climática', layer: 'A', metrics: ['desmatamento_km2', 'emissoes_ghg', 'energia_renovavel_pct', 'epi_score'], subcommittee: ['IPCC', 'UNEP', 'Yale EPI'] },
  A8: { name: 'Segurança Pública e Sistema de Justiça Criminal', layer: 'A', metrics: ['taxa_homicidios', 'populacao_carceraria', 'tempo_tramitacao'], subcommittee: ['UNODC', 'Atlas da Violência', 'FBSP'] },
  A9: { name: 'Liberdade de Informação e Ecossistema Midiático', layer: 'A', metrics: ['rsf_press_freedom', 'freedom_house', 'vdem_media'], subcommittee: ['RSF', 'Freedom House', 'V-Dem'] },
  B1: { name: 'Segurança Pública — Violência Estrutural', layer: 'B', metrics: ['taxa_homicidios', 'crime_organizado', 'vitimizacao_survey'], subcommittee: ['UNODC', 'FBSP', 'Atlas da Violência'] },
  B2: { name: 'Federalismo e Descentralização', layer: 'B', metrics: ['autonomia_subnacional', 'transferencias_pct', 'capacidade_local'], subcommittee: ['OCDE', 'Banco Mundial'] },
  B3: { name: 'Qualidade Democrática e Liberdades Civis', layer: 'B', metrics: ['vdem_liberal', 'economist_democracy', 'freedom_house'], subcommittee: ['V-Dem', 'Freedom House', 'The Economist'] },
  B4: { name: 'Soberania Energética', layer: 'B', metrics: ['dependencia_energetica', 'diversificacao_matriz', 'investimento_renovavel'], subcommittee: ['IEA', 'IRENA'] },
  B5: { name: 'Coesão Social', layer: 'B', metrics: ['confianca_institucional', 'capital_social', 'polarizacao'], subcommittee: ['PNUD', 'Latinobarómetro'] },
  B6: { name: 'Equilíbrio Fiscal Subnacional', layer: 'B', metrics: ['divida_subnacional', 'resultado_primario_estados', 'rrf'], subcommittee: ['STN', 'FMI'] },
  B7: { name: 'Conflito e Paz', layer: 'B', metrics: ['global_peace_index', 'conflitos_internos', 'gastos_defesa'], subcommittee: ['IEP', 'SIPRI', 'ACLED'] },
  C1: { name: 'Gênero e Equidade', layer: 'C', metrics: ['gender_gap_index', 'violencia_genero', 'participacao_feminina'], subcommittee: ['WEF', 'ONU Mulheres'] },
  C2: { name: 'Juventude e Futuro', layer: 'C', metrics: ['desemprego_jovem', 'neet_rate', 'mobilidade_social'], subcommittee: ['OIT', 'OCDE'] },
  C3: { name: 'Tecnologia e Inovação Digital', layer: 'C', metrics: ['gii_score', 'patentes_per_capita', 'investimento_pd'], subcommittee: ['WIPO', 'ITU'] },
  C4: { name: 'Urbanização e Cidades', layer: 'C', metrics: ['urbanizacao_pct', 'favelas_pct', 'transporte_publico'], subcommittee: ['UN-Habitat', 'OCDE'] },
  C5: { name: 'Migração e Diáspora', layer: 'C', metrics: ['saldo_migratorio', 'remessas_pct_pib', 'integracao_migrante'], subcommittee: ['OIM', 'ACNUR'] },
  C6: { name: 'Cultura e Patrimônio', layer: 'C', metrics: ['investimento_cultura_pct', 'patrimonio_unesco', 'industria_criativa'], subcommittee: ['UNESCO', 'UNCTAD'] },
  C7: { name: 'Mídia e Desinformação', layer: 'C', metrics: ['rsf_press_freedom', 'desinformacao_index', 'pluralismo_midia'], subcommittee: ['RSF', 'Oxford Internet Institute'] },
  C8: { name: 'Desigualdade de Renda, Riqueza e Oportunidades', layer: 'C', metrics: ['indice_gini', 'pobreza_extrema', 'razao_decis'], subcommittee: ['PNUD', 'CEPAL', 'Oxfam'] },
  C9: { name: 'Corrupção, Integridade Pública e Reformas', layer: 'C', metrics: ['cpi_score', 'wjp_corruption', 'ativos_recuperados'], subcommittee: ['Transparency International', 'WJP', 'Basel Institute'] },
  C10: { name: 'Clima e Transição Verde', layer: 'C', metrics: ['emissoes_per_capita', 'metas_ndc', 'financiamento_verde'], subcommittee: ['IPCC', 'Climate Action Tracker'] },
  C11: { name: 'Trabalho e Emprego', layer: 'C', metrics: ['taxa_desemprego', 'informalidade', 'produtividade_trabalho'], subcommittee: ['OIT', 'OCDE'] },
  C12: { name: 'Inovação Social', layer: 'C', metrics: ['ongs_per_capita', 'voluntariado', 'economia_solidaria'], subcommittee: ['CIVICUS', 'Ashoka'] },
};

export function getAxisDefinition(axisId: string) {
  return AXIS_DEFINITIONS[axisId];
}

export function getAllAxisDefinitions() {
  return AXIS_DEFINITIONS;
}

interface AnalysisRequest {
  country: string;
  countryId: string;
  axisId: string;
  axisName: string;
  governments: GovernmentRecord[];
}

export async function generateAxisAnalysis(req: AnalysisRequest): Promise<AxisComparativeResult> {
  const axisDef = AXIS_DEFINITIONS[req.axisId];

  const { result: rawParsed, modelExecuted, executionMode } = await invokeComparativeAnalysis<unknown>({
    type: 'axis_analysis',
    payload: {
      country: sanitizeUntrustedText(req.country).sanitized,
      countryId: sanitizeUntrustedText(req.countryId).sanitized,
      axisId: sanitizeUntrustedText(req.axisId).sanitized,
      axisName: sanitizeUntrustedText(req.axisName).sanitized,
      layer: axisDef?.layer || 'A',
      governments: req.governments.map(g => ({
        id: sanitizeUntrustedText(g.id).sanitized,
        name: sanitizeUntrustedText(g.name).sanitized,
        leaderName: sanitizeUntrustedText(g.leaderName).sanitized,
        party: sanitizeUntrustedText(g.party).sanitized,
        yearStart: g.yearStart,
        yearEnd: g.yearEnd,
      })),
    },
  });

  // Govern result deterministically via FABLE 5.0 Evidence Engine:
  // - Rejects model-self-certified verified/eligible flags
  // - Never imputes 0 for missing data
  // - Enforces originGroup deduplication & SIB recalculation
  // - Computes separated evaluation dimensions & quarantine
  const governed = governAxisAnalysisResult(rawParsed, {
    countryId: req.countryId,
    executionMode: executionMode ?? 'RESEARCH_PARTIAL',
    actualModelExecuted: modelExecuted,
  });

  return governed;
}

export async function generateFinalSynthesis(
  country: string,
  governments: GovernmentRecord[],
  completedAxes: AxisComparativeResult[]
): Promise<{ executiveSummary: string; trajectoryAnalysis: string; lessons: string[] }> {
  // Compute FABLE 5.0 deterministic ranking governance (never imputing 0 for null/quarantined scores)
  const governance = computeSessionRankingGovernance(governments, completedAxes);

  const matrixData = governments.map(g => {
    const summary = governance.aggregates.find(item => item.government.id === g.id);
    return {
      government: sanitizeUntrustedText(g.name).sanitized,
      governmentId: g.id,
      eligibleForRanking: summary?.eligibleForGlobalRanking ?? false,
      averageObservedScore: summary?.averageScore ?? null,
      averageSib: summary?.averageSib ?? 0,
      statusLabel: summary?.statusLabel ?? 'Inelegível / Sem Dados',
      scores: completedAxes.map(a => {
        const gs = a.governmentScores.find(s => s.governmentId === g.id);
        return {
          axis: a.axisName,
          score: gs && gs.eligibleForRanking !== false && gs.score !== null ? gs.score : null,
          status: gs?.isQuarantined
            ? 'QUARANTINED'
            : gs?.score === null || gs?.score === undefined
            ? 'MISSING_DATA'
            : 'ELIGIBLE',
          sibAverage: gs?.sibAverage ?? 0,
        };
      }),
    };
  });

  const { result: rawSynthesis } = await invokeComparativeAnalysis<FinalSynthesisPayload>({
    type: 'final_synthesis',
    payload: {
      country: sanitizeUntrustedText(country).sanitized,
      rankingPublished: governance.rankingPublished,
      ineligibilityNotice: governance.rankingBlockedReason,
      matrixData,
    },
  });

  const normalized = normalizeFinalSynthesis(rawSynthesis);

  if (!governance.rankingPublished && governance.rankingBlockedReason) {
    return {
      ...normalized,
      executiveSummary: `[GOVERNANÇA METODOLÓGICA FABLE 5.0: ${governance.rankingBlockedReason}]\n\n${normalized.executiveSummary}`,
    };
  }

  return normalized;
}
