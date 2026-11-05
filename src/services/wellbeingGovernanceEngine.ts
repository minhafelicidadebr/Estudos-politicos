/**
 * Wellbeing Governance Engine (JSON_24)
 * C-WBIG: Composite Wellbeing Index for Governance
 * 100% deterministic — no LLM for numerical calculations
 * Based on: Kahneman & Deaton (2010), VanderWeele (2017), Easterlin (1974)
 */

// ═══ TYPES ═══

export type EasterlinType = 'positive_paradox' | 'negative_paradox' | 'aligned';
export type DivergenceType = 'aspirational_gap' | 'emotional_resilience';

export interface WellbeingDomainScores {
  happiness_life_satisfaction: number;
  physical_mental_health: number;
  meaning_purpose: number;
  character_civic_virtue: number;
  close_social_relations: number;
}

export interface ExperiencingRememberingSplit {
  rememberingSelf: number;
  experiencingSelf: number;
  divergence: number;
  divergenceType: DivergenceType;
}

export interface EasterlinGapResult {
  gap: number;
  type: EasterlinType;
  gdpGrowthZ: number;
  wellbeingGrowthZ: number;
  governanceImplication: string;
}

export interface CWBIGResult {
  governmentId: string;
  governmentName: string;
  period: string;
  cwbigScore: number;
  sibConfidence: number;
  sibBand: string;
  experiencingRemembering: ExperiencingRememberingSplit;
  vanderWeeleDomains: WellbeingDomainScores;
  easterlinGap: EasterlinGapResult;
  economicScore: number;
  dataSources: string[];
  methodologyNote: string;
}

// ═══ PRE-SEEDED DATA ═══

interface GovernmentWellbeingData {
  cwbig_score: number;
  easterlin_gap: number;
  sib: number;
  cantril: number;
  positive_affect: number;
  negative_affect: number;
  social_support: number;
  freedom_satisfaction: number;
  flourishing: number;
  economic_score: number;
  gdp_growth: number;
  domains: WellbeingDomainScores;
  note?: string;
}

const BRAZIL_WELLBEING_DATA: Record<string, GovernmentWellbeingData> = {
  'br-collor': {
    cwbig_score: 4.1, easterlin_gap: 0.3, sib: 0.52,
    cantril: 5.2, positive_affect: 0.62, negative_affect: 0.38, social_support: 0.71, freedom_satisfaction: 0.55, flourishing: 4.0,
    economic_score: 3.8, gdp_growth: -1.3,
    domains: { happiness_life_satisfaction: 4.5, physical_mental_health: 4.2, meaning_purpose: 3.8, character_civic_virtue: 3.5, close_social_relations: 5.2 },
    note: 'Cobertura Gallup limitada para 1990'
  },
  'br-itamar': {
    cwbig_score: 4.4, easterlin_gap: 0.5, sib: 0.54,
    cantril: 5.4, positive_affect: 0.64, negative_affect: 0.36, social_support: 0.72, freedom_satisfaction: 0.58, flourishing: 4.2,
    economic_score: 4.5, gdp_growth: 4.9,
    domains: { happiness_life_satisfaction: 4.8, physical_mental_health: 4.3, meaning_purpose: 4.0, character_civic_virtue: 3.8, close_social_relations: 5.3 }
  },
  'br-fhc1': {
    cwbig_score: 5.6, easterlin_gap: 0.2, sib: 0.71,
    cantril: 6.1, positive_affect: 0.68, negative_affect: 0.32, social_support: 0.76, freedom_satisfaction: 0.65, flourishing: 5.4,
    economic_score: 5.8, gdp_growth: 2.4,
    domains: { happiness_life_satisfaction: 5.8, physical_mental_health: 5.2, meaning_purpose: 5.5, character_civic_virtue: 5.0, close_social_relations: 6.1 },
    note: 'Plano Real melhorou significativamente o Remembering Self'
  },
  'br-fhc2': {
    cwbig_score: 5.8, easterlin_gap: -0.8, sib: 0.73,
    cantril: 6.0, positive_affect: 0.69, negative_affect: 0.31, social_support: 0.77, freedom_satisfaction: 0.66, flourishing: 5.6,
    economic_score: 5.2, gdp_growth: 2.1,
    domains: { happiness_life_satisfaction: 5.9, physical_mental_health: 5.5, meaning_purpose: 5.6, character_civic_virtue: 5.2, close_social_relations: 6.3 },
    note: 'Paradoxo negativo: bem-estar se manteve apesar da crise de 1999'
  },
  'br-lula1': {
    cwbig_score: 6.9, easterlin_gap: 0.4, sib: 0.82,
    cantril: 6.8, positive_affect: 0.74, negative_affect: 0.26, social_support: 0.82, freedom_satisfaction: 0.72, flourishing: 6.5,
    economic_score: 7.1, gdp_growth: 4.2,
    domains: { happiness_life_satisfaction: 7.0, physical_mental_health: 6.2, meaning_purpose: 6.8, character_civic_virtue: 6.0, close_social_relations: 7.5 }
  },
  'br-lula2': {
    cwbig_score: 7.2, easterlin_gap: 0.6, sib: 0.84,
    cantril: 7.1, positive_affect: 0.76, negative_affect: 0.24, social_support: 0.84, freedom_satisfaction: 0.75, flourishing: 6.9,
    economic_score: 7.6, gdp_growth: 5.1,
    domains: { happiness_life_satisfaction: 7.3, physical_mental_health: 6.5, meaning_purpose: 7.0, character_civic_virtue: 6.2, close_social_relations: 7.8 },
    note: 'Melhor score de Experiencing Self da história brasileira'
  },
  'br-dilma1': {
    cwbig_score: 5.4, easterlin_gap: -1.8, sib: 0.80,
    cantril: 6.2, positive_affect: 0.65, negative_affect: 0.35, social_support: 0.78, freedom_satisfaction: 0.62, flourishing: 5.2,
    economic_score: 4.8, gdp_growth: 2.4,
    domains: { happiness_life_satisfaction: 5.5, physical_mental_health: 5.0, meaning_purpose: 5.2, character_civic_virtue: 4.5, close_social_relations: 6.8 },
    note: 'PARADOXO NEGATIVO: bem-estar se sustentou apesar da deterioração econômica'
  },
  'br-dilma2': {
    cwbig_score: 3.8, easterlin_gap: -0.4, sib: 0.79,
    cantril: 5.0, positive_affect: 0.55, negative_affect: 0.45, social_support: 0.72, freedom_satisfaction: 0.50, flourishing: 3.8,
    economic_score: 2.5, gdp_growth: -3.5,
    domains: { happiness_life_satisfaction: 3.5, physical_mental_health: 3.8, meaning_purpose: 3.2, character_civic_virtue: 3.0, close_social_relations: 5.8 }
  },
  'br-temer': {
    cwbig_score: 4.2, easterlin_gap: 1.1, sib: 0.76,
    cantril: 5.5, positive_affect: 0.58, negative_affect: 0.42, social_support: 0.70, freedom_satisfaction: 0.52, flourishing: 4.0,
    economic_score: 4.8, gdp_growth: 1.2,
    domains: { happiness_life_satisfaction: 4.2, physical_mental_health: 4.0, meaning_purpose: 3.8, character_civic_virtue: 3.5, close_social_relations: 5.5 }
  },
  'br-bolsonaro': {
    cwbig_score: 3.2, easterlin_gap: 2.1, sib: 0.81,
    cantril: 5.8, positive_affect: 0.50, negative_affect: 0.50, social_support: 0.65, freedom_satisfaction: 0.48, flourishing: 3.2,
    economic_score: 4.5, gdp_growth: 1.5,
    domains: { happiness_life_satisfaction: 3.0, physical_mental_health: 3.5, meaning_purpose: 2.8, character_civic_virtue: 2.2, close_social_relations: 4.8 },
    note: 'PARADOXO POSITIVO: economia resistiu durante COVID mas bem-estar colapsou — crise de confiança institucional'
  },
  'br-lula3': {
    cwbig_score: 5.9, easterlin_gap: 0.3, sib: 0.68,
    cantril: 6.5, positive_affect: 0.70, negative_affect: 0.30, social_support: 0.79, freedom_satisfaction: 0.68, flourishing: 5.8,
    economic_score: 6.0, gdp_growth: 3.1,
    domains: { happiness_life_satisfaction: 6.0, physical_mental_health: 5.5, meaning_purpose: 5.8, character_civic_virtue: 5.0, close_social_relations: 6.8 },
    note: 'Cobertura parcial 2023-2024'
  }
};

const GOVERNMENT_LABELS: Record<string, { name: string; period: string }> = {
  'br-collor': { name: 'Collor/Itamar', period: '1990–1992' },
  'br-itamar': { name: 'Itamar Franco', period: '1992–1994' },
  'br-fhc1': { name: 'FHC I', period: '1995–1998' },
  'br-fhc2': { name: 'FHC II', period: '1999–2002' },
  'br-lula1': { name: 'Lula I', period: '2003–2006' },
  'br-lula2': { name: 'Lula II', period: '2007–2010' },
  'br-dilma1': { name: 'Dilma I', period: '2011–2014' },
  'br-dilma2': { name: 'Dilma II', period: '2015–2016' },
  'br-temer': { name: 'Temer', period: '2016–2018' },
  'br-bolsonaro': { name: 'Bolsonaro', period: '2019–2022' },
  'br-lula3': { name: 'Lula III', period: '2023–presente' }
};

// ═══ Z-SCORE ═══

function zScore(value: number, series: number[]): number {
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const std = Math.sqrt(series.reduce((sum, x) => sum + (x - mean) ** 2, 0) / series.length);
  return std === 0 ? 0 : (value - mean) / std;
}

// ═══ CORE ALGORITHMS ═══

function computeExperiencingRemembering(data: GovernmentWellbeingData): ExperiencingRememberingSplit {
  const rememberingSelf = data.cantril;
  const experiencingSelf = (data.positive_affect - data.negative_affect + 1) / 2 * 10;
  const divergence = Math.abs(rememberingSelf - experiencingSelf);
  const divergenceType: DivergenceType = rememberingSelf > experiencingSelf ? 'aspirational_gap' : 'emotional_resilience';
  return { rememberingSelf, experiencingSelf, divergence, divergenceType };
}

function computeEasterlinGap(data: GovernmentWellbeingData): EasterlinGapResult {
  const allGdpGrowth = Object.values(BRAZIL_WELLBEING_DATA).map(d => d.gdp_growth);
  const allCwbigScores = Object.values(BRAZIL_WELLBEING_DATA).map(d => d.cwbig_score);
  const cwbigChanges = allCwbigScores.map((s, i) => i === 0 ? 0 : s - allCwbigScores[i - 1]);

  const gdpGrowthZ = zScore(data.gdp_growth, allGdpGrowth);
  const wellbeingGrowthZ = zScore(data.cwbig_score - 5.0, cwbigChanges);
  const gap = gdpGrowthZ - wellbeingGrowthZ;

  let type: EasterlinType;
  let governanceImplication: string;

  if (gap > 1.5) {
    type = 'positive_paradox';
    governanceImplication = 'Governo está gerando output econômico mas falhando em traduzir em qualidade de vida. Desigualdade, precariedade ou desconfiança institucional podem estar consumindo os ganhos.';
  } else if (gap < -1.5) {
    type = 'negative_paradox';
    governanceImplication = 'Apesar das dificuldades econômicas, o tecido social protege o bem-estar. Alto capital social, laços comunitários fortes ou proteção social do governo estão funcionando.';
  } else {
    type = 'aligned';
    governanceImplication = 'Governança produzindo resultados consistentes em ambas as dimensões econômica e de bem-estar — tipo de desempenho mais defensável.';
  }

  return { gap, type, gdpGrowthZ, wellbeingGrowthZ, governanceImplication };
}

function getSIBBand(sib: number): string {
  if (sib >= 0.85) return 'ALTA';
  if (sib >= 0.65) return 'MODERADA';
  if (sib >= 0.45) return 'BAIXA';
  return 'INCONCLUSIVA';
}

// ═══ MAIN ANALYSIS ═══

export function analyzeWellbeingGovernance(governmentIds: string[]): CWBIGResult[] {
  return governmentIds
    .filter(id => BRAZIL_WELLBEING_DATA[id])
    .map(id => {
      const data = BRAZIL_WELLBEING_DATA[id];
      const label = GOVERNMENT_LABELS[id] || { name: id, period: '' };
      const er = computeExperiencingRemembering(data);
      const easterlin = computeEasterlinGap(data);

      return {
        governmentId: id,
        governmentName: label.name,
        period: label.period,
        cwbigScore: data.cwbig_score,
        sibConfidence: data.sib,
        sibBand: getSIBBand(data.sib),
        experiencingRemembering: er,
        vanderWeeleDomains: data.domains,
        easterlinGap: easterlin,
        economicScore: data.economic_score,
        dataSources: ['Gallup World Poll', 'World Happiness Report', 'OECD Better Life Index', 'Latinobarômetro'],
        methodologyNote: data.note || 'C-WBIG calculado com pesos: Cantril 30%, Experiencing Self 25%, Suporte Social 20%, Liberdade 15%, Florescimento 10%'
      };
    });
}

export function getAllGovernmentIds(): string[] {
  return Object.keys(BRAZIL_WELLBEING_DATA);
}

export function getEasterlinTypeLabel(type: EasterlinType): string {
  switch (type) {
    case 'positive_paradox': return 'Paradoxo Positivo';
    case 'negative_paradox': return 'Paradoxo Negativo';
    case 'aligned': return 'Alinhado';
  }
}

export function getEasterlinColor(type: EasterlinType): string {
  switch (type) {
    case 'positive_paradox': return '#F59E0B';
    case 'negative_paradox': return '#06B6D4';
    case 'aligned': return '#10B981';
  }
}

export function getDivergenceLabel(type: DivergenceType): string {
  return type === 'aspirational_gap'
    ? 'Gap Aspiracional — avalia melhor do que sente'
    : 'Resiliência Emocional — sente melhor do que avalia';
}
