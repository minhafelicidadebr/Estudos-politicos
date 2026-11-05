/**
 * Fiscal Impact Microsimulation Engine (JSON_26)
 * Household fiscal impact microsimulation using calibrated transmission coefficients
 * 100% deterministic — NEVER LLM for financial calculations
 * Based on: Orcutt (1957), Piketty (2013), Mankiw (2021), Lusardi & Mitchell (2014)
 */

// ═══ TYPES ═══

export type IncomeBracket = 'bracket_1' | 'bracket_2' | 'bracket_3' | 'bracket_4' | 'bracket_5';
export type FiscalEmploymentType = 'clt' | 'autonomo_mei' | 'servidor_publico' | 'aposentado' | 'estudante';
export type PropertyStatus = 'financiamento_ativo' | 'imovel_quitado' | 'aluguel' | 'sem_imovel';
export type InvestmentProfile = 'renda_fixa' | 'sem_investimentos' | 'acoes_fundos' | 'previdencia_privada';

export interface HouseholdProfile {
  incomeBracket: IncomeBracket;
  employmentType: FiscalEmploymentType;
  propertyStatus: PropertyStatus;
  investmentProfile: InvestmentProfile;
}

export interface ChannelBreakdown {
  inflation: number;
  interestRate: number;
  laborMarket: number;
  publicService: number;
  taxBurden: number;
}

export interface UncertaintyBand {
  p10: number;
  p50: number;
  p90: number;
}

export interface FiscalImpactResult {
  governmentId: string;
  governmentName: string;
  period: string;
  monthlyImpact: number;
  annualImpact: number;
  mandateCumulative: number;
  channels: ChannelBreakdown;
  channelSibs: ChannelBreakdown;
  sibOverall: number;
  sibBand: string;
  uncertaintyBand: UncertaintyBand;
  dominantChannel: string;
  dominantChannelLabel: string;
  aamFlags: string[];
}

// ═══ CONSTANTS ═══

const INCOME_MIDPOINTS: Record<IncomeBracket, number> = {
  bracket_1: 2000,
  bracket_2: 5000,
  bracket_3: 11000,
  bracket_4: 22500,
  bracket_5: 45000,
};

export const INCOME_LABELS: Record<IncomeBracket, string> = {
  bracket_1: 'R$ 1.000–3.000',
  bracket_2: 'R$ 3.000–7.000',
  bracket_3: 'R$ 7.000–15.000',
  bracket_4: 'R$ 15.000–30.000',
  bracket_5: 'R$ 30.000+',
};

export const EMPLOYMENT_LABELS: Record<FiscalEmploymentType, string> = {
  clt: 'CLT (Carteira assinada)',
  autonomo_mei: 'Autônomo / MEI',
  servidor_publico: 'Servidor Público',
  aposentado: 'Aposentado(a)',
  estudante: 'Estudante',
};

export const PROPERTY_LABELS: Record<PropertyStatus, string> = {
  financiamento_ativo: 'Financiamento ativo',
  imovel_quitado: 'Imóvel quitado',
  aluguel: 'Aluguel',
  sem_imovel: 'Sem imóvel próprio',
};

export const INVESTMENT_LABELS: Record<InvestmentProfile, string> = {
  renda_fixa: 'Renda fixa predominante',
  sem_investimentos: 'Sem investimentos',
  acoes_fundos: 'Ações e fundos',
  previdencia_privada: 'Previdência privada',
};

// ═══ GOVERNMENT FISCAL PARAMETERS ═══

interface GovernmentFiscalParams {
  name: string;
  period: string;
  mandateYears: number;
  avg_inflation: number;
  avg_selic_real: number;
  primary_result: number;
  gdp_growth: number;
  tax_burden: number;
  service_quality: number;
  sib: number;
}

const GOV_PARAMS: Record<string, GovernmentFiscalParams> = {
  'br-fhc1':      { name: 'FHC I', period: '1995–1998', mandateYears: 4, avg_inflation: 12.0, avg_selic_real: 14.2, primary_result: 0.3, gdp_growth: 2.4, tax_burden: 27.5, service_quality: 4.8, sib: 0.75 },
  'br-fhc2':      { name: 'FHC II', period: '1999–2002', mandateYears: 4, avg_inflation: 8.2, avg_selic_real: 11.5, primary_result: 1.8, gdp_growth: 2.1, tax_burden: 29.8, service_quality: 5.1, sib: 0.78 },
  'br-lula1':     { name: 'Lula I', period: '2003–2006', mandateYears: 4, avg_inflation: 7.4, avg_selic_real: 10.2, primary_result: 2.4, gdp_growth: 4.2, tax_burden: 32.1, service_quality: 5.8, sib: 0.82 },
  'br-lula2':     { name: 'Lula II', period: '2007–2010', mandateYears: 4, avg_inflation: 5.1, avg_selic_real: 5.8, primary_result: 2.8, gdp_growth: 5.1, tax_burden: 33.5, service_quality: 6.4, sib: 0.84 },
  'br-dilma1':    { name: 'Dilma I', period: '2011–2014', mandateYears: 4, avg_inflation: 6.2, avg_selic_real: 2.1, primary_result: 2.0, gdp_growth: 2.4, tax_burden: 34.8, service_quality: 5.5, sib: 0.81 },
  'br-dilma2':    { name: 'Dilma II', period: '2015–2016', mandateYears: 2, avg_inflation: 8.9, avg_selic_real: -0.5, primary_result: -1.8, gdp_growth: -3.5, tax_burden: 32.2, service_quality: 4.2, sib: 0.80 },
  'br-temer':     { name: 'Temer', period: '2016–2018', mandateYears: 2, avg_inflation: 3.9, avg_selic_real: 4.2, primary_result: -2.1, gdp_growth: 1.2, tax_burden: 32.8, service_quality: 4.5, sib: 0.78 },
  'br-bolsonaro': { name: 'Bolsonaro', period: '2019–2022', mandateYears: 4, avg_inflation: 7.8, avg_selic_real: 1.2, primary_result: -6.2, gdp_growth: 1.5, tax_burden: 31.9, service_quality: 4.0, sib: 0.83 },
  'br-lula3':     { name: 'Lula III', period: '2023–presente', mandateYears: 2, avg_inflation: 4.6, avg_selic_real: 6.8, primary_result: -0.8, gdp_growth: 3.1, tax_burden: 33.2, service_quality: 5.6, sib: 0.72 },
};

// ═══ CALIBRATION COEFFICIENTS ═══

const TARGET_INFLATION = 3.0;
const NEUTRAL_SELIC = 5.5;
const GDP_EMPLOYMENT_ELASTICITY = 0.45;
const FISCAL_WAGE_COEFFICIENT = 0.28;

const IRRF_BY_BRACKET: Record<IncomeBracket, number> = {
  bracket_1: 0.0,
  bracket_2: 0.075,
  bracket_3: 0.15,
  bracket_4: 0.225,
  bracket_5: 0.275,
};

const SELIC_SENSITIVITY: Record<PropertyStatus, number> = {
  financiamento_ativo: 0.85,
  imovel_quitado: 0.10,
  aluguel: 0.30,
  sem_imovel: 0.15,
};

const CHANNEL_SIBS = {
  inflation: 0.73,
  interestRate: 0.68,
  laborMarket: 0.70,
  publicService: 0.60,
  taxBurden: 0.82,
};

const CHANNEL_LABELS: Record<string, string> = {
  inflation: 'Canal Inflacionário',
  interestRate: 'Canal da Taxa de Juros',
  laborMarket: 'Canal do Mercado de Trabalho',
  publicService: 'Canal dos Serviços Públicos',
  taxBurden: 'Canal da Carga Tributária',
};

// ═══ CORE MICROSIMULATION ═══

export function computeFiscalImpact(
  profile: HouseholdProfile,
  governmentId: string
): FiscalImpactResult | null {
  const gov = GOV_PARAMS[governmentId];
  if (!gov) return null;

  const monthlyIncome = INCOME_MIDPOINTS[profile.incomeBracket];
  const annualIncome = monthlyIncome * 12;

  // Channel 1: Inflation
  const excessInflation = Math.max(0, gov.avg_inflation - TARGET_INFLATION);
  const inflationImpact = -(annualIncome * excessInflation / 100);

  // Channel 2: Interest Rate
  const selicExcess = gov.avg_selic_real - NEUTRAL_SELIC;
  const sensitivity = SELIC_SENSITIVITY[profile.propertyStatus];
  const estimatedDebt = profile.propertyStatus === 'financiamento_ativo' ? annualIncome * 3 : annualIncome * 0.3;
  const interestImpact = -(estimatedDebt * Math.max(0, selicExcess) * sensitivity / 100);

  // Channel 3: Labor Market
  const employmentExposure = profile.employmentType === 'servidor_publico' ? 0.15 :
    profile.employmentType === 'aposentado' ? 0.05 :
    profile.employmentType === 'estudante' ? 0.20 : 1.0;
  const wageGrowthDelta = gov.gdp_growth * FISCAL_WAGE_COEFFICIENT;
  const laborImpact = wageGrowthDelta * annualIncome / 100 * employmentExposure;

  // Channel 4: Public Services
  const serviceOffset = (gov.service_quality / 10) * 0.22;
  const basePrivateSpending = annualIncome * 0.15;
  const publicServiceImpact = basePrivateSpending * (serviceOffset - 0.11);

  // Channel 5: Tax Burden
  const baseTaxRate = IRRF_BY_BRACKET[profile.incomeBracket];
  const taxChange = (gov.tax_burden - 31.0) / 100;
  const taxImpact = -(taxChange * baseTaxRate * annualIncome);

  const channels: ChannelBreakdown = {
    inflation: Math.round(inflationImpact),
    interestRate: Math.round(interestImpact),
    laborMarket: Math.round(laborImpact),
    publicService: Math.round(publicServiceImpact),
    taxBurden: Math.round(taxImpact),
  };

  const annualTotal = Object.values(channels).reduce((a, b) => a + b, 0);
  const monthlyTotal = Math.round(annualTotal / 12);

  // Find dominant channel
  const channelEntries = Object.entries(channels) as [keyof ChannelBreakdown, number][];
  const dominant = channelEntries.reduce((max, entry) =>
    Math.abs(entry[1]) > Math.abs(max[1]) ? entry : max
  );

  // SIB overall
  const sibOverall = Math.min(
    gov.sib,
    0.75 // ceiling per JSON_26 specification
  );

  // Uncertainty band (delta method approximation)
  const totalAbs = Math.abs(annualTotal);
  const uncertaintyFactor = 1 - sibOverall;

  const aamFlags: string[] = [];
  if (sibOverall < 0.70) aamFlags.push('CONFIANCA_BAIXA');
  if (gov.mandateYears < 4) aamFlags.push('DADO_PRELIMINAR');
  if (profile.employmentType === 'estudante') aamFlags.push('INFERENCIA_NAO_FATO');

  return {
    governmentId,
    governmentName: gov.name,
    period: gov.period,
    monthlyImpact: monthlyTotal,
    annualImpact: annualTotal,
    mandateCumulative: annualTotal * gov.mandateYears,
    channels,
    channelSibs: { ...CHANNEL_SIBS } as unknown as ChannelBreakdown,
    sibOverall,
    sibBand: sibOverall >= 0.65 ? 'MODERADA' : sibOverall >= 0.45 ? 'BAIXA' : 'INCONCLUSIVA',
    uncertaintyBand: {
      p10: Math.round(annualTotal - totalAbs * uncertaintyFactor),
      p50: annualTotal,
      p90: Math.round(annualTotal + totalAbs * uncertaintyFactor),
    },
    dominantChannel: dominant[0],
    dominantChannelLabel: CHANNEL_LABELS[dominant[0]] || dominant[0],
    aamFlags,
  };
}

export function getAvailableGovernments(): { id: string; name: string; period: string }[] {
  return Object.entries(GOV_PARAMS).map(([id, g]) => ({ id, name: g.name, period: g.period }));
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  return `${sign} R$ ${abs.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
