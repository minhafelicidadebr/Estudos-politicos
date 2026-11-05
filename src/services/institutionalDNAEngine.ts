/**
 * Institutional DNA Engine — Simplified PCA (2-component)
 * Deterministic JavaScript — NO LLM involved in math.
 * Pearson (1901) + North (1990) + Pierson (2000)
 */
import type { AxisDNAClassification, DNAPattern, DNASignature, CountryArchetype, DNAClassificationType } from '@/types/aegis';

const ARCHETYPES: CountryArchetype[] = [
  { id: 'institutional_builder', label: 'Arquiteto Institucional', description: 'País com arquitetura institucional robusta que resiste a variações de governo.', examples: ['SE', 'DE', 'NZ'], policy_implication: 'Reformas incrementais têm alta eficácia.' },
  { id: 'underutilized_capacity', label: 'Capacidade Subutilizada', description: 'Capacidades estruturais excepcionais mas resultados altamente variáveis por escolha política.', examples: ['BR', 'AR'], policy_implication: 'O problema não é falta de capacidade — é descontinuidade política.' },
  { id: 'path_trapped', label: 'Aprisionamento Estrutural', description: 'Vulnerabilidades altamente estruturais — resistem a qualquer governo.', examples: ['AR', 'NG'], policy_implication: 'Reformas pontuais insuficientes. Ruptura institucional deliberada pode ser necessária.' },
  { id: 'transition_state', label: 'Estado de Transição', description: 'País em reconfiguração de seu DNA institucional.', examples: ['CL', 'CO'], policy_implication: 'Janela de oportunidade para cimentar novos padrões positivos.' },
  { id: 'consistent_performer', label: 'Performer Consistente', description: 'Pontos fortes e limitações são estruturalmente estáveis.', examples: ['UY', 'CL'], policy_implication: 'Alta confiabilidade de trajetória.' },
];

// --- Math utilities ---
function avg(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(arr.length - 1, 1));
}

function variance(arr: number[]): number {
  const m = avg(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(arr.length - 1, 1);
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
}

function matVecMul(mat: number[][], v: number[]): number[] {
  return mat.map(row => dot(row, v));
}

function euclideanNorm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

// Power iteration for top eigenvector
function powerIteration(matrix: number[][], iterations = 100): { vector: number[]; eigenvalue: number } {
  const n = matrix.length;
  let v = Array.from({ length: n }, () => Math.random());
  let norm = euclideanNorm(v);
  v = v.map(x => x / norm);

  for (let i = 0; i < iterations; i++) {
    v = matVecMul(matrix, v);
    norm = euclideanNorm(v);
    if (norm === 0) break;
    v = v.map(x => x / norm);
  }

  const eigenvalue = dot(v, matVecMul(matrix, v));
  return { vector: v, eigenvalue };
}

function deflateMatrix(matrix: number[][], pc: { vector: number[]; eigenvalue: number }): number[][] {
  const n = matrix.length;
  return matrix.map((row, i) =>
    row.map((val, j) => val - pc.eigenvalue * pc.vector[i] * pc.vector[j])
  );
}

function computeCovarianceMatrix(standardized: number[][]): number[][] {
  // standardized: axes × governments → cov is axes × axes
  const nAxes = standardized.length;
  const nGovs = standardized[0]?.length ?? 0;
  const cov: number[][] = Array.from({ length: nAxes }, () => Array(nAxes).fill(0));

  for (let i = 0; i < nAxes; i++) {
    for (let j = i; j < nAxes; j++) {
      let s = 0;
      for (let k = 0; k < nGovs; k++) {
        s += (standardized[i][k] ?? 0) * (standardized[j][k] ?? 0);
      }
      const val = s / Math.max(nGovs - 1, 1);
      cov[i][j] = val;
      cov[j][i] = val;
    }
  }
  return cov;
}

// --- Main PCA pipeline ---
export interface PCAInput {
  /** Matrix: axes[axisIndex] = score per government */
  scoreMatrix: { axisId: string; axisName: string; scores: number[] }[];
  governmentNames: string[];
  countryId: string;
  countryName: string;
}

export interface PCAOutput {
  pc1_explained_pct: number;
  pc2_explained_pct: number;
  classifications: AxisDNAClassification[];
  structural_patterns: DNAPattern[];
  conjunctural_patterns: DNAPattern[];
  signature: DNASignature;
  archetype: CountryArchetype;
}

export function runPCA(input: PCAInput): PCAOutput {
  const { scoreMatrix, governmentNames } = input;
  const nAxes = scoreMatrix.length;
  const nGovs = governmentNames.length;

  // Step 1: Standardize
  const standardized = scoreMatrix.map(axis => {
    const m = avg(axis.scores);
    const s = stddev(axis.scores);
    return s === 0 ? axis.scores.map(() => 0) : axis.scores.map(v => (v - m) / s);
  });

  // Step 2: Covariance matrix
  const cov = computeCovarianceMatrix(standardized);

  // Step 3: Power iteration for PC1 & PC2
  const pc1 = powerIteration(cov);
  const deflated = deflateMatrix(cov, pc1);
  const pc2 = powerIteration(deflated);

  const totalEig = pc1.eigenvalue + pc2.eigenvalue + Math.max(nAxes - 2, 0) * 0.5;
  const pc1Pct = (pc1.eigenvalue / totalEig) * 100;
  const pc2Pct = (pc2.eigenvalue / totalEig) * 100;

  // Step 4: Classify each axis
  const classifications: AxisDNAClassification[] = scoreMatrix.map((axis, i) => {
    const crossGovVar = variance(axis.scores);
    const totalVar = variance(axis.scores) || 1;
    const persistenceScore = 1 - (crossGovVar / (totalVar * nGovs));
    const persistenceClamped = Math.max(0, Math.min(1, persistenceScore));
    const structuralPct = persistenceClamped * 100;
    const conjuncturalPct = 100 - structuralPct;
    const stdev = stddev(axis.scores);
    const coeffVar = avg(axis.scores) !== 0 ? stdev / Math.abs(avg(axis.scores)) : 1;

    let classification: DNAClassificationType;
    if (coeffVar < 0.15) classification = 'structural';
    else if (coeffVar > 0.40) classification = 'conjunctural';
    else classification = 'intermediate';

    return {
      axis_id: axis.axisId,
      axis_name: axis.axisName,
      persistence_score: Math.round(persistenceClamped * 100) / 100,
      structural_pct: Math.round(structuralPct * 10) / 10,
      conjunctural_pct: Math.round(conjuncturalPct * 10) / 10,
      classification,
      historical_range: {
        min: Math.min(...axis.scores),
        max: Math.max(...axis.scores),
        mean: Math.round(avg(axis.scores) * 100) / 100,
      },
      cross_government_stdev: Math.round(stdev * 100) / 100,
      pc1_loading: Math.round(pc1.vector[i] * 1000) / 1000,
      pc2_loading: Math.round(pc2.vector[i] * 1000) / 1000,
    };
  });

  // Step 5: Extract patterns
  const structural_patterns: DNAPattern[] = classifications
    .filter(c => c.classification === 'structural')
    .map((c, i) => ({
      pattern_id: `struct-${i}`,
      title: `${c.axis_name} — Padrão Estrutural`,
      description: `Variação de apenas ${c.cross_government_stdev.toFixed(2)} entre ${nGovs} governos (range: ${c.historical_range.min.toFixed(1)}–${c.historical_range.max.toFixed(1)}).`,
      axes_involved: [c.axis_id],
      persistence_years: nGovs * 4,
      persistence_across_govs: `${nGovs} de ${nGovs} governos`,
      direction: c.historical_range.mean >= 5 ? 'positive' as const : 'negative' as const,
      international_rarity: 'uncommon' as const,
    }));

  const conjunctural_patterns: DNAPattern[] = classifications
    .filter(c => c.classification === 'conjunctural')
    .map((c, i) => ({
      pattern_id: `conj-${i}`,
      title: `${c.axis_name} — Padrão Conjuntural`,
      description: `Alta variação (σ=${c.cross_government_stdev.toFixed(2)}) entre governos — sensível a escolhas políticas.`,
      axes_involved: [c.axis_id],
      persistence_years: 0,
      persistence_across_govs: 'Varia significativamente',
      direction: c.historical_range.mean >= 5 ? 'positive' as const : 'negative' as const,
      international_rarity: 'common' as const,
    }));

  // Step 6: DNA Signature
  const strengths = structural_patterns.filter(p => p.direction === 'positive');
  const vulnerabilities = structural_patterns.filter(p => p.direction === 'negative');

  const signature: DNASignature = {
    label: strengths.length > vulnerabilities.length ? 'País de Base Estrutural Positiva' : 'País de Vulnerabilidades Persistentes',
    description: `Análise de ${nGovs} governos revela ${structural_patterns.length} padrões estruturais e ${conjunctural_patterns.length} conjunturais.`,
    core_tension: strengths.length > 0 && vulnerabilities.length > 0
      ? `Tensão entre capacidades estruturais (${strengths.map(s => s.axes_involved[0]).join(', ')}) e vulnerabilidades persistentes (${vulnerabilities.map(v => v.axes_involved[0]).join(', ')}).`
      : 'Perfil estrutural a ser aprofundado com mais eixos analíticos.',
    structural_strengths: strengths,
    structural_vulnerabilities: vulnerabilities,
  };

  // Step 7: Archetype classification
  const nStrength = strengths.length;
  const nVuln = vulnerabilities.length;
  const nConj = conjunctural_patterns.length;
  let archetype: CountryArchetype;

  if (nStrength >= 4 && nVuln <= 2) archetype = ARCHETYPES[0];
  else if (nStrength >= 3 && nConj >= 3) archetype = ARCHETYPES[1];
  else if (nVuln >= 4) archetype = ARCHETYPES[2];
  else if (classifications.filter(c => c.classification === 'intermediate').length > nAxes / 2) archetype = ARCHETYPES[3];
  else archetype = ARCHETYPES[4];

  return {
    pc1_explained_pct: Math.round(pc1Pct * 10) / 10,
    pc2_explained_pct: Math.round(pc2Pct * 10) / 10,
    classifications,
    structural_patterns,
    conjunctural_patterns,
    signature,
    archetype,
  };
}

export { ARCHETYPES };