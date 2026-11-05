/**
 * ÁGORA FABLE 5.0 — Zod Runtime Schemas for Evidence & LLM Output Validation
 *
 * CRITICAL SECURITY & EPISTEMIC RULE (Section 9):
 * Never trust model-supplied fields like `verified`, `supported`, `eligible`,
 * `factualConfidence`, `coverage` or `quarantine`.
 * Those states are stripped or ignored during raw parsing and derived
 * strictly by the deterministic evidence engine.
 */

import { z } from 'zod';

export const RawSIBSchema = z.object({
  value: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  band: z.string().optional(),
  coveragePct: z.union([z.number(), z.string(), z.null(), z.undefined()]).optional(),
  dataBase: z.string().optional(),
}).passthrough();

export const RawPrimaryDataPointSchema = z.object({
  metricName: z.string().min(1),
  value: z.union([z.number(), z.string(), z.null()]).optional(),
  unit: z.string().default(''),
  year: z.union([z.number(), z.string(), z.null()]).optional(),
  source: z.string().default(''),
  trend: z.string().optional(),
  sib: RawSIBSchema.optional(),
  aamFlags: z.array(z.string()).optional(),
  priceBasis: z.enum(['real', 'nominal', 'index', 'rate', 'percentage', 'percentage_point', 'unspecified']).optional(),
  vintage: z.string().optional(),
  definitionSummary: z.string().optional(),
  populationScope: z.string().optional(),
  contestabilityNote: z.string().optional(),
  // Model-supplied untrusted fields (explicitly captured to detect & override)
  verified: z.boolean().optional(),
  supported: z.boolean().optional(),
  eligible: z.boolean().optional(),
  factualConfidence: z.number().optional(),
}).passthrough();

export const RawGovernmentAxisScoreSchema = z.object({
  governmentId: z.string().min(1),
  governmentName: z.string().min(1),
  period: z.string().default(''),
  score: z.union([z.number(), z.string(), z.null()]).optional(),
  band: z.string().optional(),
  sibAverage: z.union([z.number(), z.string(), z.null()]).optional(),
  thesisSummary: z.string().default(''),
  antithesisSummary: z.string().default(''),
  primaryData: z.array(RawPrimaryDataPointSchema).default([]),
  methodologicalNote: z.string().default(''),
  // Untrusted self-declarations from LLM
  verified: z.boolean().optional(),
  eligible: z.boolean().optional(),
  quarantine: z.boolean().optional(),
}).passthrough();

export const RawCCEEntrySchema = z.object({
  dataName: z.string().min(1),
  institution: z.string().default(''),
  year: z.union([z.number(), z.string(), z.null()]).optional(),
  methodologyType: z.string().default('administrativo'),
  sibConfidence: z.union([z.number(), z.string(), z.null()]).optional(),
  sibBand: z.string().optional(),
  vintage: z.string().optional(),
  originalUrl: z.string().nullable().optional(),
  originGroup: z.string().optional(),
  transformationsApplied: z.array(z.string()).optional(),
  // Untrusted self-declarations from LLM
  verified: z.boolean().optional(),
  retrieved: z.boolean().optional(),
}).passthrough();

export const RawCrossEffectSchema = z.object({
  destinationAxisId: z.string().default('A1'),
  destinationAxisName: z.string().default(''),
  mechanismDescription: z.string().default(''),
  direction: z.string().default('neutro'),
  intensity: z.string().default('moderada'),
}).passthrough();

export const RawPedagogicalOutputSchema = z.object({
  citizen: z.string().default(''),
  manager: z.string().default(''),
  specialist: z.string().default(''),
  socraticQuestion: z.string().default(''),
}).passthrough();

export const RawInternationalComparisonSchema = z.object({
  countryName: z.string().min(1),
  value: z.union([z.number(), z.string(), z.null()]).optional(),
  year: z.union([z.number(), z.string(), z.null()]).optional(),
}).passthrough();

export const RawComparativeAuditTrailSchema = z.object({
  timestamp: z.string().optional(),
  modelVersion: z.string().optional(),
  frameworkVersion: z.string().optional(),
  promptId: z.string().optional(),
  governmentsCount: z.number().optional(),
  sourcesCount: z.number().optional(),
  aamFlagsTriggered: z.array(z.string()).optional(),
  vcoStatus: z.string().optional(),
  averageSibConfidence: z.number().optional(),
  // Untrusted self-declarations from LLM
  verified: z.boolean().optional(),
  eligible: z.boolean().optional(),
}).passthrough();

export const RawAxisComparativeResultSchema = z.object({
  axisId: z.string().min(1),
  axisName: z.string().min(1),
  layer: z.enum(['A', 'B', 'C']).catch('A'),
  governmentScores: z.array(RawGovernmentAxisScoreSchema).default([]),
  crossEffects: z.array(RawCrossEffectSchema).default([]),
  pedagogicalOutput: RawPedagogicalOutputSchema.default({
    citizen: '',
    manager: '',
    specialist: '',
    socraticQuestion: '',
  }),
  cceTable: z.array(RawCCEEntrySchema).default([]),
  auditTrail: RawComparativeAuditTrailSchema.default({}),
  internationalComparison: z.array(RawInternationalComparisonSchema).default([]),
  // Untrusted top-level self-declarations
  verified: z.boolean().optional(),
  supported: z.boolean().optional(),
  eligible: z.boolean().optional(),
  factualConfidence: z.number().optional(),
  coverage: z.number().optional(),
  quarantine: z.boolean().optional(),
}).passthrough();

export type ValidatedRawAxisResult = z.infer<typeof RawAxisComparativeResultSchema>;
