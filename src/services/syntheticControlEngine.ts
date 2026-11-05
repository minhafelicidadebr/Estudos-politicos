/**
 * Synthetic Control Method — Deterministic Math Engine
 * Based on Abadie & Gardeazabal (2003), Abadie, Diamond & Hainmueller (2010)
 * NO LLM involved in calculations — pure JavaScript math.
 */
import type { SCMResult, SCMMetadata, ExternalShockAdjustment } from '@/types/aegis';

const KNOWN_SHOCKS: { year_range: [number, number]; event: string; countries: string[] | 'all'; weight_reduction: number }[] = [
  { year_range: [2008, 2009], event: 'Crise Financeira Global', countries: 'all', weight_reduction: 0.40 },
  { year_range: [2020, 2021], event: 'Pandemia COVID-19', countries: 'all', weight_reduction: 0.50 },
  { year_range: [2014, 2015], event: 'Colapso de Preços de Commodities', countries: ['BR', 'CL', 'CO', 'AR', 'ZA', 'NG'], weight_reduction: 0.30 },
  { year_range: [2022, 2023], event: 'Guerra Rússia-Ucrânia + Crise Energética', countries: 'all', weight_reduction: 0.25 },
];

// --- Utility functions ---
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return NaN;
  const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx, yi = y[i] - my;
    num += xi * yi; dx += xi * xi; dy += yi * yi;
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy);
}

function rmse(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  const ss = actual.slice(0, n).reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0);
  return Math.sqrt(ss / n);
}

function rSquared(actual: number[], predicted: number[]): number {
  const n = Math.min(actual.length, predicted.length);
  const mean = actual.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.slice(0, n).reduce((s, a) => s + (a - mean) ** 2, 0);
  const ssRes = actual.slice(0, n).reduce((s, a, i) => s + (a - predicted[i]) ** 2, 0);
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

function projectSimplex(v: number[]): number[] {
  const n = v.length;
  const sorted = [...v].sort((a, b) => b - a);
  let tmpSum = 0, tMax = -Infinity;
  for (let i = 0; i < n; i++) {
    tmpSum += sorted[i];
    const t = (tmpSum - 1) / (i + 1);
    if (sorted[i] - t > 0) tMax = t;
  }
  return v.map(vi => Math.max(vi - tMax, 0));
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? sorted[lo] : sorted[lo] * (hi - pos) + sorted[hi] * (pos - lo);
}

function detectShocks(countryId: string, startYear: number, endYear: number): ExternalShockAdjustment[] {
  const shocks: ExternalShockAdjustment[] = [];
  for (const s of KNOWN_SHOCKS) {
    if (s.countries !== 'all' && !s.countries.includes(countryId)) continue;
    for (let y = s.year_range[0]; y <= s.year_range[1]; y++) {
      if (y >= startYear && y <= endYear) {
        shocks.push({ year: y, event: s.event, weight_reduction_factor: s.weight_reduction, source: 'Known shock database' });
      }
    }
  }
  return shocks;
}

// --- SCM Core ---
export interface SCMInputData {
  targetPre: number[];
  targetPost: number[];
  donorsPre: number[][];
  donorsPost: number[][];
  donorIds: string[];
  bifurcationYear: number;
  horizonYears: number;
  countryId: string;
}

export function runSCM(input: SCMInputData): SCMResult {
  const t0 = performance.now();
  const { targetPre, targetPost, donorsPre, donorsPost, donorIds } = input;
  const nDonors = donorIds.length;

  // Step 1: Filter donors by correlation
  const validIndices: number[] = [];
  for (let i = 0; i < nDonors; i++) {
    const corr = pearsonCorrelation(targetPre, donorsPre[i]);
    if (!isNaN(corr) && corr >= 0.50) validIndices.push(i);
  }
  if (validIndices.length < 2) {
    // Relax threshold if insufficient
    for (let i = 0; i < nDonors; i++) {
      if (!validIndices.includes(i)) validIndices.push(i);
    }
  }

  const filteredDonorsPre = validIndices.map(i => donorsPre[i]);
  const filteredDonorsPost = validIndices.map(i => donorsPost[i]);
  const filteredIds = validIndices.map(i => donorIds[i]);

  // Step 2: Optimize weights via projected gradient descent
  const nd = filteredIds.length;
  let weights = Array(nd).fill(1 / nd);
  const LR = 0.01;
  let iterations = 0;

  for (let iter = 0; iter < 500; iter++) {
    iterations = iter + 1;
    const synthetic = targetPre.map((_, t) =>
      filteredDonorsPre.reduce((s, d, j) => s + weights[j] * d[t], 0)
    );
    // Gradient
    const grad = weights.map((_, j) =>
      targetPre.reduce((s, a, t) => s + 2 * (synthetic[t] - a) * filteredDonorsPre[j][t], 0) / targetPre.length
    );
    const gNorm = Math.sqrt(grad.reduce((s, g) => s + g * g, 0));
    if (gNorm < 1e-6) break;
    weights = projectSimplex(weights.map((w, i) => w - LR * grad[i]));
  }

  // Step 3: Compute pre-fit metrics
  const syntheticPre = targetPre.map((_, t) =>
    filteredDonorsPre.reduce((s, d, j) => s + weights[j] * d[t], 0)
  );
  const r2 = rSquared(targetPre, syntheticPre);
  const fitRmse = rmse(targetPre, syntheticPre);

  // Step 4: Counterfactual projection
  const horizonLen = targetPost.length;
  const counterfactual = Array.from({ length: horizonLen }, (_, t) =>
    filteredDonorsPost.reduce((s, d, j) => s + weights[j] * (d[t] ?? 0), 0)
  );
  const effect = targetPost.map((a, i) => a - counterfactual[i]);

  // Step 5: Simplified placebo (leave-one-out)
  const placeboEffects: number[][] = [];
  for (let p = 0; p < Math.min(nd, 5); p++) {
    const pTarget = filteredDonorsPre[p];
    const pDonors = filteredDonorsPre.filter((_, i) => i !== p);
    const pw = Array(pDonors.length).fill(1 / pDonors.length);
    const pSynthPost = Array.from({ length: horizonLen }, (_, t) => {
      const donors = filteredDonorsPost.filter((_, i) => i !== p);
      return donors.reduce((s, d, j) => s + pw[j] * (d[t] ?? 0), 0);
    });
    const pPost = filteredDonorsPost[p] || [];
    placeboEffects.push(pPost.map((a, i) => (a ?? 0) - pSynthPost[i]));
  }

  const p10 = Array.from({ length: horizonLen }, (_, t) =>
    quantile(placeboEffects.map(p => p[t] ?? 0), 0.10)
  );
  const p50 = Array.from({ length: horizonLen }, (_, t) =>
    quantile(placeboEffects.map(p => p[t] ?? 0), 0.50)
  );
  const p90 = Array.from({ length: horizonLen }, (_, t) =>
    quantile(placeboEffects.map(p => p[t] ?? 0), 0.90)
  );

  const pValue = placeboEffects.filter(p => {
    const last = p[p.length - 1] ?? 0;
    return Math.abs(last) >= Math.abs(effect[effect.length - 1] ?? 0);
  }).length / Math.max(placeboEffects.length, 1);

  // Step 6: SIB confidence decay
  const dataQuality = Math.min(r2, 0.95);
  const sibByYear = Array.from({ length: horizonLen }, (_, t) => {
    const base = r2 * dataQuality;
    return Math.max(base * Math.pow(1 - 0.04, t + 1), 0.35);
  });

  // Step 7: External shocks
  const shocks = detectShocks(input.countryId, input.bifurcationYear, input.bifurcationYear + input.horizonYears);

  const weightsMap: Record<string, number> = {};
  filteredIds.forEach((id, i) => { weightsMap[id] = Math.round(weights[i] * 1000) / 1000; });

  return {
    synthetic_weights: weightsMap,
    pre_fit_r_squared: Math.round(r2 * 10000) / 10000,
    pre_fit_rmse: Math.round(fitRmse * 10000) / 10000,
    counterfactual_trajectory: counterfactual.map(v => Math.round(v * 100) / 100),
    actual_trajectory: targetPost.map(v => Math.round(v * 100) / 100),
    effect_trajectory: effect.map(v => Math.round(v * 100) / 100),
    confidence_intervals: { p10, p50, p90 },
    sib_confidence_by_year: sibByYear.map(v => Math.round(v * 100) / 100),
    external_shock_adjustments: shocks,
    placebo_p_value: Math.round(pValue * 10000) / 10000,
    computation_metadata: {
      donor_countries_used: filteredIds,
      pre_bifurcation_years: targetPre.length,
      optimization_iterations: iterations,
      convergence_achieved: iterations < 500,
      computation_time_ms: Math.round(performance.now() - t0),
      data_quality_score: dataQuality,
    },
  };
}