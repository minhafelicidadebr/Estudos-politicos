import type { GovernmentRecord } from '@/types/aegis';

export const governmentsByCountry: Record<string, GovernmentRecord[]> = {
  BR: [
    { id: 'br-collor', countryId: 'BR', name: 'Governo Collor', leaderName: 'Fernando Collor', party: 'PRN', regimeType: 'Presidencialismo', yearStart: 1990, yearEnd: 1992, dataCoveragePct: 72, analyticalMaturity: 'Média', contextFlags: ['hyperinflation', 'early_democracy'], color: '#378ADD' },
    { id: 'br-itamar', countryId: 'BR', name: 'Governo Itamar Franco', leaderName: 'Itamar Franco', party: 'PMDB', regimeType: 'Presidencialismo', yearStart: 1992, yearEnd: 1994, dataCoveragePct: 75, analyticalMaturity: 'Média', contextFlags: ['plano_real', 'stabilization'], color: '#1D9E75' },
    { id: 'br-fhc1', countryId: 'BR', name: 'Governo FHC I', leaderName: 'Fernando Henrique Cardoso', party: 'PSDB', regimeType: 'Presidencialismo', yearStart: 1995, yearEnd: 1998, dataCoveragePct: 88, analyticalMaturity: 'Alta', contextFlags: ['privatizacoes', 'plano_real_consolidation'], color: '#BA7517' },
    { id: 'br-fhc2', countryId: 'BR', name: 'Governo FHC II', leaderName: 'Fernando Henrique Cardoso', party: 'PSDB', regimeType: 'Presidencialismo', yearStart: 1999, yearEnd: 2002, dataCoveragePct: 90, analyticalMaturity: 'Alta', contextFlags: ['lrf', 'metas_inflacao', 'crise_cambial'], color: '#D85A30' },
    { id: 'br-lula1', countryId: 'BR', name: 'Governo Lula I', leaderName: 'Luiz Inácio Lula da Silva', party: 'PT', regimeType: 'Presidencialismo', yearStart: 2003, yearEnd: 2006, dataCoveragePct: 92, analyticalMaturity: 'Alta', contextFlags: ['bolsa_familia', 'commodities_boom'], color: '#7F77DD' },
    { id: 'br-lula2', countryId: 'BR', name: 'Governo Lula II', leaderName: 'Luiz Inácio Lula da Silva', party: 'PT', regimeType: 'Presidencialismo', yearStart: 2007, yearEnd: 2010, dataCoveragePct: 94, analyticalMaturity: 'Alta', contextFlags: ['grau_investimento', 'crise_2008', 'pre_sal'], color: '#E24B4A' },
    { id: 'br-dilma1', countryId: 'BR', name: 'Governo Dilma I', leaderName: 'Dilma Rousseff', party: 'PT', regimeType: 'Presidencialismo', yearStart: 2011, yearEnd: 2014, dataCoveragePct: 93, analyticalMaturity: 'Alta', contextFlags: ['nova_matriz', 'desoneracao', 'copa_mundo'], color: '#378ADD' },
    { id: 'br-dilma2', countryId: 'BR', name: 'Governo Dilma II', leaderName: 'Dilma Rousseff', party: 'PT', regimeType: 'Presidencialismo', yearStart: 2015, yearEnd: 2016, dataCoveragePct: 91, analyticalMaturity: 'Alta', contextFlags: ['pedaladas', 'recessao', 'impeachment', 'lava_jato'], color: '#1D9E75' },
    { id: 'br-temer', countryId: 'BR', name: 'Governo Temer', leaderName: 'Michel Temer', party: 'MDB', regimeType: 'Presidencialismo', yearStart: 2016, yearEnd: 2018, dataCoveragePct: 90, analyticalMaturity: 'Alta', contextFlags: ['teto_gastos', 'reforma_trabalhista', 'susp'], color: '#BA7517' },
    { id: 'br-bolsonaro', countryId: 'BR', name: 'Governo Bolsonaro', leaderName: 'Jair Bolsonaro', party: 'PL', regimeType: 'Presidencialismo', yearStart: 2019, yearEnd: 2022, dataCoveragePct: 94, analyticalMaturity: 'Alta', contextFlags: ['pandemia_covid', 'reforma_previdencia', 'desmatamento', 'auxilio_emergencial'], color: '#D85A30' },
    { id: 'br-lula3', countryId: 'BR', name: 'Governo Lula III', leaderName: 'Luiz Inácio Lula da Silva', party: 'PT', regimeType: 'Presidencialismo', yearStart: 2023, yearEnd: null, dataCoveragePct: 80, analyticalMaturity: 'Alta', contextFlags: ['arcabouco_fiscal', 'transicao_verde', 'lula3_inicial'], color: '#7F77DD' },
  ],
  US: [
    { id: 'us-clinton', countryId: 'US', name: 'Clinton Administration', leaderName: 'Bill Clinton', party: 'Democratic', regimeType: 'Presidential', yearStart: 1993, yearEnd: 2001, dataCoveragePct: 96, analyticalMaturity: 'Alta', contextFlags: ['post_cold_war', 'tech_boom'], color: '#378ADD' },
    { id: 'us-bush2', countryId: 'US', name: 'Bush Administration', leaderName: 'George W. Bush', party: 'Republican', regimeType: 'Presidential', yearStart: 2001, yearEnd: 2009, dataCoveragePct: 97, analyticalMaturity: 'Alta', contextFlags: ['9_11', 'iraq_war', 'financial_crisis_2008'], color: '#D85A30' },
    { id: 'us-obama', countryId: 'US', name: 'Obama Administration', leaderName: 'Barack Obama', party: 'Democratic', regimeType: 'Presidential', yearStart: 2009, yearEnd: 2017, dataCoveragePct: 98, analyticalMaturity: 'Alta', contextFlags: ['aca', 'economic_recovery', 'paris_accord'], color: '#1D9E75' },
    { id: 'us-trump1', countryId: 'US', name: 'Trump Administration', leaderName: 'Donald Trump', party: 'Republican', regimeType: 'Presidential', yearStart: 2017, yearEnd: 2021, dataCoveragePct: 97, analyticalMaturity: 'Alta', contextFlags: ['tax_cuts', 'covid_pandemic', 'jan_6'], color: '#BA7517' },
    { id: 'us-biden', countryId: 'US', name: 'Biden Administration', leaderName: 'Joe Biden', party: 'Democratic', regimeType: 'Presidential', yearStart: 2021, yearEnd: 2025, dataCoveragePct: 96, analyticalMaturity: 'Alta', contextFlags: ['ira', 'chips_act', 'ukraine_war', 'inflation'], color: '#7F77DD' },
    { id: 'us-trump2', countryId: 'US', name: 'Trump 2nd Administration', leaderName: 'Donald Trump', party: 'Republican', regimeType: 'Presidential', yearStart: 2025, yearEnd: null, dataCoveragePct: 60, analyticalMaturity: 'Baixa', contextFlags: ['second_term', 'tariffs', 'doge'], color: '#E24B4A' },
  ],
  DE: [
    { id: 'de-schroeder1', countryId: 'DE', name: 'Kabinett Schröder I', leaderName: 'Gerhard Schröder', party: 'SPD/Grüne', regimeType: 'Parlamentarismo', yearStart: 1998, yearEnd: 2002, dataCoveragePct: 95, analyticalMaturity: 'Alta', contextFlags: ['agenda_2010_prep', 'euro_adoption'], color: '#378ADD' },
    { id: 'de-schroeder2', countryId: 'DE', name: 'Kabinett Schröder II', leaderName: 'Gerhard Schröder', party: 'SPD/Grüne', regimeType: 'Parlamentarismo', yearStart: 2002, yearEnd: 2005, dataCoveragePct: 96, analyticalMaturity: 'Alta', contextFlags: ['agenda_2010', 'hartz_reforms'], color: '#1D9E75' },
    { id: 'de-merkel1', countryId: 'DE', name: 'Kabinett Merkel I', leaderName: 'Angela Merkel', party: 'CDU/CSU/SPD', regimeType: 'Parlamentarismo', yearStart: 2005, yearEnd: 2009, dataCoveragePct: 97, analyticalMaturity: 'Alta', contextFlags: ['financial_crisis_2008'], color: '#BA7517' },
    { id: 'de-merkel4', countryId: 'DE', name: 'Kabinett Merkel IV', leaderName: 'Angela Merkel', party: 'CDU/CSU/SPD', regimeType: 'Parlamentarismo', yearStart: 2018, yearEnd: 2021, dataCoveragePct: 97, analyticalMaturity: 'Alta', contextFlags: ['covid', 'energiewende', 'refugeenkrise'], color: '#D85A30' },
    { id: 'de-scholz', countryId: 'DE', name: 'Kabinett Scholz', leaderName: 'Olaf Scholz', party: 'SPD/Grüne/FDP', regimeType: 'Parlamentarismo', yearStart: 2021, yearEnd: null, dataCoveragePct: 90, analyticalMaturity: 'Alta', contextFlags: ['ukraine_war', 'energy_crisis', 'wirtschaftskrise'], color: '#7F77DD' },
  ],
  UY: [
    { id: 'uy-batlle', countryId: 'UY', name: 'Governo Batlle', leaderName: 'Jorge Batlle', party: 'PC', regimeType: 'Presidencialismo', yearStart: 2000, yearEnd: 2005, dataCoveragePct: 88, analyticalMaturity: 'Alta', contextFlags: ['crise_2002', 'corralito'], color: '#378ADD' },
    { id: 'uy-tabare1', countryId: 'UY', name: 'Governo Vázquez I', leaderName: 'Tabaré Vázquez', party: 'Frente Amplio', regimeType: 'Presidencialismo', yearStart: 2005, yearEnd: 2010, dataCoveragePct: 90, analyticalMaturity: 'Alta', contextFlags: ['primera_izquierda', 'crescimento_social'], color: '#1D9E75' },
    { id: 'uy-mujica', countryId: 'UY', name: 'Governo Mujica', leaderName: 'José Mujica', party: 'Frente Amplio', regimeType: 'Presidencialismo', yearStart: 2010, yearEnd: 2015, dataCoveragePct: 92, analyticalMaturity: 'Alta', contextFlags: ['cannabis_legal', 'reformas_sociais'], color: '#BA7517' },
    { id: 'uy-tabare2', countryId: 'UY', name: 'Governo Vázquez II', leaderName: 'Tabaré Vázquez', party: 'Frente Amplio', regimeType: 'Presidencialismo', yearStart: 2015, yearEnd: 2020, dataCoveragePct: 92, analyticalMaturity: 'Alta', contextFlags: ['sustentabilidade', 'educacao_reformas'], color: '#D85A30' },
    { id: 'uy-lacalle', countryId: 'UY', name: 'Governo Lacalle Pou', leaderName: 'Luis Lacalle Pou', party: 'PN', regimeType: 'Presidencialismo', yearStart: 2020, yearEnd: null, dataCoveragePct: 88, analyticalMaturity: 'Alta', contextFlags: ['pandemia_covid', 'moderacao_direita'], color: '#7F77DD' },
  ],
};

export function getGovernmentsForCountry(countryId: string): GovernmentRecord[] {
  return governmentsByCountry[countryId] || [];
}
