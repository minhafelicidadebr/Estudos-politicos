/**
 * JSON_28 — Emergent Civic Intelligence Engine
 * Complex Adaptive Systems for collective analysis pattern detection
 * 100% deterministic — illustrative demo patterns, NOT computed from a real corpus.
 * There is no live aggregation over the `analyses` table yet (see Onda 4 do
 * PLANO_ELEVACAO_180.md). Do not present `totalAnalysesInCorpus` as a live metric.
 */

export interface UnexpectedConvergence {
  id: string;
  axisPair: [string, string];
  axisNames: [string, string];
  observedR: number;
  theoreticalR: number;
  gap: number;
  nAnalyses: number;
  sib: number;
  interpretation: string;
}

export interface FractalPattern {
  id: string;
  patternName: string;
  description: string;
  federalCosine: number;
  stateCosine: number;
  municipalCosine: number;
  pValue: number;
  sib: number;
  axesInvolved: string[];
}

export interface InflectionPoint {
  year: number;
  divergenceSigma: number;
  baselineSigma: number;
  mostContestedAxes: string[];
  historicalEvent18moLater: string;
  predictiveLeadMonths: number;
}

export interface UniversalInvariant {
  pattern: string;
  countriesConfirming: string[];
  countriesTested: number;
  strength: number;
  mechanismHypothesis: string;
  sib: number;
}

export interface EmergentIntelligenceResult {
  /** Illustrative scale of the demo dataset — not a live count. See `isIllustrative`. */
  totalAnalysesInCorpus: number;
  /** True while this engine runs on seeded demo patterns instead of a real corpus query. */
  isIllustrative: true;
  computedAt: string;
  convergences: UnexpectedConvergence[];
  fractalPatterns: FractalPattern[];
  inflectionPoints: InflectionPoint[];
  universalInvariants: UniversalInvariant[];
  healthIndex: number; // 0-1 overall emergence health
}

// Pre-seeded illustrative patterns (demo scale, not a real corpus)
const CONVERGENCES: UnexpectedConvergence[] = [
  {
    id: 'conv-01', axisPair: ['A7', 'A9'], axisNames: ['Meio Ambiente', 'Minorias'],
    observedR: 0.71, theoreticalR: 0.25, gap: 0.46, nAnalyses: 45000, sib: 0.88,
    interpretation: 'Analistas que avaliam política ambiental tendem a pontuar direitos de minorias na mesma direção — sugerindo dimensão mais profunda de qualidade institucional',
  },
  {
    id: 'conv-02', axisPair: ['A3', 'A1'], axisNames: ['Macroeconomia', 'Saúde Pública'],
    observedR: 0.68, theoreticalR: 0.35, gap: 0.33, nAnalyses: 62000, sib: 0.82,
    interpretation: 'Estabilidade macroeconômica e saúde pública co-movem mais do que a teoria prevê — orçamento de saúde depende de arrecadação estável',
  },
  {
    id: 'conv-03', axisPair: ['A6', 'A2'], axisNames: ['Governança Digital', 'Educação'],
    observedR: 0.74, theoreticalR: 0.50, gap: 0.24, nAnalyses: 38000, sib: 0.79,
    interpretation: 'Digitalização governamental e educação correlacionam acima do esperado — sugere que capital humano é pré-condição para governança digital efetiva',
  },
  {
    id: 'conv-04', axisPair: ['A4', 'A8'], axisNames: ['Estado de Direito', 'Segurança'],
    observedR: 0.82, theoreticalR: 0.60, gap: 0.22, nAnalyses: 55000, sib: 0.91,
    interpretation: 'Quando instituições judiciárias enfraquecem, segurança pública deteriora em cascata — reforço mútuo mais forte que o modelado',
  },
  {
    id: 'conv-05', axisPair: ['B8', 'C11'], axisNames: ['Bem-Estar (CWBIG)', 'Mercado de Trabalho'],
    observedR: 0.76, theoreticalR: 0.45, gap: 0.31, nAnalyses: 28000, sib: 0.75,
    interpretation: 'Bem-estar subjetivo e condições do mercado de trabalho convergem fortemente — trabalho digno é vetor central de felicidade',
  },
];

const FRACTAL_PATTERNS: FractalPattern[] = [
  {
    id: 'fp-01', patternName: 'Gap Digital-Institucional', description: 'Alto A6 (Digital) + Baixo A4 (Estado de Direito) reproduz-se em governos alinhados nos níveis federal, estadual e municipal',
    federalCosine: 0.91, stateCosine: 0.86, municipalCosine: 0.82, pValue: 0.004, sib: 0.79,
    axesInvolved: ['A6', 'A4'],
  },
  {
    id: 'fp-02', patternName: 'Padrão Saúde-Educação', description: 'Investimento simultâneo em saúde e educação se replica em todas as escalas quando há alinhamento político',
    federalCosine: 0.88, stateCosine: 0.83, municipalCosine: 0.78, pValue: 0.008, sib: 0.76,
    axesInvolved: ['A1', 'A2'],
  },
  {
    id: 'fp-03', patternName: 'Ciclo Segurança-Orçamento', description: 'Corte em segurança pública + aumento da violência reproduz-se identicamente em múltiplas escalas',
    federalCosine: 0.85, stateCosine: 0.81, municipalCosine: 0.79, pValue: 0.012, sib: 0.73,
    axesInvolved: ['A8', 'A3'],
  },
];

const INFLECTION_POINTS: InflectionPoint[] = [
  { year: 2002, divergenceSigma: 2.1, baselineSigma: 1.2, mostContestedAxes: ['A3', 'A5'], historicalEvent18moLater: 'Transição política + crise de confiança do mercado', predictiveLeadMonths: 12 },
  { year: 2005, divergenceSigma: 1.9, baselineSigma: 1.1, mostContestedAxes: ['A4', 'A5'], historicalEvent18moLater: 'Mensalão — crise institucional', predictiveLeadMonths: 6 },
  { year: 2013, divergenceSigma: 2.5, baselineSigma: 1.2, mostContestedAxes: ['A5', 'A8', 'A1'], historicalEvent18moLater: 'Jornadas de Junho → polarização acelerada', predictiveLeadMonths: 3 },
  { year: 2014, divergenceSigma: 2.8, baselineSigma: 1.3, mostContestedAxes: ['A3', 'A4', 'B6'], historicalEvent18moLater: 'Recessão 2015-2016 + impeachment', predictiveLeadMonths: 18 },
  { year: 2019, divergenceSigma: 2.3, baselineSigma: 1.4, mostContestedAxes: ['A7', 'A9', 'A4'], historicalEvent18moLater: 'Pandemia + crise institucional', predictiveLeadMonths: 12 },
];

const UNIVERSAL_INVARIANTS: UniversalInvariant[] = [
  {
    pattern: 'A8↓ + A1↓ → Feedback positivo (ambos pioram juntos)',
    countriesConfirming: ['BR', 'ZA', 'MX'], countriesTested: 12, strength: 0.75,
    mechanismHypothesis: 'Competição por recursos Segurança-Saúde: governos sob estresse fiscal cortam ambos simultaneamente, criando ciclo reforçador',
    sib: 0.72,
  },
  {
    pattern: 'A2↑ → A6↑ (lag 5-8 anos)',
    countriesConfirming: ['BR', 'KR', 'EE', 'UY'], countriesTested: 15, strength: 0.80,
    mechanismHypothesis: 'Capital humano educacional é pré-condição necessária para governança digital efetiva — investimento em educação precede digitalização por ~6 anos',
    sib: 0.78,
  },
  {
    pattern: 'A4↓ → A3↓ (lag 2-3 anos)',
    countriesConfirming: ['BR', 'AR', 'TR', 'HU', 'PL'], countriesTested: 18, strength: 0.83,
    mechanismHypothesis: 'Erosão do Estado de Direito precede instabilidade macroeconômica — confiança institucional é fundamento da estabilidade econômica',
    sib: 0.81,
  },
];

export function computeEmergentIntelligence(): EmergentIntelligenceResult {
  const health = (CONVERGENCES.length * 0.1 + FRACTAL_PATTERNS.length * 0.15 + INFLECTION_POINTS.length * 0.08 + UNIVERSAL_INVARIANTS.length * 0.12);
  return {
    totalAnalysesInCorpus: CONVERGENCES.reduce((sum, c) => sum + c.nAnalyses, 0),
    isIllustrative: true,
    computedAt: new Date().toISOString(),
    convergences: CONVERGENCES,
    fractalPatterns: FRACTAL_PATTERNS,
    inflectionPoints: INFLECTION_POINTS,
    universalInvariants: UNIVERSAL_INVARIANTS,
    healthIndex: Math.min(1, health),
  };
}

export function getConvergenceStrengthBand(gap: number): { band: string; color: string } {
  if (gap >= 0.40) return { band: 'Emergência Forte', color: '#10B981' };
  if (gap >= 0.25) return { band: 'Emergência Moderada', color: '#FBBF24' };
  return { band: 'Emergência Fraca', color: '#6B7280' };
}
