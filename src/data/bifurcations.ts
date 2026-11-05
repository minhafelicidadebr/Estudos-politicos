import type { BifurcationPoint } from '@/types/aegis';

export const BRAZIL_BIFURCATIONS: BifurcationPoint[] = [
  {
    id: 'br-bif-001', country_id: 'BR', year: 2014,
    title_pt: 'Pedaladas fiscais e abandono do tripé macroeconômico',
    description_pt: 'O governo Dilma II adota política fiscal expansionista com uso de bancos públicos para financiar déficit, rompendo com o compromisso de superávit primário estabelecido desde 1999.',
    policy_type: 'fiscal', affected_axes: ['A3', 'A6', 'C8'], direction_actual: 'negative',
    minimum_pre_bifurcation_years: 8, minimum_peer_countries: 3,
    data_quality_note: 'Alta cobertura — FMI e BCB com séries completas 2006–2022',
    tags: ['fiscal_policy', 'debt', 'dilma', 'macroeconomics'],
  },
  {
    id: 'br-bif-002', country_id: 'BR', year: 2003,
    title_pt: 'Reforma da Previdência no início do mandato Lula',
    description_pt: 'Hipótese: Lula aprova reforma previdenciária estrutural em 2003, no auge da aprovação popular.',
    policy_type: 'fiscal', affected_axes: ['A3', 'C11', 'B6'], direction_actual: 'counterfactual_positive',
    minimum_pre_bifurcation_years: 6, minimum_peer_countries: 4,
    data_quality_note: 'Cobertura moderada para anos 1997-2003',
    tags: ['pension_reform', 'fiscal', 'lula'],
  },
  {
    id: 'br-bif-003', country_id: 'BR', year: 2019,
    title_pt: 'Manutenção do controle de armas (contrafactual à flexibilização)',
    description_pt: 'Hipótese: a política de controle de armas de 2003 é mantida, sem flexibilização via decretos de 2019-2021.',
    policy_type: 'security', affected_axes: ['A8', 'B1'], direction_actual: 'counterfactual_positive',
    minimum_pre_bifurcation_years: 5, minimum_peer_countries: 3,
    data_quality_note: 'Atlas da Violência com alta cobertura',
    tags: ['guns', 'security', 'bolsonaro', 'homicides'],
  },
  {
    id: 'br-bif-004', country_id: 'BR', year: 1999,
    title_pt: 'Lei de Responsabilidade Fiscal aprovada em 1995 (antecipação)',
    description_pt: 'Hipótese: a LRF é aprovada 4 anos antes, no início do governo FHC.',
    policy_type: 'institutional', affected_axes: ['A3', 'A4', 'A6'], direction_actual: 'counterfactual_positive',
    minimum_pre_bifurcation_years: 5, minimum_peer_countries: 3,
    data_quality_note: 'Dados históricos com qualidade moderada para período 1991-1995',
    tags: ['lrf', 'fiscal_rules', 'fhc', 'institutional'],
  },
  {
    id: 'br-bif-005', country_id: 'BR', year: 2005,
    title_pt: 'Manutenção do desmatamento zero na Amazônia pós-2004',
    description_pt: 'Hipótese: as políticas de controle do desmatamento são mantidas com plena força após 2012.',
    policy_type: 'environmental', affected_axes: ['A7', 'A5'], direction_actual: 'counterfactual_positive',
    minimum_pre_bifurcation_years: 5, minimum_peer_countries: 3,
    data_quality_note: 'INPE/PRODES com alta cobertura satelital desde 2004',
    tags: ['amazon', 'deforestation', 'environment'],
  },
];

export function getBifurcationsForCountry(countryId: string): BifurcationPoint[] {
  if (countryId === 'BR') return BRAZIL_BIFURCATIONS;
  return [];
}

const POLICY_TYPE_ICONS: Record<string, string> = {
  fiscal: '💰', monetary: '🏦', social: '🤝', environmental: '🌿', institutional: '🏛️', security: '🛡️',
};

export function getPolicyTypeIcon(type: string): string {
  return POLICY_TYPE_ICONS[type] || '📋';
}