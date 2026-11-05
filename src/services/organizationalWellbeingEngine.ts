/**
 * JSON_27 — PERMA-Governance Integration Engine (OWBIG)
 * Connects governance scores to organizational wellbeing via PERMA + JCM
 * 100% deterministic — no LLM dependency
 */

export interface PERMAScores {
  P: number; // Positive Emotions
  E: number; // Engagement
  R: number; // Relationships
  M: number; // Meaning
  A: number; // Accomplishment
}

export interface JCMDimension {
  id: string;
  name: string;
  nameEn: string;
  governanceVector: string;
  score: number;
  correlation5y: number;
  sib: number;
  mechanism: string;
}

export interface OWBIGResult {
  governmentId: string;
  governmentName: string;
  period: string;
  owbigComposite: number;
  perma: PERMAScores;
  psychologicalSafety: number;
  jcmDimensions: JCMDimension[];
  sibConfidence: number;
  note: string | null;
  paradox: string | null;
}

export interface OWBIGComparison {
  governments: OWBIGResult[];
  bestPermaP: { gov: string; value: number };
  bestPermaE: { gov: string; value: number };
  peakOWBIG: { gov: string; value: number };
  easterlinParadox: { detected: boolean; gov: string; description: string } | null;
}

// Pre-seeded Brazilian OWBIG data from JSON_27
const BRAZIL_OWBIG_DATA: Record<string, { owbig: number; P: number; E: number; R: number; M: number; A: number; sib: number; note?: string }> = {
  'br-fhc1':      { owbig: 6.2, P: 5.8, E: 5.5, R: 7.0, M: 6.1, A: 6.5, sib: 0.71, note: 'Plano Real → estabilidade → planejamento organizacional possível pela primeira vez' },
  'br-fhc2':      { owbig: 6.8, P: 6.5, E: 6.2, R: 7.2, M: 6.5, A: 7.1, sib: 0.74 },
  'br-lula1':     { owbig: 7.6, P: 7.4, E: 7.1, R: 7.8, M: 7.5, A: 7.8, sib: 0.82 },
  'br-lula2':     { owbig: 8.4, P: 8.1, E: 7.8, R: 8.2, M: 8.0, A: 8.5, sib: 0.85, note: 'Pico PERMA: menor desemprego + maiores scores GPTW da história brasileira' },
  'br-dilma1':    { owbig: 5.6, P: 5.2, E: 4.9, R: 7.5, M: 5.8, A: 5.0, sib: 0.80, note: 'PARADOXO: pleno emprego mas baixo Engajamento — empregos PTT carecem de variedade e autonomia' },
  'br-dilma2':    { owbig: 3.4, P: 3.1, E: 3.5, R: 6.8, M: 3.2, A: 2.9, sib: 0.79 },
  'br-temer':     { owbig: 4.2, P: 4.0, E: 4.4, R: 6.5, M: 4.1, A: 4.5, sib: 0.77 },
  'br-bolsonaro': { owbig: 3.9, P: 3.5, E: 4.2, R: 6.2, M: 3.8, A: 4.1, sib: 0.82, note: 'Burnout +34% (CFP 2022) | Uberização acelerada | Saúde mental sem regulação ocupacional' },
  'br-lula3':     { owbig: 5.8, P: 5.5, E: 5.9, R: 6.8, M: 5.7, A: 6.1, sib: 0.68 },
};

const GOV_LABELS: Record<string, { name: string; period: string }> = {
  'br-fhc1':      { name: 'FHC I', period: '1995-1998' },
  'br-fhc2':      { name: 'FHC II', period: '1999-2002' },
  'br-lula1':     { name: 'Lula I', period: '2003-2006' },
  'br-lula2':     { name: 'Lula II', period: '2007-2010' },
  'br-dilma1':    { name: 'Dilma I', period: '2011-2014' },
  'br-dilma2':    { name: 'Dilma II', period: '2015-2016' },
  'br-temer':     { name: 'Temer', period: '2016-2018' },
  'br-bolsonaro': { name: 'Bolsonaro', period: '2019-2022' },
  'br-lula3':     { name: 'Lula III', period: '2023-2026' },
};

function computeJCMDimensions(perma: PERMAScores): JCMDimension[] {
  return [
    { id: 'skill_variety', name: 'Variedade de Habilidades', nameEn: 'Skill Variety', governanceVector: 'A2 Educação + A6 Digital', score: (perma.E * 0.6 + perma.A * 0.4), correlation5y: 0.68, sib: 0.74, mechanism: 'Investimento em qualificação e habilidades digitais cria condições para trabalho variado e não-rotineiro' },
    { id: 'task_identity', name: 'Identidade da Tarefa', nameEn: 'Task Identity', governanceVector: 'A4 Estado de Direito + C11 Trabalho', score: (perma.M * 0.5 + perma.A * 0.5), correlation5y: 0.62, sib: 0.71, mechanism: 'Estado de direito claro e contratos estáveis permitem domínio completo de tarefas' },
    { id: 'task_significance', name: 'Significância da Tarefa', nameEn: 'Task Significance', governanceVector: 'A1 Saúde + A7 Meio Ambiente', score: (perma.M * 0.6 + perma.P * 0.4), correlation5y: 0.71, sib: 0.79, mechanism: 'Investimento em bens públicos cria propósito organizacional além do lucro' },
    { id: 'autonomy', name: 'Autonomia', nameEn: 'Autonomy', governanceVector: 'A4 Estado de Direito + A3 Macro', score: (perma.E * 0.5 + perma.P * 0.5), correlation5y: 0.75, sib: 0.81, mechanism: 'Estabilidade macroeconômica e jurídica reduz ansiedade, habilitando autonomia psicológica' },
    { id: 'feedback', name: 'Feedback', nameEn: 'Feedback', governanceVector: 'A6 Digital + A2 Educação', score: (perma.A * 0.6 + perma.E * 0.4), correlation5y: 0.58, sib: 0.69, mechanism: 'Infraestrutura digital e cultura de mensuração habilitam loops de feedback' },
  ];
}

function computePsychologicalSafety(perma: PERMAScores): number {
  // Proxy: A4_rule_of_law × (1 - political_polarization_index)
  // Simplified: M dimension (meaning/rule of law) * inverse of variance
  const polarizationProxy = Math.abs(perma.P - perma.E) / 10;
  return Math.min(1, (perma.M / 10) * (1 - polarizationProxy));
}

function detectParadox(result: OWBIGResult): string | null {
  // Dilma I paradox: high R but low E
  if (result.perma.R - result.perma.E > 2.0) {
    return `Paradoxo Organizacional: Relações fortes (R=${result.perma.R.toFixed(1)}) mas Engajamento baixo (E=${result.perma.E.toFixed(1)}) — quantidade de emprego não garante qualidade do trabalho.`;
  }
  if (result.perma.E > result.perma.P + 1.5) {
    return `Paradoxo de Engajamento Forçado: Engajamento alto (E=${result.perma.E.toFixed(1)}) mas Emoções Positivas baixas (P=${result.perma.P.toFixed(1)}) — trabalho produtivo mas não satisfatório.`;
  }
  return null;
}

export function computeOWBIG(governmentIds: string[]): OWBIGComparison {
  const governments: OWBIGResult[] = governmentIds.map(id => {
    const data = BRAZIL_OWBIG_DATA[id];
    const label = GOV_LABELS[id];
    if (!data || !label) {
      return {
        governmentId: id, governmentName: id, period: '', owbigComposite: 0,
        perma: { P: 0, E: 0, R: 0, M: 0, A: 0 }, psychologicalSafety: 0,
        jcmDimensions: [], sibConfidence: 0, note: null, paradox: null,
      };
    }
    const perma: PERMAScores = { P: data.P, E: data.E, R: data.R, M: data.M, A: data.A };
    const psy = computePsychologicalSafety(perma);
    const jcm = computeJCMDimensions(perma);
    const result: OWBIGResult = {
      governmentId: id,
      governmentName: label.name,
      period: label.period,
      owbigComposite: data.owbig,
      perma,
      psychologicalSafety: psy,
      jcmDimensions: jcm,
      sibConfidence: data.sib,
      note: data.note || null,
      paradox: null,
    };
    result.paradox = detectParadox(result);
    return result;
  });

  const sorted = [...governments].sort((a, b) => b.owbigComposite - a.owbigComposite);
  const bestP = [...governments].sort((a, b) => b.perma.P - a.perma.P)[0];
  const bestE = [...governments].sort((a, b) => b.perma.E - a.perma.E)[0];
  const easterlin = governments.find(g => g.paradox && g.paradox.includes('Paradoxo'));

  return {
    governments,
    bestPermaP: { gov: bestP?.governmentName || '', value: bestP?.perma.P || 0 },
    bestPermaE: { gov: bestE?.governmentName || '', value: bestE?.perma.E || 0 },
    peakOWBIG: { gov: sorted[0]?.governmentName || '', value: sorted[0]?.owbigComposite || 0 },
    easterlinParadox: easterlin ? { detected: true, gov: easterlin.governmentName, description: easterlin.paradox! } : null,
  };
}

export function getAllGovernmentIds(): string[] {
  return Object.keys(BRAZIL_OWBIG_DATA);
}

export function getOWBIGScoreBand(score: number): { band: string; color: string } {
  if (score >= 8.5) return { band: 'Florescimento', color: '#10B981' };
  if (score >= 7.0) return { band: 'Prosperidade', color: '#34D399' };
  if (score >= 5.5) return { band: 'Funcional', color: '#FBBF24' };
  if (score >= 4.0) return { band: 'Estresse', color: '#F97316' };
  if (score >= 2.5) return { band: 'Deterioração', color: '#EF4444' };
  return { band: 'Colapso', color: '#991B1B' };
}
