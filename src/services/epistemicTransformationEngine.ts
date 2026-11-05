/**
 * JSON_29 — Epistemic Transformation Engine
 * Bayesian Belief Updating + Motivational Interviewing + Constitutional AI
 * Deterministic divergence detection — dialogue via AI Gateway
 */

export type DivergenceType = 'score_belief_gap' | 'cross_government_inconsistency' | 'axis_selective_attention' | 'evidence_source_bias';
export type DialogueOutcome = 'in_progress' | 'user_exited' | 'completed' | 'belief_updated' | 'belief_maintained';

export interface DivergenceDetection {
  type: DivergenceType;
  label: string;
  description: string;
  magnitude: number; // 0-10
  severity: 'alta' | 'moderada' | 'baixa';
  example: string;
  icon: string;
}

export interface MITurn {
  turnNumber: number;
  type: string;
  label: string;
  description: string;
  miPrinciple: string;
}

export interface ConstitutionalConstraint {
  id: number;
  constraint: string;
  type: 'hard' | 'soft';
}

export interface EpistemicProfile {
  userId: string;
  totalAnalyses: number;
  divergenceScore: number;
  doubleStandardIndex: number;
  selectiveAttentionGap: number;
  epistemicHealthScore: number; // 0-10
  radarOptedIn: boolean;
  detectedDivergences: DivergenceDetection[];
}

export interface DialogueSession {
  id: string;
  currentTurn: number;
  maxTurns: number;
  divergenceType: DivergenceType;
  turns: { speaker: 'system' | 'user'; text: string; miPrinciple: string }[];
  outcome: DialogueOutcome;
  constitutionalViolations: number;
}

// Divergence type definitions
const DIVERGENCE_TYPES: DivergenceDetection[] = [
  {
    type: 'score_belief_gap', label: 'Lacuna Score-Crença',
    description: 'Sua avaliação narrativa diverge do score PIR+ que sua própria análise produziu',
    magnitude: 0, severity: 'moderada', icon: 'Split',
    example: 'Usuário dá 7.5/10 no PIR+ mas escreve "este governo destruiu a economia" → gap = 4.5 pontos',
  },
  {
    type: 'cross_government_inconsistency', label: 'Inconsistência Cruzada',
    description: 'Padrões analíticos diferentes para governos de alinhamentos distintos',
    magnitude: 0, severity: 'moderada', icon: 'Scale',
    example: 'Cita fontes SIB 0.45 para criticar governo A mas exige SIB 0.85+ para aceitar evidência positiva sobre governo B',
  },
  {
    type: 'axis_selective_attention', label: 'Atenção Seletiva',
    description: 'Ignora sistematicamente eixos onde governo preferido performa mal',
    magnitude: 0, severity: 'baixa', icon: 'EyeOff',
    example: 'Completa 90% dos eixos favoráveis ao governo preferido, apenas 45% dos desfavoráveis',
  },
  {
    type: 'evidence_source_bias', label: 'Viés de Fontes',
    description: 'Cita fontes de menor qualidade para apoiar posição política preferida',
    magnitude: 0, severity: 'baixa', icon: 'FileWarning',
    example: 'SIB médio das fontes pró-preferido = 0.55 vs contra-preferido = 0.78',
  },
];

// MI dialogue structure
const MI_TURNS: MITurn[] = [
  { turnNumber: 1, type: 'opening_declaration', label: 'Declaração de Abertura', description: 'Declara que o diálogo apresentará dados desafiadores. Obtém consentimento explícito.', miPrinciple: 'Transparência' },
  { turnNumber: 2, type: 'empathy_validation', label: 'Validação Empática', description: 'Valida a perspectiva do usuário como compreensível.', miPrinciple: 'Express Empathy' },
  { turnNumber: 3, type: 'first_evidence_presentation', label: 'Primeira Evidência', description: 'Apresenta dado contradizente único com SIB. Termina com pergunta aberta.', miPrinciple: 'Develop Discrepancy' },
  { turnNumber: 4, type: 'resistance_exploration', label: 'Exploração da Resistência', description: 'Se o usuário resiste, explora a resistência. Se aceita, aprofunda.', miPrinciple: 'Roll with Resistance' },
  { turnNumber: 5, type: 'complexity_revelation', label: 'Revelação de Complexidade', description: 'Mostra que a realidade é mais complexa — ambas as crenças parcialmente corretas.', miPrinciple: 'Develop Discrepancy' },
  { turnNumber: 6, type: 'peer_country_analogy', label: 'Analogia Internacional', description: 'Apresenta caso de país que experimentou padrão similar — reduz ameaça identitária.', miPrinciple: 'Roll with Resistance' },
  { turnNumber: 7, type: 'open_synthesis_question', label: 'Síntese Aberta', description: 'Pergunta final aberta convidando síntese do usuário. NUNCA prescreve conclusão.', miPrinciple: 'Support Self-Efficacy' },
];

const CONSTITUTIONAL_CONSTRAINTS: ConstitutionalConstraint[] = [
  { id: 1, constraint: 'NUNCA prescrever uma conclusão — sempre terminar com pergunta aberta', type: 'hard' },
  { id: 2, constraint: 'NUNCA apresentar evidência seletivamente — se dados apoiam crença do usuário em alguma dimensão, DEVEM ser mostrados', type: 'hard' },
  { id: 3, constraint: 'NUNCA usar linguagem emocionalmente carregada para apresentar evidência contraditória', type: 'hard' },
  { id: 4, constraint: 'NUNCA continuar diálogo além de 7 turnos sem continuação explícita do usuário', type: 'hard' },
  { id: 5, constraint: 'SEMPRE declarar antecipadamente quando o diálogo apresentará evidência desafiadora', type: 'hard' },
  { id: 6, constraint: 'SEMPRE declarar confiança SIB em cada ponto de dados apresentado', type: 'hard' },
  { id: 7, constraint: 'SEMPRE respeitar se o usuário escolhe encerrar ou manter crença original', type: 'hard' },
  { id: 8, constraint: 'NUNCA pedir ao usuário que mude de crença — apenas perguntar o que pensa sobre novos dados', type: 'hard' },
];

// Simulated epistemic profile — deterministic hash-based demo, NOT read from
// the real `analyses` table yet. Ver Onda 4 do PLANO_ELEVACAO_180.md para a
// versão que lê o histórico real do usuário.
export function computeEpistemicProfile(userId: string): EpistemicProfile {
  // Deterministic simulation based on userId hash — no Math.random(), reproducible per userId
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = (hash % 100) / 100;

  const divergences: DivergenceDetection[] = DIVERGENCE_TYPES.map((d, i) => {
    const typeHash = d.type.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const itemSeed = ((hash + typeHash * 31 + i) % 100) / 100;
    return {
      ...d,
      magnitude: Math.round((seed * 3 + itemSeed * 2) * 10) / 10,
      severity: (seed > 0.6 ? 'alta' : seed > 0.3 ? 'moderada' : 'baixa') as DivergenceDetection['severity'],
    };
  }).filter(d => d.magnitude > 1.5);

  const divergenceScore = divergences.reduce((sum, d) => sum + d.magnitude, 0) / Math.max(1, divergences.length);
  const doubleStandard = 1 + seed * 0.8;

  return {
    userId,
    // Demo placeholder — não é a contagem real de análises do usuário.
    totalAnalyses: 5 + Math.floor(seed * 20),
    divergenceScore,
    doubleStandardIndex: Math.round(doubleStandard * 100) / 100,
    selectiveAttentionGap: Math.round(seed * 40),
    epistemicHealthScore: Math.round((10 - divergenceScore) * 10) / 10,
    radarOptedIn: false,
    detectedDivergences: divergences,
  };
}

export function getMITurns(): MITurn[] {
  return MI_TURNS;
}

export function getConstitutionalConstraints(): ConstitutionalConstraint[] {
  return CONSTITUTIONAL_CONSTRAINTS;
}

export function getDivergenceTypes(): DivergenceDetection[] {
  return DIVERGENCE_TYPES;
}

export function getEpistemicHealthBand(score: number): { band: string; color: string; description: string } {
  if (score >= 8) return { band: 'Excelente', color: '#10B981', description: 'Raciocínio analítico com baixo viés detectável' };
  if (score >= 6) return { band: 'Saudável', color: '#34D399', description: 'Vieses moderados — consciência analítica ativa' };
  if (score >= 4) return { band: 'Atenção', color: '#FBBF24', description: 'Padrões de viés detectados — diálogo socrático recomendado' };
  if (score >= 2) return { band: 'Alerta', color: '#F97316', description: 'Vieses significativos — múltiplas divergências detectadas' };
  return { band: 'Crítico', color: '#EF4444', description: 'Padrões de raciocínio enviesado sistemático' };
}
