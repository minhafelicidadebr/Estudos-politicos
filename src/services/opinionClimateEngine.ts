/**
 * OpinionClimateOracle — SIR-Opinion Extended Model
 * JSON_22: Motor de propagação de opinião pública
 * Deterministic (non-LLM) implementation
 */

export interface PopulationSegment {
  id: string;
  name: string;
  sizePct: number;
  geographicConcentration: 'urban' | 'rural' | 'suburban' | 'distributed';
  socioeconomicTier: 'A' | 'B' | 'C' | 'D' | 'E';
  ideologyDistribution: {
    left: number;
    center_left: number;
    center: number;
    center_right: number;
    right: number;
    apolitical: number;
  };
  mediaExposure: {
    social_media: number;
    traditional_broadcast: number;
    interpersonal_network: number;
    institutional_signal: number;
  };
  politicalTrust: number;
  mobilizationPotential: number;
  sentimentBias: number;
  echoChamberCoefficient: number;
  color: string;
}

export interface OpinionChannel {
  id: string;
  name: string;
  propagationSpeed: number; // rounds to reach 50% of segment
  reachCoefficient: number;
  credibilityWeight: number;
  distortionFactor: number;
}

export interface OpinionShock {
  description: string;
  initialSentimentDelta: Record<string, number>;
  mediaFrame: 'economic' | 'justice' | 'security' | 'health' | 'environment' | 'cultural';
}

export interface TimelineConfig {
  label: string;
  description: string;
  modifier: (segment: PopulationSegment, round: number) => number;
}

export interface TippingPoint {
  round: number;
  type: 'opinion_shift' | 'mobilization_threshold' | 'polarization_spike' | 'consensus_collapse';
  event: string;
  segmentId: string;
  magnitude: number;
  cascadeProbability: number;
}

export interface OpinionSimResult {
  trajectories: Record<string, Record<string, number[]>>; // timeline -> segment -> values
  polarizationIndex: Record<string, number[]>; // timeline -> values per round
  tippingPoints: TippingPoint[];
  mobilizationForecast: {
    protestProbability30: number;
    protestProbability60: number;
    protestProbability90: number;
    swingSegments: string[];
    estimatedVoteShift: number;
  };
  narrativeClusters: { clusterId: string; dominantFrame: string; segments: string[]; viralityScore: number }[];
  timelineComparison: Record<string, number>; // per segment: timeline A - timeline B delta
}

// Default Brazilian population segments
const BR_SEGMENTS: PopulationSegment[] = [
  { id: 'jovens_urbanos', name: 'Jovens Urbanos (18-29)', sizePct: 0.18, geographicConcentration: 'urban', socioeconomicTier: 'C', ideologyDistribution: { left: 0.25, center_left: 0.20, center: 0.15, center_right: 0.15, right: 0.10, apolitical: 0.15 }, mediaExposure: { social_media: 0.9, traditional_broadcast: 0.3, interpersonal_network: 0.5, institutional_signal: 0.2 }, politicalTrust: 0.25, mobilizationPotential: 0.7, sentimentBias: -0.1, echoChamberCoefficient: 0.6, color: '#3B82F6' },
  { id: 'classe_media', name: 'Classe Média Urbana (30-55)', sizePct: 0.25, geographicConcentration: 'urban', socioeconomicTier: 'B', ideologyDistribution: { left: 0.15, center_left: 0.20, center: 0.25, center_right: 0.20, right: 0.15, apolitical: 0.05 }, mediaExposure: { social_media: 0.7, traditional_broadcast: 0.6, interpersonal_network: 0.5, institutional_signal: 0.4 }, politicalTrust: 0.35, mobilizationPotential: 0.5, sentimentBias: 0.0, echoChamberCoefficient: 0.4, color: '#8B5CF6' },
  { id: 'trabalhadores', name: 'Trabalhadores Formais (C/D)', sizePct: 0.30, geographicConcentration: 'suburban', socioeconomicTier: 'C', ideologyDistribution: { left: 0.20, center_left: 0.25, center: 0.20, center_right: 0.15, right: 0.10, apolitical: 0.10 }, mediaExposure: { social_media: 0.5, traditional_broadcast: 0.7, interpersonal_network: 0.7, institutional_signal: 0.3 }, politicalTrust: 0.30, mobilizationPotential: 0.6, sentimentBias: -0.15, echoChamberCoefficient: 0.35, color: '#10B981' },
  { id: 'ruralistas', name: 'Produtores Rurais', sizePct: 0.12, geographicConcentration: 'rural', socioeconomicTier: 'B', ideologyDistribution: { left: 0.05, center_left: 0.10, center: 0.15, center_right: 0.30, right: 0.35, apolitical: 0.05 }, mediaExposure: { social_media: 0.4, traditional_broadcast: 0.6, interpersonal_network: 0.8, institutional_signal: 0.5 }, politicalTrust: 0.45, mobilizationPotential: 0.4, sentimentBias: 0.2, echoChamberCoefficient: 0.5, color: '#F59E0B' },
  { id: 'elite_empresarial', name: 'Elite Empresarial', sizePct: 0.05, geographicConcentration: 'urban', socioeconomicTier: 'A', ideologyDistribution: { left: 0.05, center_left: 0.10, center: 0.20, center_right: 0.35, right: 0.25, apolitical: 0.05 }, mediaExposure: { social_media: 0.6, traditional_broadcast: 0.5, interpersonal_network: 0.4, institutional_signal: 0.8 }, politicalTrust: 0.50, mobilizationPotential: 0.3, sentimentBias: 0.15, echoChamberCoefficient: 0.45, color: '#EC4899' },
  { id: 'periferia', name: 'Periferia Metropolitana (D/E)', sizePct: 0.10, geographicConcentration: 'urban', socioeconomicTier: 'D', ideologyDistribution: { left: 0.30, center_left: 0.20, center: 0.10, center_right: 0.10, right: 0.10, apolitical: 0.20 }, mediaExposure: { social_media: 0.6, traditional_broadcast: 0.5, interpersonal_network: 0.8, institutional_signal: 0.1 }, politicalTrust: 0.15, mobilizationPotential: 0.8, sentimentBias: -0.3, echoChamberCoefficient: 0.55, color: '#06B6D4' },
];

const CHANNELS: OpinionChannel[] = [
  { id: 'social_media', name: 'Redes Sociais', propagationSpeed: 1, reachCoefficient: 0.85, credibilityWeight: 0.55, distortionFactor: 0.45 },
  { id: 'traditional_broadcast', name: 'Mídia Tradicional', propagationSpeed: 3, reachCoefficient: 0.70, credibilityWeight: 0.80, distortionFactor: 0.20 },
  { id: 'interpersonal_network', name: 'Redes Interpessoais', propagationSpeed: 7, reachCoefficient: 0.40, credibilityWeight: 0.95, distortionFactor: 0.30 },
  { id: 'institutional_signal', name: 'Sinais Institucionais', propagationSpeed: 1, reachCoefficient: 0.90, credibilityWeight: 0.70, distortionFactor: 0.15 },
];

const SHOCK_TEMPLATES: OpinionShock[] = [
  { description: 'Aprovação de reforma previdenciária com corte de 15% nos benefícios', initialSentimentDelta: { jovens_urbanos: -0.3, classe_media: -0.15, trabalhadores: -0.5, ruralistas: -0.1, elite_empresarial: 0.3, periferia: -0.6 }, mediaFrame: 'economic' },
  { description: 'Escândalo de corrupção envolvendo líderes do governo e oposição', initialSentimentDelta: { jovens_urbanos: -0.5, classe_media: -0.4, trabalhadores: -0.3, ruralistas: -0.2, elite_empresarial: -0.3, periferia: -0.4 }, mediaFrame: 'justice' },
  { description: 'Crise ambiental com desmatamento recorde e sanções internacionais', initialSentimentDelta: { jovens_urbanos: -0.6, classe_media: -0.3, trabalhadores: -0.1, ruralistas: 0.2, elite_empresarial: -0.4, periferia: -0.1 }, mediaFrame: 'environment' },
  { description: 'Programa social emergencial com transferência direta de renda', initialSentimentDelta: { jovens_urbanos: 0.2, classe_media: -0.1, trabalhadores: 0.4, ruralistas: 0.1, elite_empresarial: -0.3, periferia: 0.7 }, mediaFrame: 'economic' },
];

export function getSegments(): PopulationSegment[] { return BR_SEGMENTS; }
export function getChannels(): OpinionChannel[] { return CHANNELS; }
export function getOpinionShocks(): OpinionShock[] { return SHOCK_TEMPLATES; }

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

export function runOpinionSimulation(
  segments: PopulationSegment[],
  shock: OpinionShock,
  rounds: number = 24,
  seed: number = 42
): OpinionSimResult {
  const rng = seededRandom(seed);
  const timelines: Record<string, { label: string; modifiers: (seg: PopulationSegment, round: number) => number }> = {
    A: { label: 'Sem contra-narrativa', modifiers: () => 0 },
    B: { label: 'Resposta institucional rápida', modifiers: (seg, round) => round <= 3 ? seg.politicalTrust * 0.15 : 0 },
    C: { label: 'Crise de credibilidade midiática', modifiers: (seg) => -seg.mediaExposure.traditional_broadcast * 0.1 },
  };

  const trajectories: Record<string, Record<string, number[]>> = {};
  const polarizationIndex: Record<string, number[]> = {};
  const tippingPoints: TippingPoint[] = [];

  for (const [tlKey, tl] of Object.entries(timelines)) {
    trajectories[tlKey] = {};
    polarizationIndex[tlKey] = [];

    // Init opinion state per segment
    const opinions: Record<string, number> = {};
    for (const seg of segments) {
      opinions[seg.id] = seg.sentimentBias;
      trajectories[tlKey][seg.id] = [seg.sentimentBias];
    }

    for (let round = 1; round <= rounds; round++) {
      for (const seg of segments) {
        // SIR-Opinion propagation
        let delta = 0;
        const initialDelta = shock.initialSentimentDelta[seg.id] || 0;

        // Channel-based propagation
        for (const channel of CHANNELS) {
          const exposure = seg.mediaExposure[channel.id as keyof typeof seg.mediaExposure] || 0;
          const propagationFactor = round >= channel.propagationSpeed ? 1 : round / channel.propagationSpeed;
          const channelImpact = initialDelta * exposure * channel.reachCoefficient * channel.credibilityWeight * propagationFactor;
          const distortion = (rng() - 0.5) * channel.distortionFactor * 0.1;
          delta += channelImpact * (1 / (1 + round * 0.1)) + distortion;
        }

        // Echo chamber effect
        delta *= (1 + seg.echoChamberCoefficient * 0.3);

        // Social proof from other segments
        const avgOpinion = segments.reduce((s, other) => s + opinions[other.id] * other.sizePct, 0);
        delta += (avgOpinion - opinions[seg.id]) * seg.mediaExposure.interpersonal_network * 0.05;

        // Timeline modifier
        delta += tl.modifiers(seg, round);

        // Decay toward baseline
        delta -= opinions[seg.id] * 0.02;

        opinions[seg.id] = Math.max(-1, Math.min(1, opinions[seg.id] + delta));
        trajectories[tlKey][seg.id].push(opinions[seg.id]);
      }

      // Polarization index
      const vals = segments.map(s => opinions[s.id]);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
      polarizationIndex[tlKey].push(Math.sqrt(variance));

      // Tipping point detection (only timeline A)
      if (tlKey === 'A' && round > 2) {
        const prevPol = polarizationIndex[tlKey][round - 2];
        const currPol = polarizationIndex[tlKey][round - 1];
        if (Math.abs(currPol - prevPol) > 0.08) {
          const shiftedSeg = segments.reduce((best, seg) => {
            const prev = trajectories[tlKey][seg.id][round - 1];
            const curr = trajectories[tlKey][seg.id][round];
            return Math.abs(curr - prev) > Math.abs(trajectories[tlKey][best.id][round] - trajectories[tlKey][best.id][round - 1]) ? seg : best;
          });
          tippingPoints.push({
            round,
            type: currPol > 0.5 ? 'polarization_spike' : 'opinion_shift',
            event: `Mudança significativa de opinião no segmento ${shiftedSeg.name}`,
            segmentId: shiftedSeg.id,
            magnitude: Math.abs(currPol - prevPol),
            cascadeProbability: Math.min(0.9, currPol * 1.2),
          });
        }
      }
    }
  }

  // Mobilization forecast
  const finalOpinionsA = segments.map(s => trajectories['A'][s.id][rounds]);
  const avgNegative = finalOpinionsA.filter(v => v < -0.3).length / segments.length;
  const swingSegments = segments.filter(s => {
    const delta = Math.abs(trajectories['A'][s.id][rounds] - trajectories['A'][s.id][0]);
    return delta > 0.2;
  }).map(s => s.id);

  // Timeline comparison (A vs B)
  const timelineComparison: Record<string, number> = {};
  for (const seg of segments) {
    timelineComparison[seg.id] = trajectories['A'][seg.id][rounds] - trajectories['B'][seg.id][rounds];
  }

  return {
    trajectories,
    polarizationIndex,
    tippingPoints,
    mobilizationForecast: {
      protestProbability30: Math.min(0.95, avgNegative * 0.6 + (tippingPoints.length * 0.1)),
      protestProbability60: Math.min(0.95, avgNegative * 0.75 + (tippingPoints.length * 0.12)),
      protestProbability90: Math.min(0.95, avgNegative * 0.85 + (tippingPoints.length * 0.15)),
      swingSegments,
      estimatedVoteShift: finalOpinionsA.reduce((s, v) => s + v, 0) / finalOpinionsA.length * 5,
    },
    narrativeClusters: [
      { clusterId: 'cluster_resistance', dominantFrame: 'Resistência ao choque', segments: segments.filter(s => trajectories['A'][s.id][rounds] < -0.2).map(s => s.id), viralityScore: 0.7 },
      { clusterId: 'cluster_adaptation', dominantFrame: 'Adaptação pragmática', segments: segments.filter(s => Math.abs(trajectories['A'][s.id][rounds]) <= 0.2).map(s => s.id), viralityScore: 0.4 },
      { clusterId: 'cluster_support', dominantFrame: 'Apoio ao novo status quo', segments: segments.filter(s => trajectories['A'][s.id][rounds] > 0.2).map(s => s.id), viralityScore: 0.5 },
    ],
    timelineComparison,
  };
}
