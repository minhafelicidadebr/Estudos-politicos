/**
 * Zod schemas — validam blocos estruturados retornados pela IA antes de qualquer
 * renderização. Blocos malformados são descartados silenciosamente (com log dev),
 * jamais quebram a interface.
 */
import { z } from "zod";
import type { AIInsightBlock, AIInsightPayload } from "@/types/aiInsights";

const confidenceSchema = z.enum(["alta", "media", "baixa"]).optional();

const baseFields = {
  id: z.string().min(1).max(120),
  title: z.string().max(240).optional(),
  description: z.string().max(1000).optional(),
  sourceReferences: z.array(z.string().max(400)).max(20).optional(),
  confidence: confidenceSchema,
  isInference: z.boolean().optional(),
};

const kpiBlock = z.object({
  ...baseFields,
  type: z.literal("kpi"),
  data: z.object({
    items: z
      .array(
        z.object({
          label: z.string().min(1).max(120),
          value: z.union([z.string().max(60), z.number()]),
          unit: z.string().max(24).optional(),
          delta: z.number().optional(),
          deltaLabel: z.string().max(60).optional(),
          trend: z.enum(["up", "down", "flat"]).optional(),
        })
      )
      .min(1)
      .max(8),
  }),
});

const tableBlock = z.object({
  ...baseFields,
  type: z.literal("table"),
  data: z.object({
    columns: z
      .array(
        z.object({
          key: z.string().min(1).max(60),
          label: z.string().min(1).max(80),
          numeric: z.boolean().optional(),
          unit: z.string().max(24).optional(),
          bar: z.boolean().optional(),
        })
      )
      .min(1)
      .max(8),
    rows: z
      .array(z.record(z.union([z.string().max(400), z.number(), z.null()])))
      .max(200),
  }),
});

const chartBlock = z.object({
  ...baseFields,
  type: z.literal("chart"),
  data: z.object({
    variant: z.enum(["bar", "line", "area"]),
    unit: z.string().max(24).optional(),
    points: z
      .array(
        z.object({
          label: z.string().min(1).max(80),
          value: z.number(),
          series: z.string().max(80).optional(),
        })
      )
      .min(1)
      .max(200),
  }),
});

const rankingBlock = z.object({
  ...baseFields,
  type: z.literal("ranking"),
  data: z.object({
    unit: z.string().max(24).optional(),
    items: z
      .array(
        z.object({
          rank: z.number().int().min(1).max(999),
          label: z.string().min(1).max(160),
          value: z.union([z.number(), z.string().max(60)]).optional(),
          note: z.string().max(240).optional(),
        })
      )
      .min(1)
      .max(50),
  }),
});

const alertBlock = z.object({
  ...baseFields,
  type: z.literal("alert"),
  data: z.object({
    severity: z.enum(["info", "warn", "risk", "critical"]),
    message: z.string().min(1).max(600),
  }),
});

const evidenceBlock = z.object({
  ...baseFields,
  type: z.literal("evidence"),
  data: z.object({
    items: z
      .array(
        z.object({
          indicator: z.string().min(1).max(200),
          value: z.union([z.string().max(120), z.number()]).optional(),
          source: z.string().min(1).max(240),
          year: z.number().int().min(1900).max(2100).optional(),
          url: z.string().url().max(600).optional(),
        })
      )
      .min(1)
      .max(50),
  }),
});

const recommendationBlock = z.object({
  ...baseFields,
  type: z.literal("recommendation"),
  data: z.object({
    items: z
      .array(
        z.object({
          priority: z.enum(["alta", "media", "baixa"]),
          text: z.string().min(1).max(400),
          rationale: z.string().max(600).optional(),
        })
      )
      .min(1)
      .max(20),
  }),
});

const nextStepBlock = z.object({
  ...baseFields,
  type: z.literal("next_step"),
  data: z.object({
    items: z
      .array(
        z.object({
          label: z.string().min(1).max(120),
          route: z.string().max(200).optional(),
          hint: z.string().max(240).optional(),
        })
      )
      .min(1)
      .max(8),
  }),
});

export const aiInsightBlockSchema = z.discriminatedUnion("type", [
  kpiBlock,
  tableBlock,
  chartBlock,
  rankingBlock,
  alertBlock,
  evidenceBlock,
  recommendationBlock,
  nextStepBlock,
]);

export const aiInsightPayloadSchema = z.object({
  version: z.literal(1),
  blocks: z.array(z.unknown()).max(24),
});

/** Valida um bloco individual; retorna null se inválido. */
export function validateBlock(input: unknown): AIInsightBlock | null {
  const result = aiInsightBlockSchema.safeParse(input);
  if (!result.success) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[aiInsights] bloco inválido descartado:", result.error.issues);
    }
    return null;
  }
  return result.data as AIInsightBlock;
}

/** Valida payload inteiro, filtrando blocos inválidos. Retorna null se envelope inválido. */
export function validatePayload(input: unknown): AIInsightPayload | null {
  const envelope = aiInsightPayloadSchema.safeParse(input);
  if (!envelope.success) return null;
  const blocks: AIInsightBlock[] = [];
  for (const raw of envelope.data.blocks) {
    const b = validateBlock(raw);
    if (b) blocks.push(b);
  }
  return { version: 1, blocks };
}
