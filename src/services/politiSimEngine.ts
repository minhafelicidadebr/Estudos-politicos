/**
 * PolitiSimEngine — Deterministic Multi-Agent Political Simulation
 * JSON_21: Motor de simulação de atores políticos com vetores ideológicos
 * 100% determinístico (não-LLM) para MVP
 */

export interface IdeologyVector {
  fiscal_orthodoxy: number;
  state_interventionism: number;
  civil_liberties: number;
  social_conservatism: number;
  environmental_priority: number;
  international_openness: number;
  institutional_reformism: number;
  digital_governance_adoption: number;
}

export interface PoliticalAgent {
  id: string;
  name: string;
  type: 'executive' | 'legislative' | 'judiciary' | 'party' | 'cso' | 'media' | 'market';
  ideology: IdeologyVector;
  influenceWeight: number;
  responseStyle: 'confrontational' | 'diplomatic' | 'technocratic' | 'populist' | 'legalistic' | 'pragmatic';
  riskTolerance: number;
  reactionLatency: number; // rounds
  color: string;
}

export interface ShockEvent {
  id: string;
  type: 'policy_proposal' | 'fiscal_crisis' | 'scandal' | 'constitutional_reform' | 'external_pressure';
  description: string;
  intensity: number;
  affectedDimensions: (keyof IdeologyVector)[];
}

export interface AgentAction {
  round: number;
  agentId: string;
  agentName: string;
  actionType: 'ISSUE_STATEMENT' | 'PROPOSE_LEGISLATION' | 'VETO' | 'ALIGN' | 'DEFECT' | 'MOBILIZE' | 'NEGOTIATE' | 'LOBBY';
  content: string;
  targetAgents: string[];
  impactScore: number;
  success: boolean;
}

export interface SimulationResult {
  rounds: number;
  actions: AgentAction[];
  trajectories: Record<string, number[]>; // agentId -> influence over time
  coalitionProbability: number;
  crisisIndex: number[];
  equilibriumRound: number | null;
  agentFinalPositions: Record<string, IdeologyVector>;
}

// Predefined agents for Brazil
const BR_AGENTS: PoliticalAgent[] = [
  { id: 'exec', name: 'Poder Executivo', type: 'executive', ideology: { fiscal_orthodoxy: -0.2, state_interventionism: 0.6, civil_liberties: 0.3, social_conservatism: -0.3, environmental_priority: 0.4, international_openness: 0.5, institutional_reformism: 0.3, digital_governance_adoption: 0.4 }, influenceWeight: 0.95, responseStyle: 'diplomatic', riskTolerance: 0.4, reactionLatency: 1, color: '#3B82F6' },
  { id: 'congress', name: 'Congresso Nacional', type: 'legislative', ideology: { fiscal_orthodoxy: 0.1, state_interventionism: 0.1, civil_liberties: 0.0, social_conservatism: 0.3, environmental_priority: -0.2, international_openness: 0.1, institutional_reformism: -0.2, digital_governance_adoption: 0.1 }, influenceWeight: 0.90, responseStyle: 'pragmatic', riskTolerance: 0.3, reactionLatency: 2, color: '#8B5CF6' },
  { id: 'stf', name: 'STF', type: 'judiciary', ideology: { fiscal_orthodoxy: 0.0, state_interventionism: 0.0, civil_liberties: 0.7, social_conservatism: -0.4, environmental_priority: 0.3, international_openness: 0.4, institutional_reformism: 0.5, digital_governance_adoption: 0.3 }, influenceWeight: 0.80, responseStyle: 'legalistic', riskTolerance: 0.1, reactionLatency: 4, color: '#10B981' },
  { id: 'market', name: 'Mercado Financeiro', type: 'market', ideology: { fiscal_orthodoxy: 0.9, state_interventionism: -0.8, civil_liberties: 0.2, social_conservatism: 0.0, environmental_priority: -0.3, international_openness: 0.8, institutional_reformism: 0.2, digital_governance_adoption: 0.7 }, influenceWeight: 0.70, responseStyle: 'technocratic', riskTolerance: 0.6, reactionLatency: 0, color: '#F59E0B' },
  { id: 'cso', name: 'Sociedade Civil', type: 'cso', ideology: { fiscal_orthodoxy: -0.4, state_interventionism: 0.5, civil_liberties: 0.8, social_conservatism: -0.6, environmental_priority: 0.7, international_openness: 0.3, institutional_reformism: 0.6, digital_governance_adoption: 0.2 }, influenceWeight: 0.50, responseStyle: 'confrontational', riskTolerance: 0.7, reactionLatency: 1, color: '#EC4899' },
  { id: 'media', name: 'Mídia', type: 'media', ideology: { fiscal_orthodoxy: 0.2, state_interventionism: -0.2, civil_liberties: 0.5, social_conservatism: -0.1, environmental_priority: 0.2, international_openness: 0.4, institutional_reformism: 0.3, digital_governance_adoption: 0.6 }, influenceWeight: 0.65, responseStyle: 'pragmatic', riskTolerance: 0.5, reactionLatency: 0, color: '#06B6D4' },
];

const SHOCK_TEMPLATES: ShockEvent[] = [
  { id: 'fiscal_reform', type: 'policy_proposal', description: 'Reforma fiscal com corte de subsídios e aumento de impostos sobre renda', intensity: 0.7, affectedDimensions: ['fiscal_orthodoxy', 'state_interventionism'] },
  { id: 'constitutional_crisis', type: 'constitutional_reform', description: 'Proposta de emenda constitucional limitando poderes do judiciário', intensity: 0.85, affectedDimensions: ['civil_liberties', 'institutional_reformism'] },
  { id: 'corruption_scandal', type: 'scandal', description: 'Revelação de esquema de corrupção envolvendo líderes do executivo e legislativo', intensity: 0.9, affectedDimensions: ['institutional_reformism', 'civil_liberties'] },
  { id: 'climate_emergency', type: 'external_pressure', description: 'Pressão internacional por política ambiental mais rigorosa com sanções comerciais', intensity: 0.6, affectedDimensions: ['environmental_priority', 'international_openness'] },
  { id: 'digital_governance', type: 'policy_proposal', description: 'Implementação de governo digital com IA para decisões administrativas', intensity: 0.5, affectedDimensions: ['digital_governance_adoption', 'civil_liberties'] },
];

// Seeded PRNG for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function computeAlignment(a: IdeologyVector, b: IdeologyVector): number {
  const dims = Object.keys(a) as (keyof IdeologyVector)[];
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (const d of dims) {
    dotProduct += a[d] * b[d];
    magA += a[d] * a[d];
    magB += b[d] * b[d];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

const ACTION_TYPES: AgentAction['actionType'][] = ['ISSUE_STATEMENT', 'PROPOSE_LEGISLATION', 'VETO', 'ALIGN', 'DEFECT', 'MOBILIZE', 'NEGOTIATE', 'LOBBY'];

const ACTION_DESCRIPTIONS: Record<string, Record<AgentAction['actionType'], string>> = {
  exec: { ISSUE_STATEMENT: 'Pronunciamento oficial sobre posição do governo', PROPOSE_LEGISLATION: 'Envio de projeto de lei ao Congresso', VETO: 'Veto presidencial a proposta legislativa', ALIGN: 'Articulação de apoio com base aliada', DEFECT: 'Recuo estratégico de posição anterior', MOBILIZE: 'Convocação de cadeia nacional', NEGOTIATE: 'Mesa de negociação com líderes partidários', LOBBY: 'Pressão sobre parlamentares indecisos' },
  congress: { ISSUE_STATEMENT: 'Nota oficial dos líderes partidários', PROPOSE_LEGISLATION: 'Projeto de lei alternativo', VETO: 'Obstrução de pauta no plenário', ALIGN: 'Formação de frente parlamentar', DEFECT: 'Dissidência de bancada', MOBILIZE: 'Convocação de sessão extraordinária', NEGOTIATE: 'Acordo de lideranças', LOBBY: 'Articulação com governadores' },
  stf: { ISSUE_STATEMENT: 'Decisão monocrática com impacto político', PROPOSE_LEGISLATION: 'Súmula vinculante', VETO: 'Suspensão liminar de ato governamental', ALIGN: 'Decisão favorável ao governo', DEFECT: 'Decisão contrária ao governo', MOBILIZE: 'Audiência pública sobre constitucionalidade', NEGOTIATE: 'Mediação entre poderes', LOBBY: 'Sinalização pública de posição' },
  market: { ISSUE_STATEMENT: 'Relatório de risco-país', PROPOSE_LEGISLATION: 'Carta aberta de CEOs ao governo', VETO: 'Fuga de capitais como sinal de rejeição', ALIGN: 'Rally de mercado como sinal de aprovação', DEFECT: 'Rebaixamento de perspectiva de crédito', MOBILIZE: 'Campanha de lobby empresarial', NEGOTIATE: 'Contrapartida fiscal em troca de apoio', LOBBY: 'Pressão via agências de rating' },
  cso: { ISSUE_STATEMENT: 'Manifesto de organizações da sociedade civil', PROPOSE_LEGISLATION: 'Projeto de iniciativa popular', VETO: 'Protestos de rua contra medida', ALIGN: 'Apoio público a política governamental', DEFECT: 'Rompimento com governo aliado', MOBILIZE: 'Convocação de greve geral', NEGOTIATE: 'Mesa de diálogo social', LOBBY: 'Campanha de pressão nas redes sociais' },
  media: { ISSUE_STATEMENT: 'Editorial conjunto de grandes veículos', PROPOSE_LEGISLATION: 'Investigação jornalística expondo problema', VETO: 'Campanha editorial contra medida', ALIGN: 'Cobertura favorável à política', DEFECT: 'Mudança de posição editorial', MOBILIZE: 'Cobertura massiva gerando pressão pública', NEGOTIATE: 'Entrevista exclusiva com líderes', LOBBY: 'Formação de opinião pública via reportagens' },
};

export function getAgentsForCountry(_countryId: string): PoliticalAgent[] {
  return BR_AGENTS; // MVP: same agents for all countries
}

export function getShockTemplates(): ShockEvent[] {
  return SHOCK_TEMPLATES;
}

export function runPolitiSim(
  agents: PoliticalAgent[],
  shock: ShockEvent,
  rounds: number = 12,
  seed: number = 42
): SimulationResult {
  const rng = seededRandom(seed);
  const actions: AgentAction[] = [];
  const trajectories: Record<string, number[]> = {};
  const crisisIndex: number[] = [];
  const currentPositions: Record<string, IdeologyVector> = {};

  // Initialize
  for (const agent of agents) {
    trajectories[agent.id] = [agent.influenceWeight];
    currentPositions[agent.id] = { ...agent.ideology };
  }

  let equilibriumRound: number | null = null;

  for (let round = 1; round <= rounds; round++) {
    let roundCrisis = 0;
    const roundActions: AgentAction[] = [];

    for (const agent of agents) {
      if (round < agent.reactionLatency) {
        trajectories[agent.id].push(trajectories[agent.id][round - 1]);
        continue;
      }

      // Determine action based on alignment with shock
      const shockAlignment = shock.affectedDimensions.reduce((sum, dim) => {
        return sum + (currentPositions[agent.id][dim] * shock.intensity);
      }, 0) / shock.affectedDimensions.length;

      const isAligned = shockAlignment > 0;
      const actionIdx = Math.floor(rng() * ACTION_TYPES.length);
      let actionType = ACTION_TYPES[actionIdx];

      // Bias action type based on alignment
      if (isAligned && rng() > 0.4) actionType = rng() > 0.5 ? 'ALIGN' : 'NEGOTIATE';
      if (!isAligned && rng() > 0.4) actionType = rng() > 0.5 ? 'DEFECT' : 'MOBILIZE';

      // Find target (most opposed or aligned agent)
      const otherAgents = agents.filter(a => a.id !== agent.id);
      const targetAgent = otherAgents.sort((a, b) => {
        const alignA = computeAlignment(currentPositions[agent.id], currentPositions[a.id]);
        const alignB = computeAlignment(currentPositions[agent.id], currentPositions[b.id]);
        return isAligned ? alignB - alignA : alignA - alignB;
      })[0];

      const impactScore = agent.influenceWeight * shock.intensity * (0.5 + rng() * 0.5);
      const success = rng() < (agent.influenceWeight * 0.7 + agent.riskTolerance * 0.3);

      const descriptions = ACTION_DESCRIPTIONS[agent.id] || ACTION_DESCRIPTIONS['exec'];

      roundActions.push({
        round,
        agentId: agent.id,
        agentName: agent.name,
        actionType,
        content: descriptions[actionType],
        targetAgents: [targetAgent.id],
        impactScore,
        success,
      });

      // Update ideology positions slightly
      for (const dim of shock.affectedDimensions) {
        const delta = (isAligned ? 0.05 : -0.05) * shock.intensity * (success ? 1 : 0.3);
        currentPositions[agent.id][dim] = Math.max(-1, Math.min(1, currentPositions[agent.id][dim] + delta));
      }

      // Update influence trajectory
      const influenceChange = success ? impactScore * 0.1 : -impactScore * 0.05;
      const prevInfluence = trajectories[agent.id][round - 1];
      trajectories[agent.id].push(Math.max(0.1, Math.min(1, prevInfluence + influenceChange)));

      roundCrisis += Math.abs(impactScore) * (success ? 0.3 : 0.7);
    }

    actions.push(...roundActions);
    crisisIndex.push(Math.min(1, roundCrisis / agents.length));

    // Check equilibrium
    if (round > 3 && !equilibriumRound) {
      const recentCrisis = crisisIndex.slice(-3);
      const variance = recentCrisis.reduce((s, v) => s + Math.pow(v - recentCrisis[0], 2), 0) / recentCrisis.length;
      if (variance < 0.001) equilibriumRound = round;
    }
  }

  // Calculate coalition probability
  const alignments = agents.map(a => {
    return shock.affectedDimensions.reduce((s, d) => s + currentPositions[a.id][d], 0) / shock.affectedDimensions.length;
  });
  const supportingWeight = agents.reduce((s, a, i) => alignments[i] > 0 ? s + a.influenceWeight : s, 0);
  const totalWeight = agents.reduce((s, a) => s + a.influenceWeight, 0);
  const coalitionProbability = supportingWeight / totalWeight;

  return {
    rounds,
    actions,
    trajectories,
    coalitionProbability,
    crisisIndex,
    equilibriumRound,
    agentFinalPositions: currentPositions,
  };
}
