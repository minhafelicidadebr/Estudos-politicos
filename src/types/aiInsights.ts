/**
 * AIInsightBlock — tipagem canônica para blocos estruturados de resposta da IA.
 * Nunca renderizar dados sem validação prévia via schema Zod (ver src/lib/aiInsights/schema.ts).
 */

export type Confidence = "alta" | "media" | "baixa";

export interface BaseBlock<T extends string, D> {
  id: string;
  type: T;
  title?: string;
  description?: string;
  data: D;
  sourceReferences?: string[];
  confidence?: Confidence;
  /** True quando o bloco é inferência da IA, não dado direto de fonte primária. */
  isInference?: boolean;
}

// KPI
export interface KPIItem {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  trend?: "up" | "down" | "flat";
}
export type KPIBlock = BaseBlock<"kpi", { items: KPIItem[] }>;

// Tabela
export interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  unit?: string;
  /** Renderizar barra proporcional ao lado do valor numérico. */
  bar?: boolean;
}
export interface TableRow { [k: string]: string | number | null | undefined }
export type TableBlock = BaseBlock<"table", { columns: TableColumn[]; rows: TableRow[] }>;

// Chart
export interface ChartPoint { label: string; value: number; series?: string }
export type ChartBlock = BaseBlock<
  "chart",
  {
    variant: "bar" | "line" | "area";
    unit?: string;
    points: ChartPoint[];
  }
>;

// Ranking
export interface RankingItem { rank: number; label: string; value?: number | string; note?: string }
export type RankingBlock = BaseBlock<"ranking", { items: RankingItem[]; unit?: string }>;

// Alerta / Risco
export type AlertSeverity = "info" | "warn" | "risk" | "critical";
export type AlertBlock = BaseBlock<"alert", { severity: AlertSeverity; message: string }>;

// Evidência
export interface EvidenceItem { indicator: string; value?: string | number; source: string; year?: number; url?: string }
export type EvidenceBlock = BaseBlock<"evidence", { items: EvidenceItem[] }>;

// Recomendação priorizada
export interface RecommendationItem { priority: "alta" | "media" | "baixa"; text: string; rationale?: string }
export type RecommendationBlock = BaseBlock<"recommendation", { items: RecommendationItem[] }>;

// Próximo passo (CTAs)
export interface NextStepItem { label: string; route?: string; hint?: string }
export type NextStepBlock = BaseBlock<"next_step", { items: NextStepItem[] }>;

export type AIInsightBlock =
  | KPIBlock
  | TableBlock
  | ChartBlock
  | RankingBlock
  | AlertBlock
  | EvidenceBlock
  | RecommendationBlock
  | NextStepBlock;

export interface AIInsightPayload {
  version: 1;
  blocks: AIInsightBlock[];
}
