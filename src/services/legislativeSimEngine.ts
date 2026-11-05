/**
 * LegislativeNegotiationSim — Deterministic Legislative Simulation
 * JSON_23: Simulador de negociação legislativa
 * MVP: 4 bancadas, 8 rounds, deterministic
 */

export interface LegislativeFaction {
  id: string;
  partyName: string;
  acronym: string;
  seatsLower: number;
  seatsUpper: number;
  seatsPct: number;
  coalitionRole: 'anchor' | 'junior' | 'swing' | 'independent' | 'wildcard';
  loyaltyScore: number;
  voteDiscipline: number;
  redlines: string[];
  bargainingChips: string[];
  color: string;
  ideologyPosition: number; // -1 (left) to +1 (right)
}

export interface Amendment {
  id: string;
  proposedBy: string;
  text: string;
  axisAffected: string;
  expectedDelta: number;
  supporters: string[];
  opponents: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'tabled';
}

export interface LegislativeAction {
  round: number;
  sessionType: string;
  agentId: string;
  agentName: string;
  actionType: 'PROPOSE_AMENDMENT' | 'ACCEPT_AMENDMENT' | 'REJECT_AMENDMENT' | 'NEGOTIATE_PRIVATE' | 'SIGNAL_SUPPORT' | 'SIGNAL_DEFECTION' | 'FILIBUSTER' | 'TRADE_VOTE';
  content: string;
  isPublic: boolean;
  coalitionImpact: number;
}

export interface RoundSummary {
  roundNum: number;
  sessionType: string;
  approvalVotes: number;
  rejectionVotes: number;
  abstentions: number;
  quorumRequired: number;
  majorityType: 'simple' | 'absolute' | 'qualified_3_5' | 'qualified_2_3';
  swingFactions: string[];
  negotiationTemperature: number;
  passageProbability: number;
  pendingAmendments: Amendment[];
}

export interface LegislativeSimResult {
  billTitle: string;
  rounds: RoundSummary[];
  actions: LegislativeAction[];
  passageProbability: number;
  passageTrajectory: number[];
  winningCoalition: { factions: string[]; seatsTotal: number; seatsPct: number; stability: number };
  amendments: Amendment[];
  ideologicalDrift: number;
  status: 'approved' | 'rejected' | 'stalled';
}

export interface BillProposal {
  id: string;
  title: string;
  description: string;
  originalPosition: number; // ideological position
  majorityRequired: 'simple' | 'absolute' | 'qualified_3_5' | 'qualified_2_3';
  axesAffected: string[];
}

const BR_FACTIONS: LegislativeFaction[] = [
  { id: 'gov_base', partyName: 'Base Governista', acronym: 'GOV', seatsLower: 230, seatsUpper: 35, seatsPct: 0.37, coalitionRole: 'anchor', loyaltyScore: 0.75, voteDiscipline: 0.70, redlines: ['Não aceita corte em programas sociais', 'Manutenção de investimento público mínimo'], bargainingChips: ['Emendas parlamentares', 'Cargos em estatais', 'Destaques em comissões'], color: '#3B82F6', ideologyPosition: -0.3 },
  { id: 'centrao', partyName: 'Centrão', acronym: 'CTR', seatsLower: 180, seatsUpper: 25, seatsPct: 0.30, coalitionRole: 'swing', loyaltyScore: 0.40, voteDiscipline: 0.55, redlines: ['Garantia de emendas de relator', 'Não redução de fundo partidário'], bargainingChips: ['Votos em bloco', 'Apoio em CPI', 'Pauta de costumes'], color: '#F59E0B', ideologyPosition: 0.1 },
  { id: 'oposicao', partyName: 'Oposição', acronym: 'OPO', seatsLower: 140, seatsUpper: 18, seatsPct: 0.22, coalitionRole: 'independent', loyaltyScore: 0.85, voteDiscipline: 0.80, redlines: ['Obstrução se afetar liberdades individuais', 'Não vota sem debate pleno'], bargainingChips: ['Apoio em pauta econômica liberal', 'Cessão de obstrução'], color: '#EF4444', ideologyPosition: 0.6 },
  { id: 'independentes', partyName: 'Independentes/Novos', acronym: 'IND', seatsLower: 63, seatsUpper: 3, seatsPct: 0.11, coalitionRole: 'wildcard', loyaltyScore: 0.20, voteDiscipline: 0.30, redlines: ['Transparência no processo legislativo'], bargainingChips: ['Votos individuais', 'Visibilidade midiática'], color: '#8B5CF6', ideologyPosition: 0.0 },
];

const BILL_TEMPLATES: BillProposal[] = [
  { id: 'reforma_tributaria', title: 'Reforma Tributária', description: 'Unificação de tributos sobre consumo com período de transição de 7 anos', originalPosition: -0.1, majorityRequired: 'qualified_3_5', axesAffected: ['A1', 'B1', 'C1'] },
  { id: 'reforma_administrativa', title: 'Reforma Administrativa', description: 'Reestruturação do serviço público com avaliação de desempenho e fim da estabilidade para novos servidores', originalPosition: 0.4, majorityRequired: 'qualified_3_5', axesAffected: ['A2', 'A3', 'B3'] },
  { id: 'marco_ia', title: 'Marco Regulatório de IA', description: 'Regulamentação do uso de inteligência artificial com foco em transparência algorítmica e direitos digitais', originalPosition: 0.0, majorityRequired: 'simple', axesAffected: ['C7', 'C8'] },
  { id: 'politica_ambiental', title: 'Nova Política Ambiental', description: 'Metas de emissão zero até 2050 com mecanismos de mercado de carbono e fiscalização reforçada', originalPosition: -0.2, majorityRequired: 'absolute', axesAffected: ['B5', 'C5'] },
];

export function getFactions(): LegislativeFaction[] { return BR_FACTIONS; }
export function getBillTemplates(): BillProposal[] { return BILL_TEMPLATES; }

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

const SESSION_TYPES = ['Comissão Especial', 'Comissão Especial', 'Plenário — 1ª Discussão', 'Plenário — 1ª Discussão', 'Plenário — Emendas', 'Plenário — 2ª Discussão', 'Plenário — Votação', 'Senado — Votação Final'];

export function runLegislativeSim(
  factions: LegislativeFaction[],
  bill: BillProposal,
  seed: number = 42
): LegislativeSimResult {
  const rng = seededRandom(seed);
  const rounds = 8;
  const actions: LegislativeAction[] = [];
  const roundSummaries: RoundSummary[] = [];
  const passageTrajectory: number[] = [];
  const amendments: Amendment[] = [];

  // Total seats
  const totalSeats = factions.reduce((s, f) => s + f.seatsLower, 0);
  const quorum = bill.majorityRequired === 'simple' ? Math.floor(totalSeats / 2) + 1
    : bill.majorityRequired === 'absolute' ? Math.floor(totalSeats / 2) + 1
    : bill.majorityRequired === 'qualified_3_5' ? Math.floor(totalSeats * 3 / 5)
    : Math.floor(totalSeats * 2 / 3);

  // Track faction positions (how much they lean toward approval)
  const positions: Record<string, number> = {};
  for (const f of factions) {
    // Initial position based on ideological distance from bill
    const distance = Math.abs(f.ideologyPosition - bill.originalPosition);
    positions[f.id] = Math.max(0, 1 - distance) * f.loyaltyScore;
  }

  let currentBillPosition = bill.originalPosition;

  for (let round = 0; round < rounds; round++) {
    const sessionType = SESSION_TYPES[round];
    const roundActions: LegislativeAction[] = [];
    let temperature = 0;

    for (const faction of factions) {
      const pos = positions[faction.id];
      const r = rng();

      // Decide action
      let actionType: LegislativeAction['actionType'];
      let content: string;
      let coalitionImpact = 0;

      if (round < 3) {
        // Committee phase — more amendments and negotiations
        if (pos < 0.4 && r > 0.3) {
          actionType = 'PROPOSE_AMENDMENT';
          const amendText = faction.redlines[Math.floor(rng() * faction.redlines.length)] || 'Emenda modificativa';
          const amendment: Amendment = {
            id: `amd-${round}-${faction.id}`,
            proposedBy: faction.id,
            text: amendText,
            axisAffected: bill.axesAffected[0],
            expectedDelta: (rng() - 0.5) * 0.3,
            supporters: [faction.id],
            opponents: [],
            status: 'pending',
          };
          amendments.push(amendment);
          content = `${faction.partyName} propõe emenda: "${amendText}"`;
          coalitionImpact = -0.05;
        } else if (r > 0.5) {
          actionType = 'NEGOTIATE_PRIVATE';
          content = `${faction.partyName} negocia concessões: ${faction.bargainingChips[Math.floor(rng() * faction.bargainingChips.length)]}`;
          coalitionImpact = 0.03;
          positions[faction.id] = Math.min(1, pos + 0.05 + rng() * 0.1);
        } else {
          actionType = pos > 0.5 ? 'SIGNAL_SUPPORT' : 'SIGNAL_DEFECTION';
          content = pos > 0.5 ? `${faction.partyName} sinaliza apoio ao projeto` : `${faction.partyName} expressa reservas sobre o texto`;
          coalitionImpact = pos > 0.5 ? 0.02 : -0.03;
        }
      } else {
        // Floor phase — voting signals
        if (pos > 0.6) {
          actionType = 'SIGNAL_SUPPORT';
          content = `${faction.partyName} confirma voto favorável em plenário`;
          coalitionImpact = 0.05;
        } else if (pos < 0.3 && rng() > 0.5) {
          actionType = 'FILIBUSTER';
          content = `${faction.partyName} inicia obstrução regimental`;
          coalitionImpact = -0.08;
          temperature += 0.2;
        } else if (rng() > 0.6) {
          actionType = 'TRADE_VOTE';
          const chip = faction.bargainingChips[Math.floor(rng() * faction.bargainingChips.length)];
          content = `${faction.partyName} condiciona voto a: ${chip}`;
          positions[faction.id] = Math.min(1, pos + 0.1);
          coalitionImpact = 0.04;
        } else {
          actionType = 'NEGOTIATE_PRIVATE';
          content = `${faction.partyName} em negociação reservada com relator`;
          positions[faction.id] = Math.min(1, pos + 0.03);
          coalitionImpact = 0.02;
        }
      }

      roundActions.push({
        round,
        sessionType,
        agentId: faction.id,
        agentName: faction.partyName,
        actionType,
        content,
        isPublic: actionType !== 'NEGOTIATE_PRIVATE',
        coalitionImpact,
      });

      temperature += Math.abs(coalitionImpact) * 2;
    }

    // Process pending amendments
    for (const amd of amendments.filter(a => a.status === 'pending')) {
      const supportCount = factions.filter(f => positions[f.id] > 0.5 || f.id === amd.proposedBy).length;
      if (supportCount >= factions.length / 2) {
        amd.status = 'accepted';
        currentBillPosition += amd.expectedDelta;
        // Accepting amendments increases support
        for (const f of factions) {
          if (f.id === amd.proposedBy) positions[f.id] = Math.min(1, positions[f.id] + 0.15);
        }
      } else if (round > 4) {
        amd.status = rng() > 0.5 ? 'rejected' : 'tabled';
      }
    }

    // Calculate passage probability for this round
    let approvalVotes = 0;
    let rejectionVotes = 0;
    let abstentions = 0;
    const swingFactions: string[] = [];

    for (const f of factions) {
      const p = positions[f.id];
      const effectiveVotes = Math.floor(f.seatsLower * f.voteDiscipline);
      const freeVotes = f.seatsLower - effectiveVotes;

      if (p > 0.6) {
        approvalVotes += effectiveVotes + Math.floor(freeVotes * p);
        rejectionVotes += Math.floor(freeVotes * (1 - p) * 0.5);
      } else if (p < 0.3) {
        rejectionVotes += effectiveVotes + Math.floor(freeVotes * (1 - p));
        approvalVotes += Math.floor(freeVotes * p * 0.3);
      } else {
        swingFactions.push(f.id);
        const splitApproval = Math.floor(f.seatsLower * p);
        approvalVotes += splitApproval;
        rejectionVotes += Math.floor(f.seatsLower * (1 - p) * 0.6);
        abstentions += f.seatsLower - splitApproval - Math.floor(f.seatsLower * (1 - p) * 0.6);
      }
    }

    const passProb = Math.min(0.98, Math.max(0.02, approvalVotes / quorum));
    passageTrajectory.push(passProb);

    roundSummaries.push({
      roundNum: round + 1,
      sessionType,
      approvalVotes,
      rejectionVotes,
      abstentions,
      quorumRequired: quorum,
      majorityType: bill.majorityRequired,
      swingFactions,
      negotiationTemperature: Math.min(1, temperature / factions.length),
      passageProbability: passProb,
      pendingAmendments: amendments.filter(a => a.status === 'pending'),
    });

    actions.push(...roundActions);
  }

  // Final result
  const finalProb = passageTrajectory[passageTrajectory.length - 1];
  const winningFactions = factions.filter(f => positions[f.id] > 0.5);
  const winningSeats = winningFactions.reduce((s, f) => s + f.seatsLower, 0);

  return {
    billTitle: bill.title,
    rounds: roundSummaries,
    actions,
    passageProbability: finalProb,
    passageTrajectory,
    winningCoalition: {
      factions: winningFactions.map(f => f.id),
      seatsTotal: winningSeats,
      seatsPct: winningSeats / totalSeats,
      stability: winningFactions.reduce((s, f) => s + f.loyaltyScore, 0) / winningFactions.length,
    },
    amendments,
    ideologicalDrift: currentBillPosition - bill.originalPosition,
    status: finalProb > 0.7 ? 'approved' : finalProb < 0.3 ? 'rejected' : 'stalled',
  };
}
