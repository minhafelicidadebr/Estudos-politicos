/**
 * ÁGORA FABLE 5.0 — Canonical Registry of Scientific & Statistical Sources (Section 8)
 *
 * Maps institutions by country, thematic axis, information nature, perceptual character,
 * and underlying primary dataset originGroup to prevent echo-chamber source inflation.
 */

import type { SourceInformationNature } from '@/types/evidence';

export interface CanonicalSourceEntry {
  id: string;
  institution: string;
  shortName: string;
  aliases: string[];
  countryScope: ('BR' | 'US' | 'DE' | 'UY' | 'GLOBAL')[];
  appropriateAxes: string[]; // E.g. ['A1', 'A2', 'A3', ...]
  informationNature: SourceInformationNature;
  isPerceptualIndex: boolean;
  canonicalOriginGroup: string;
  officialDomains: string[];
  methodologySummary: string;
  knownLimitations: string;
}

export const CANONICAL_SOURCE_REGISTRY: CanonicalSourceEntry[] = [
  // ── BRASIL (Órgãos Públicos e Institutos Oficiais) ──────────────────────────
  {
    id: 'SRC-BR-IBGE',
    institution: 'Instituto Brasileiro de Geografia e Estatística (IBGE / SIDRA)',
    shortName: 'IBGE',
    aliases: ['ibge', 'sidra', 'pnad', 'pnad continua', 'pnad contínua', 'censo ibge', 'ipca ibge', 'contas nacionais ibge'],
    countryScope: ['BR'],
    appropriateAxes: ['A1', 'A2', 'A3', 'A6', 'C1', 'C2', 'C4', 'C8', 'C11'],
    informationNature: 'PRIMARY_OFFICIAL_DATASET',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_IBGE',
    officialDomains: ['ibge.gov.br', 'sidra.ibge.gov.br'],
    methodologySummary: 'Pesquisas domiciliares amostrais probabilísticas (PNAD Contínua), Censo Demográfico e Sistema de Contas Nacionais.',
    knownLimitations: 'Quebra metodológica entre PNAD antiga e PNAD Contínua (2012); revisões periódicas de séries do PIB.',
  },
  {
    id: 'SRC-BR-BCB',
    institution: 'Banco Central do Brasil (BCB / SGS)',
    shortName: 'BCB',
    aliases: ['banco central do brasil', 'bcb', 'bacen', 'sgs bcb', 'banco central'],
    countryScope: ['BR'],
    appropriateAxes: ['A3', 'A6', 'A8', 'B6'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_BCB',
    officialDomains: ['bcb.gov.br'],
    methodologySummary: 'Registros administrativos monetários, cambiais, fiscais, balanço de pagamentos e estatísticas de pagamentos (PIX).',
    knownLimitations: 'Mudanças metodológicas no cálculo da dívida líquida/bruta em relação ao padrão FMI.',
  },
  {
    id: 'SRC-BR-IPEA',
    institution: 'Instituto de Pesquisa Econômica Aplicada (Ipea / Ipeadata)',
    shortName: 'Ipea',
    aliases: ['ipea', 'ipeadata', 'atlas da violencia', 'atlas da violência'],
    countryScope: ['BR'],
    appropriateAxes: ['A3', 'A8', 'B1', 'C1', 'C2', 'C8', 'C11'],
    informationNature: 'PRIMARY_OFFICIAL_DATASET',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_IPEA',
    officialDomains: ['ipea.gov.br', 'ipeadata.gov.br'],
    methodologySummary: 'Consolidação de séries históricas macroeconômicas, sociais e microdados de segurança (SIM/DATASUS + SINAN no Atlas da Violência).',
    knownLimitations: 'Séries agregadas no Ipeadata frequentemente espelham dados primários do IBGE, BCB ou DATASUS (verificar origem primária para não duplicar).',
  },
  {
    id: 'SRC-BR-STN',
    institution: 'Secretaria do Tesouro Nacional (STN / Siconfi)',
    shortName: 'Tesouro Nacional',
    aliases: ['tesouro nacional', 'stn', 'siconfi', 'tesouro transparente'],
    countryScope: ['BR'],
    appropriateAxes: ['A3', 'B2', 'B6'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_STN',
    officialDomains: ['tesourotransparente.gov.br', 'gov.br/tesouronacional', 'siconfi.tesouro.gov.br'],
    methodologySummary: 'Contabilidade pública federal e subnacional (RREO, RGF, Resultado do Tesouro Nacional — acima da linha).',
    knownLimitations: 'Diferenças contábeis entre resultado primário acima da linha (STN) e abaixo da linha (BCB).',
  },
  {
    id: 'SRC-BR-INEP',
    institution: 'Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP)',
    shortName: 'INEP',
    aliases: ['inep', 'censo escolar', 'saeb', 'ideb', 'enem', 'censo da educacao superior'],
    countryScope: ['BR'],
    appropriateAxes: ['A1', 'A2', 'C2'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_INEP',
    officialDomains: ['gov.br/inep', 'inep.gov.br'],
    methodologySummary: 'Censo Escolar anual, avaliações padronizadas (SAEB/IDEB) e Censo da Educação Superior.',
    knownLimitations: 'Efeitos de pandemia (2020–2021) nas taxas de aprovação e participação no SAEB.',
  },
  {
    id: 'SRC-BR-DATASUS',
    institution: 'Departamento de Informática do SUS (DATASUS / Ministério da Saúde)',
    shortName: 'DATASUS',
    aliases: ['datasus', 'ministerio da saude', 'ministério da saúde', 'sim datasus', 'sinasc', 'si-pni'],
    countryScope: ['BR'],
    appropriateAxes: ['A1', 'A8', 'A9', 'B1'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_DATASUS',
    officialDomains: ['datasus.saude.gov.br', 'saude.gov.br', 'gov.br/saude'],
    methodologySummary: 'Sistemas de informação em saúde (SIM, SINASC, SIH, SI-PNI) de cobertura nacional.',
    knownLimitations: 'Defasagem de consolidação de 12 a 18 meses para dados definitivos de mortalidade; subnotificação regional variável.',
  },
  {
    id: 'SRC-BR-TSE',
    institution: 'Tribunal Superior Eleitoral (TSE)',
    shortName: 'TSE',
    aliases: ['tse', 'tribunal superior eleitoral', 'dados eleitorais tse'],
    countryScope: ['BR'],
    appropriateAxes: ['A4', 'B3', 'C1'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_TSE',
    officialDomains: ['tse.jus.br', 'dadosabertos.tse.jus.br'],
    methodologySummary: 'Registros oficiais de candidaturas, resultados eleitorais, comparecimento e prestação de contas.',
    knownLimitations: 'Mudanças nas regras de financiamento eleitoral (2015/2017) afetam comparabilidade longitudinal de gastos de campanha.',
  },
  {
    id: 'SRC-BR-TCU',
    institution: 'Tribunal de Contas da União (TCU)',
    shortName: 'TCU',
    aliases: ['tcu', 'tribunal de contas da uniao', 'tribunal de contas da união', 'relatorio de fiscalizacao tcu'],
    countryScope: ['BR'],
    appropriateAxes: ['A3', 'A4', 'A6', 'B6', 'C9'],
    informationNature: 'ADMINISTRATIVE_RECORD',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_TCU',
    officialDomains: ['portal.tcu.gov.br', 'tcu.gov.br'],
    methodologySummary: 'Auditorias operacionais, pareceres prévios sobre as contas do Governo da República e índices de governança pública (iGG).',
    knownLimitations: 'Auditorias têm escopo focalizado e não substituem séries estatísticas contínuas.',
  },
  {
    id: 'SRC-BR-INPE',
    institution: 'Instituto Nacional de Pesquisas Espaciais (INPE / PRODES / DETER)',
    shortName: 'INPE',
    aliases: ['inpe', 'prodes', 'deter', 'terrabrasilis'],
    countryScope: ['BR'],
    appropriateAxes: ['A2', 'A7', 'C10'],
    informationNature: 'PRIMARY_OFFICIAL_DATASET',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_INPE',
    officialDomains: ['inpe.br', 'terrabrasilis.dpi.inpe.br'],
    methodologySummary: 'Monitoramento por sensoriamento remoto orbital (PRODES para taxa anual consolidada; DETER para alertas rápidos).',
    knownLimitations: 'Ano-referência PRODES vai de agosto do ano anterior a julho do ano corrente; não confundir alerta DETER com taxa anual consolidada PRODES.',
  },
  {
    id: 'SRC-BR-FBSP',
    institution: 'Fórum Brasileiro de Segurança Pública (FBSP)',
    shortName: 'FBSP',
    aliases: ['fbsp', 'forum brasileiro de seguranca publica', 'fórum brasileiro de segurança pública', 'anuario brasileiro de seguranca publica'],
    countryScope: ['BR'],
    appropriateAxes: ['A8', 'B1', 'C1'],
    informationNature: 'PRIMARY_OFFICIAL_DATASET',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_BR_FBSP',
    officialDomains: ['forumseguranca.org.br'],
    methodologySummary: 'Compilação padronizada de registros policiais estaduais via LAI (Mortes Violentas Intencionais — MVI).',
    knownLimitations: 'Depende da qualidade de classificação das secretarias estaduais de segurança; quando cruzado com Atlas da Violência (DATASUS), compartilha base de mortalidade.',
  },

  // ── COMPARAÇÕES INTERNACIONAIS (Organismos Multilaterais) ──────────────────
  {
    id: 'SRC-INT-WB',
    institution: 'Banco Mundial — World Development Indicators (WDI)',
    shortName: 'Banco Mundial',
    aliases: ['banco mundial', 'world bank', 'wb', 'wdi', 'world development indicators', 'gov_effectiveness wb'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A1', 'A2', 'A3', 'A5', 'A6', 'A7', 'B2', 'C1', 'C4', 'C8', 'C11'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_WORLDBANK',
    officialDomains: ['worldbank.org', 'data.worldbank.org'],
    methodologySummary: 'Séries harmonizadas internacionalmente a partir de institutos nacionais de estatística, FMI, ONU e pesquisas padronizadas.',
    knownLimitations: 'Para dados nacionais (ex.: PIB do Brasil), o WDI reempacota dados do instituto nacional (ex.: IBGE) — não contar como fonte primária independente do instituto nacional.',
  },
  {
    id: 'SRC-INT-IMF',
    institution: 'Fundo Monetário Internacional — World Economic Outlook (FMI / WEO)',
    shortName: 'FMI',
    aliases: ['fmi', 'imf', 'fmi weo', 'imf weo', 'world economic outlook', 'fiscal monitor imf', 'fmi article iv'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A3', 'A4', 'B6'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_IMF',
    officialDomains: ['imf.org'],
    methodologySummary: 'Estatísticas macroeconômicas e fiscais harmonizadas (editions de abril e outubro do WEO e Consultas do Artigo IV).',
    knownLimitations: 'Definições harmonizadas de Dívida Bruta do Governo Geral no FMI diferem metodologicamente da metodologia nacional do BCB no Brasil.',
  },
  {
    id: 'SRC-INT-OECD',
    institution: 'Organização para a Cooperação e Desenvolvimento Econômico (OCDE / PISA)',
    shortName: 'OCDE',
    aliases: ['ocde', 'oecd', 'oecd stats', 'pisa', 'pisa ocde', 'oecd better life'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A1', 'A2', 'A3', 'A6', 'B2', 'C2', 'C4', 'C8', 'C11'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_OECD',
    officialDomains: ['oecd.org', 'data.oecd.org'],
    methodologySummary: 'Avaliações trienais padronizadas de estudantes de 15 anos (PISA) e estatísticas comparadas de políticas públicas.',
    knownLimitations: 'O PISA avalia população escolarizada de 15 anos; mudanças na taxa de matrícula líquida afetam a composição da amostra ao longo do tempo.',
  },
  {
    id: 'SRC-INT-UN',
    institution: 'Organização das Nações Unidas (PNUD / UNODC / UN DESA / CEPAL)',
    shortName: 'ONU / PNUD / CEPAL',
    aliases: ['onu', 'pnud', 'undp', 'unodc', 'un desa', 'cepal', 'eclac', 'un-habitat', 'onu mulheres', 'acnur', 'oim'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A1', 'A6', 'A7', 'A8', 'B1', 'B5', 'C1', 'C4', 'C5', 'C8'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_UN',
    officialDomains: ['un.org', 'undp.org', 'unodc.org', 'cepal.org'],
    methodologySummary: 'Índices compostos de desenvolvimento humano (IDH), governo eletrônico (EGDI), estatísticas de homicídios (UNODC) e harmonização regional (CEPAL).',
    knownLimitations: 'Mudança metodológica no cálculo do IDH em 2010 impede comparação direta com relatórios anteriores sem série recalculada.',
  },
  {
    id: 'SRC-INT-ILO',
    institution: 'Organização Internacional do Trabalho (OIT / ILOSTAT)',
    shortName: 'OIT',
    aliases: ['oit', 'ilo', 'ilostat'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['C2', 'C8', 'C11'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_ILO',
    officialDomains: ['ilo.org', 'ilostat.ilo.org'],
    methodologySummary: 'Estatísticas internacionais do mercado de trabalho padronizadas segundo as resoluções da CIET.',
    knownLimitations: 'Derivado das pesquisas nacionais de força de trabalho (ex.: PNAD Contínua no Brasil, CPS nos EUA).',
  },
  {
    id: 'SRC-INT-WHO',
    institution: 'Organização Mundial da Saúde (OMS / WHO GHO)',
    shortName: 'OMS',
    aliases: ['oms', 'who', 'who gho', 'global health observatory', 'opas'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A1', 'A9'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_WHO',
    officialDomains: ['who.int', 'paho.org'],
    methodologySummary: 'Observatório Global de Saúde: expectativa de vida, mortalidade materna/infantil, cobertura vacinal (WUENIC) e gastos em saúde (SHA 2011).',
    knownLimitations: 'Estimativas modeladas da OMS podem divergir levemente do dado administrativo bruto nacional.',
  },
  {
    id: 'SRC-INT-UNESCO',
    institution: 'Instituto de Estatística da UNESCO (UNESCO UIS)',
    shortName: 'UNESCO',
    aliases: ['unesco', 'unesco uis'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A1', 'A2', 'C6'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_UNESCO',
    officialDomains: ['unesco.org', 'uis.unesco.org'],
    methodologySummary: 'Indicadores educacionais padronizados pela classificação CINE/ISCED e estatísticas de investimento cultural.',
    knownLimitations: 'Defasagem de reporte de alguns países em séries de gasto público por nível de ensino.',
  },
  {
    id: 'SRC-INT-IEA',
    institution: 'Agência Internacional de Energia (IEA / IRENA)',
    shortName: 'IEA / IRENA',
    aliases: ['iea', 'irena', 'agencia internacional de energia', 'epe', 'mme'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A2', 'A5', 'A6', 'A7', 'B4', 'C10'],
    informationNature: 'INTERNATIONAL_HARMONIZED',
    isPerceptualIndex: false,
    canonicalOriginGroup: 'ORIGIN_INT_ENERGY',
    officialDomains: ['iea.org', 'irena.org', 'epe.gov.br'],
    methodologySummary: 'Balanços energéticos nacionais, participação de renováveis na matriz elétrica e energética total.',
    knownLimitations: 'Distinguir sempre matriz elétrica (geração de eletricidade) de matriz energética total (inclui transportes e indústria).',
  },

  // ── ÍNDICES INSTITUCIONAIS E PESQUISAS DE PERCEPÇÃO / ESPECIALISTAS ────────
  {
    id: 'SRC-IDX-VDEM',
    institution: 'Varieties of Democracy Institute (V-Dem)',
    shortName: 'V-Dem',
    aliases: ['v-dem', 'vdem', 'v-dem institute', 'varieties of democracy'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A3', 'A4', 'A9', 'B3', 'C7', 'C9'],
    informationNature: 'PERCEPTUAL_EXPERT_INDEX',
    isPerceptualIndex: true,
    canonicalOriginGroup: 'ORIGIN_IDX_VDEM',
    officialDomains: ['v-dem.net'],
    methodologySummary: 'Avaliação por codificadores especialistas agregada via modelo bayesiano de resposta ao item (IRT) com intervalos de credibilidade.',
    knownLimitations: 'INDICADOR DE AVALIAÇÃO DE ESPECIALISTAS (não é contagem administrativa). Sensível ao tamanho do painel de codificadores por país; sempre considerar intervalos de incerteza.',
  },
  {
    id: 'SRC-IDX-WJP',
    institution: 'World Justice Project — Rule of Law Index (WJP)',
    shortName: 'WJP',
    aliases: ['wjp', 'world justice project', 'rule of law index'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A3', 'A4', 'A8', 'B3', 'C9'],
    informationNature: 'PERCEPTUAL_EXPERT_INDEX',
    isPerceptualIndex: true,
    canonicalOriginGroup: 'ORIGIN_IDX_WJP',
    officialDomains: ['worldjusticeproject.org'],
    methodologySummary: 'Índice composto combinando pesquisas domiciliares (GPP) e questionários a especialistas jurídicos (QRQ).',
    knownLimitations: 'INDICADOR DE PERCEPÇÃO E AVALIAÇÃO JURÍDICA. Mudanças no número de países no ranking alteram a posição relativa mesmo sem mudança no score bruto (0–1).',
  },
  {
    id: 'SRC-IDX-TI',
    institution: 'Transparency International — Índice de Percepção da Corrupção (IPC / CPI)',
    shortName: 'Transparency International',
    aliases: ['transparency international', 'ti', 'cpi', 'ipc', 'indice de percepcao da corrupcao', 'ti cpi'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A3', 'A4', 'C9'],
    informationNature: 'PERCEPTUAL_EXPERT_INDEX',
    isPerceptualIndex: true,
    canonicalOriginGroup: 'ORIGIN_IDX_TI_CPI',
    officialDomains: ['transparency.org'],
    methodologySummary: 'Índice composto de percepção de corrupção no setor público baseado em 13 pesquisas de especialistas e executivos (escala 0–100).',
    knownLimitations: 'INDICADOR ESTRITAMENTE PERCEPTIVO: mede percepção de corrupção, não o volume real de processos ou desvios; mudança metodológica em 2012 impede comparação direta com anos anteriores.',
  },
  {
    id: 'SRC-IDX-RSF',
    institution: 'Repórteres Sem Fronteiras / Freedom House',
    shortName: 'RSF / Freedom House',
    aliases: ['rsf', 'reporteres sem fronteiras', 'repórteres sem fronteiras', 'freedom house'],
    countryScope: ['GLOBAL', 'BR', 'US', 'DE', 'UY'],
    appropriateAxes: ['A9', 'B3', 'C7'],
    informationNature: 'PERCEPTUAL_EXPERT_INDEX',
    isPerceptualIndex: true,
    canonicalOriginGroup: 'ORIGIN_IDX_MEDIA_FREEDOM',
    officialDomains: ['rsf.org', 'freedomhouse.org'],
    methodologySummary: 'Avaliação qualitativa-quantitativa de liberdade de imprensa e direitos políticos combinando questionários a especialistas e registro de incidentes.',
    knownLimitations: 'RSF reformulou a metodologia do ranking mundial de liberdade de imprensa em 2022 — proibido comparar scores pré-2022 com pós-2022 sem ressalva explícita de quebra de série.',
  },
];

// Termos que indicam agregador, wiki, blog ou fonte vaga/inventada
const AGGREGATOR_OR_VAGUE_PATTERNS = [
  /\bwikipedia\b/i,
  /\bwiki\b/i,
  /\bblog\b/i,
  /\bportal de not[ií]cias\b/i,
  /\bestudos?\s+(recentes?|sugerem|apontam|indicam)\b/i,
  /\bfontes?\s+diversas\b/i,
  /\breredes?\s+sociais\b/i,
  /\bwhatsapp\b/i,
  /\byoutube\b/i,
  /\bchatgpt\b/i,
];

const SUSPICIOUS_URL_OR_DOI_PATTERNS = [
  /example\.com/i,
  /placeholder/i,
  /fake/i,
  /inventad[oa]/i,
  /localhost/i,
  /127\.0\.0\.1/i,
  /10\.\d+\.\d+\.\d+/,
  /192\.168\.\d+\.\d+/,
  /169\.254\.169\.254/,
  /^https?:\/\/(www\.)?gov\.br\/?$/i, // URL vaga sem path
  /doi\.org\/10\.0000/i,             // DOI fictício clássico
  /doi:\s*10\.9999/i,
  /404/i,
  /inexistente/i,
];

export interface SourceLookupResult {
  matchedEntry: CanonicalSourceEntry | null;
  authorityVerified: boolean;
  isAggregatorOrVague: boolean;
  isSuspiciousUrlOrDoi: boolean;
  isAppropriateForAxis: boolean;
  originGroup: string;
  informationNature: SourceInformationNature;
  isPerceptualIndex: boolean;
}

/**
 * Looks up an institution string and optional URL/axis against the Canonical Source Registry.
 * Also maps derivative sources (e.g. World Bank WDI for Brazil GDP vs IBGE) when they share
 * an explicit originGroup or indicator.
 */
export function lookupCanonicalSource(
  institutionRaw: string,
  axisId?: string,
  urlOrDoi?: string | null,
  explicitOriginGroup?: string
): SourceLookupResult {
  const normalized = (institutionRaw || '').trim().toLowerCase();

  const isAggregatorOrVague =
    !normalized ||
    normalized.length < 2 ||
    AGGREGATOR_OR_VAGUE_PATTERNS.some((rx) => rx.test(normalized));

  const isSuspiciousUrlOrDoi = Boolean(
    urlOrDoi && SUSPICIOUS_URL_OR_DOI_PATTERNS.some((rx) => rx.test(urlOrDoi.trim()))
  );

  let matchedEntry: CanonicalSourceEntry | null = null;
  for (const entry of CANONICAL_SOURCE_REGISTRY) {
    const matchName = entry.institution.toLowerCase().includes(normalized) ||
      normalized.includes(entry.shortName.toLowerCase()) ||
      entry.aliases.some((alias) => normalized.includes(alias.toLowerCase()));
    if (matchName && normalized.length >= 2) {
      matchedEntry = entry;
      break;
    }
  }

  const isAppropriateForAxis = matchedEntry
    ? !axisId || matchedEntry.appropriateAxes.includes(axisId)
    : false;

  const originGroup = explicitOriginGroup?.trim()
    ? explicitOriginGroup.trim().toUpperCase()
    : matchedEntry
    ? matchedEntry.canonicalOriginGroup
    : `UNREGISTERED_${normalized.replace(/[^a-z0-9]/g, '_').toUpperCase() || 'UNKNOWN'}`;

  return {
    matchedEntry,
    authorityVerified: Boolean(matchedEntry && !isAggregatorOrVague && !isSuspiciousUrlOrDoi),
    isAggregatorOrVague,
    isSuspiciousUrlOrDoi,
    isAppropriateForAxis,
    originGroup,
    informationNature: isAggregatorOrVague
      ? 'SECONDARY_REPRODUCTION'
      : matchedEntry?.informationNature ?? 'UNREGISTERED_SOURCE',
    isPerceptualIndex: matchedEntry?.isPerceptualIndex ?? false,
  };
}

/**
 * Calculates effective independent sources applying the SK-02 dependency penalty:
 * Three publications reproducing the same dataset (same originGroup) do NOT count as 3 independent sources.
 * For each unique originGroup with k citations:
 * - 1st primary citation = 1.0
 * - If k > 1 (reproductions of same origin), that originGroup contributes at most 1.0 to uniqueOriginsCount,
 *   and effective count for correlated cluster uses n_cluster^0.7 capped at 1.4, while strictly reporting
 *   `uniqueIndependentOrigins` as the count of distinct verified origin groups.
 */
export function computeSourceIndependenceMetrics(sources: {
  institution: string;
  originGroup?: string;
  axisId?: string;
  url?: string | null;
}[]): {
  totalDeclared: number;
  validRegisteredCount: number;
  uniqueIndependentOrigins: number;
  effectiveSourceScore: number;
  hasSharedOriginEcho: boolean;
  originGroupsMap: Record<string, number>;
} {
  const originGroupsMap: Record<string, number> = {};
  let validRegisteredCount = 0;

  for (const s of sources) {
    const lookup = lookupCanonicalSource(s.institution, s.axisId, s.url, s.originGroup);
    if (lookup.isAggregatorOrVague || lookup.isSuspiciousUrlOrDoi) {
      continue;
    }
    if (lookup.authorityVerified) {
      validRegisteredCount += 1;
    }
    const group = lookup.originGroup;
    originGroupsMap[group] = (originGroupsMap[group] || 0) + 1;
  }

  const groupCounts = Object.values(originGroupsMap);
  const uniqueIndependentOrigins = Object.keys(originGroupsMap).filter(
    (k) => !k.startsWith('UNREGISTERED_')
  ).length;

  const hasSharedOriginEcho = groupCounts.some((c) => c > 1);

  // Each distinct registered origin group contributes 1.0; unregistered non-aggregator contributes 0.35
  let effectiveSourceScore = 0;
  for (const [group, count] of Object.entries(originGroupsMap)) {
    const isRegistered = !group.startsWith('UNREGISTERED_');
    const baseWeight = isRegistered ? 1.0 : 0.35;
    // Dependency discount: multiple reproductions of the same origin do NOT add full independent weight
    const clusterEffective = count === 1 ? 1.0 : Math.min(1.25, Math.pow(count, 0.2));
    effectiveSourceScore += baseWeight * clusterEffective;
  }

  return {
    totalDeclared: sources.length,
    validRegisteredCount,
    uniqueIndependentOrigins,
    effectiveSourceScore: Number(effectiveSourceScore.toFixed(2)),
    hasSharedOriginEcho,
    originGroupsMap,
  };
}
