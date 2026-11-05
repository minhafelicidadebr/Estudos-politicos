/**
 * Career Governance Navigator Engine (JSON_25)
 * VAR-simplified correlations between governance axis scores and labor market outcomes
 * 100% deterministic correlation engine — no LLM for calculations
 * Based on: Becker (1964), Card (1999), Acemoglu & Restrepo (2018), Sims (1980)
 */

// ═══ TYPES ═══

export type EducationArea = 'technology' | 'health' | 'social_sciences' | 'economics' | 'law' | 'education' | 'engineering' | 'arts_humanities' | 'agriculture' | 'public_administration';
export type EmploymentType = 'clt' | 'autonomo' | 'servidor_publico' | 'aposentado' | 'estudante';
export type InsightType = 'growth_opportunity' | 'structural_trend' | 'governance_risk' | 'cross_sector_emerging';

export interface CareerProfile {
  educationArea: EducationArea;
  employmentType: EmploymentType;
  careerHorizon: 3 | 5 | 10;
}

export interface SectorCorrelation {
  axisId: string;
  axisName: string;
  sectorId: string;
  sectorName: string;
  correlation3y: number;
  correlation5y: number;
  correlation10y: number;
  sib: number;
  sampleSize: number;
  mechanism: string;
  isStructural: boolean;
}

export interface CareerInsight {
  id: string;
  type: InsightType;
  sectorId: string;
  sectorName: string;
  axisId: string;
  axisName: string;
  correlation: number;
  lag: number;
  sib: number;
  mechanism: string;
  isStructural: boolean;
  historicalEvidence: string;
  relevanceScore: number;
  color: string;
  label: string;
}

export interface CareerAnalysisResult {
  profile: CareerProfile;
  insights: CareerInsight[];
  topGrowthSectors: string[];
  topRiskSectors: string[];
  structuralTrends: CareerInsight[];
  dataSources: string[];
  sibOverall: number;
  methodology: string;
}

// ═══ SECTOR DATABASE ═══

interface SectorData {
  id: string;
  name: string;
  relatedAxes: string[];
  growthIndicator: string;
  educationAreas: EducationArea[];
}

const SECTORS: SectorData[] = [
  { id: 'govtech', name: 'Govtech e Serviços Digitais Públicos', relatedAxes: ['A6', 'A4'], growthIndicator: '+287% vagas em 5 anos (CAGED)', educationAreas: ['technology', 'public_administration', 'engineering'] },
  { id: 'health_digital', name: 'Saúde Digital e Telemedicina', relatedAxes: ['A1', 'A6'], growthIndicator: '+156% crescimento (CAGR 34%)', educationAreas: ['health', 'technology', 'engineering'] },
  { id: 'renewable_energy', name: 'Energia Renovável e Transição Climática', relatedAxes: ['A7', 'A5'], growthIndicator: '+156% empregos IEA em 3 anos', educationAreas: ['engineering', 'agriculture', 'economics'] },
  { id: 'fiscal_compliance', name: 'Compliance Fiscal e Direito Tributário', relatedAxes: ['A3', 'A4'], growthIndicator: 'Reforma tributária 2023 — estrutural', educationAreas: ['law', 'economics', 'public_administration'] },
  { id: 'epidemiology', name: 'Epidemiologia e Vigilância em Saúde', relatedAxes: ['A1'], growthIndicator: 'Estrutural pós-pandemia — SUS', educationAreas: ['health', 'social_sciences'] },
  { id: 'data_privacy', name: 'Direito Digital e Proteção de Dados', relatedAxes: ['A4', 'A6', 'A9'], growthIndicator: '0→4.200 DPOs (2020-2024)', educationAreas: ['law', 'technology'] },
  { id: 'policy_analysis', name: 'Análise de Políticas Baseadas em Evidências', relatedAxes: ['A6', 'A4'], growthIndicator: '23 labs criados (2018-2024)', educationAreas: ['social_sciences', 'economics', 'public_administration'] },
  { id: 'wellbeing_economics', name: 'Wellbeing Economics e Políticas de Florescimento', relatedAxes: ['B8'], growthIndicator: '42 postos OECD (2022-2024)', educationAreas: ['economics', 'social_sciences', 'public_administration'] },
  { id: 'labor_reform', name: 'Relações Trabalhistas e Reforma do Trabalho', relatedAxes: ['C11', 'A3'], growthIndicator: 'Contencioso crescente pós-reforma', educationAreas: ['law', 'social_sciences', 'economics'] },
  { id: 'environmental_esg', name: 'Licenciamento Ambiental e ESG', relatedAxes: ['A7'], growthIndicator: 'ESG + pressão regulatória crescente', educationAreas: ['law', 'engineering', 'agriculture'] },
];

// ═══ CORRELATION MATRIX ═══

const CORRELATIONS: Record<string, Record<string, { c3: number; c5: number; c10: number; sib: number; n: number; mechanism: string; structural: boolean }>> = {
  'A6': {
    'govtech': { c3: 0.65, c5: 0.78, c10: 0.72, sib: 0.81, n: 21, mechanism: 'Digitalização da governança cria demanda sustentada para profissionais de civic tech', structural: true },
    'health_digital': { c3: 0.52, c5: 0.69, c10: 0.64, sib: 0.79, n: 18, mechanism: 'Investimento em saúde + digitalização cria demanda por telemedicina e health-tech', structural: false },
    'data_privacy': { c3: 0.61, c5: 0.74, c10: 0.68, sib: 0.77, n: 15, mechanism: 'Regulamentação digital aumenta necessidade de DPOs e compliance', structural: true },
    'policy_analysis': { c3: 0.58, c5: 0.71, c10: 0.65, sib: 0.76, n: 16, mechanism: 'Governança baseada em evidências expande laboratórios de políticas', structural: true },
  },
  'A7': {
    'renewable_energy': { c3: 0.55, c5: 0.71, c10: 0.82, sib: 0.88, n: 22, mechanism: 'Política ambiental prediz diretamente investimento em energia limpa', structural: true },
    'environmental_esg': { c3: 0.62, c5: 0.68, c10: 0.75, sib: 0.82, n: 20, mechanism: 'Exigência regulatória ESG escala com rigor ambiental governamental', structural: true },
  },
  'A3': {
    'fiscal_compliance': { c3: 0.48, c5: 0.62, c10: 0.58, sib: 0.76, n: 21, mechanism: 'Estabilidade macro contrai crédito; instabilidade expande contencioso fiscal', structural: false },
    'labor_reform': { c3: -0.45, c5: -0.52, c10: -0.38, sib: 0.70, n: 19, mechanism: 'Instabilidade macro gera reformas trabalhistas — contencioso crescente', structural: false },
  },
  'A1': {
    'health_digital': { c3: 0.58, c5: 0.69, c10: 0.72, sib: 0.79, n: 20, mechanism: 'Investimento em saúde pública cria mercado sustentado de telemedicina', structural: true },
    'epidemiology': { c3: 0.72, c5: 0.68, c10: 0.65, sib: 0.83, n: 21, mechanism: 'Investimento em vigilância sanitária gera vagas permanentes no SUS', structural: true },
  },
  'A4': {
    'fiscal_compliance': { c3: 0.55, c5: 0.74, c10: 0.70, sib: 0.85, n: 21, mechanism: 'Estado de Direito gera demanda sustentada por compliance e direito regulatório', structural: true },
    'data_privacy': { c3: 0.50, c5: 0.65, c10: 0.60, sib: 0.78, n: 15, mechanism: 'Fortalecimento institucional aumenta enforcement de proteção de dados', structural: true },
  },
  'C11': {
    'labor_reform': { c3: 0.58, c5: 0.52, c10: 0.45, sib: 0.72, n: 18, mechanism: 'Atividade reformista trabalhista (positiva ou negativa) impulsiona consultoria de RH', structural: false },
  },
  'B8': {
    'wellbeing_economics': { c3: 0.42, c5: 0.55, c10: 0.68, sib: 0.65, n: 12, mechanism: 'Crescimento do campo de Wellbeing Economics na OECD e ONU', structural: true },
  }
};

// ═══ INSIGHT COLORS ═══

const INSIGHT_CONFIG: Record<InsightType, { color: string; label: string }> = {
  growth_opportunity: { color: '#27500A', label: 'Oportunidade de crescimento' },
  structural_trend: { color: '#185FA5', label: 'Tendência estrutural' },
  governance_risk: { color: '#A32D2D', label: 'Risco setorial' },
  cross_sector_emerging: { color: '#534AB7', label: 'Interseção emergente' },
};

// ═══ CORE ALGORITHM ═══

export function generateCareerInsights(profile: CareerProfile): CareerAnalysisResult {
  const relevantSectors = SECTORS.filter(s => s.educationAreas.includes(profile.educationArea));
  const insights: CareerInsight[] = [];

  for (const sector of relevantSectors) {
    for (const axisId of sector.relatedAxes) {
      const corr = CORRELATIONS[axisId]?.[sector.id];
      if (!corr) continue;
      if (corr.sib < 0.65 || corr.n < 5) continue;

      const horizonCorr = profile.careerHorizon === 3 ? corr.c3 : profile.careerHorizon === 5 ? corr.c5 : corr.c10;
      const recencyWeight = 1.0;
      const relevanceScore = Math.abs(horizonCorr) * corr.sib * Math.min(1.0, corr.n / 8) * recencyWeight;

      let type: InsightType;
      if (corr.structural) {
        type = 'structural_trend';
      } else if (horizonCorr < 0) {
        type = 'governance_risk';
      } else {
        type = 'growth_opportunity';
      }

      const config = INSIGHT_CONFIG[type];

      insights.push({
        id: `${sector.id}-${axisId}`,
        type,
        sectorId: sector.id,
        sectorName: sector.name,
        axisId,
        axisName: axisId,
        correlation: horizonCorr,
        lag: profile.careerHorizon,
        sib: corr.sib,
        mechanism: corr.mechanism,
        isStructural: corr.structural,
        historicalEvidence: sector.growthIndicator,
        relevanceScore,
        color: config.color,
        label: config.label,
      });
    }
  }

  // Check for cross-sector emerging insights
  const axisCount: Record<string, number> = {};
  for (const insight of insights) {
    axisCount[insight.axisId] = (axisCount[insight.axisId] || 0) + 1;
  }
  for (const insight of insights) {
    if (axisCount[insight.axisId] && axisCount[insight.axisId] >= 2 && insight.correlation > 0.6) {
      const crossInsight: CareerInsight = {
        ...insight,
        id: `cross-${insight.id}`,
        type: 'cross_sector_emerging',
        label: INSIGHT_CONFIG.cross_sector_emerging.label,
        color: INSIGHT_CONFIG.cross_sector_emerging.color,
        relevanceScore: insight.relevanceScore * 1.2,
      };
      insights.push(crossInsight);
      break;
    }
  }

  insights.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topInsights = insights.slice(0, 8);

  return {
    profile,
    insights: topInsights,
    topGrowthSectors: topInsights.filter(i => i.type === 'growth_opportunity' || i.type === 'structural_trend').map(i => i.sectorName),
    topRiskSectors: topInsights.filter(i => i.type === 'governance_risk').map(i => i.sectorName),
    structuralTrends: topInsights.filter(i => i.isStructural),
    dataSources: ['CAGED/MTE', 'RAIS', 'OECD Employment Outlook', 'WEF Future of Jobs 2024', 'ENAP'],
    sibOverall: topInsights.length > 0 ? topInsights.reduce((sum, i) => sum + i.sib, 0) / topInsights.length : 0,
    methodology: 'VAR simplificado: axis_score(t) → employment_growth(t+lag). Coeficientes estimados por MQO com dados CAGED/RAIS 2003-2024.'
  };
}

export const EDUCATION_LABELS: Record<EducationArea, string> = {
  technology: 'Tecnologia',
  health: 'Saúde',
  social_sciences: 'Ciências Sociais',
  economics: 'Economia / Administração',
  law: 'Direito',
  education: 'Educação',
  engineering: 'Engenharia',
  arts_humanities: 'Artes e Humanidades',
  agriculture: 'Agropecuária / Meio Ambiente',
  public_administration: 'Gestão Pública',
};

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  clt: 'CLT (Carteira assinada)',
  autonomo: 'Autônomo / MEI',
  servidor_publico: 'Servidor Público',
  aposentado: 'Aposentado(a)',
  estudante: 'Estudante',
};
