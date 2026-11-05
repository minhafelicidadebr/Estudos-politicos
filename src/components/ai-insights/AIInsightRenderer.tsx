/**
 * AIInsightRenderer — despachador seguro para blocos validados de resposta da IA.
 * Uso: passar blocks já validados (ver src/lib/aiInsights/parse.ts).
 * Nunca renderiza HTML arbitrário; usa apenas texto escapado por padrão do React.
 */
import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert, Info,
  BookMarked, Target, ArrowRight, Trophy, BarChart3, ListChecks,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type {
  AIInsightBlock, KPIBlock, TableBlock, ChartBlock, RankingBlock,
  AlertBlock, EvidenceBlock, RecommendationBlock, NextStepBlock, Confidence,
} from "@/types/aiInsights";
import { ProportionalBar } from "./ProportionalBar";

interface RendererProps {
  blocks: AIInsightBlock[];
  className?: string;
}

function ConfidenceBadge({ level }: { level?: Confidence }) {
  if (!level) return null;
  const map: Record<Confidence, { label: string; cls: string }> = {
    alta: { label: "Confiança alta", cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
    media: { label: "Confiança média", cls: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
    baixa: { label: "Confiança baixa", cls: "bg-rose-400/10 text-rose-300 border-rose-400/30" },
  };
  const { label, cls } = map[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function SourceChips({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Fontes referenciadas">
      {items.slice(0, 8).map((s, i) => (
        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-neutral-400">
          <BookMarked className="w-2.5 h-2.5 inline mr-1" aria-hidden="true" />
          {s}
        </span>
      ))}
    </div>
  );
}

function BlockShell({
  title, description, confidence, sourceReferences, isInference, srDescription, children,
}: {
  title?: string; description?: string; confidence?: Confidence;
  sourceReferences?: string[]; isInference?: boolean; srDescription: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="my-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
      aria-label={title ?? srDescription}
    >
      {(title || confidence || isInference) && (
        <header className="flex items-start justify-between gap-3 mb-2">
          <div>
            {title && <h4 className="text-sm font-semibold text-neutral-50 leading-tight">{title}</h4>}
            {description && <p className="text-xs text-neutral-400 mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isInference && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-300">
                Inferência da IA
              </span>
            )}
            <ConfidenceBadge level={confidence} />
          </div>
        </header>
      )}
      <span className="sr-only">{srDescription}</span>
      {children}
      <SourceChips items={sourceReferences} />
    </section>
  );
}

// ============ Blocos ============

function KPIView({ block }: { block: KPIBlock }) {
  const sr = `Painel de indicadores com ${block.data.items.length} métrica(s): ${block.data.items
    .map((i) => `${i.label} ${i.value}${i.unit ? " " + i.unit : ""}`)
    .join("; ")}.`;
  return (
    <BlockShell
      title={block.title} description={block.description} confidence={block.confidence}
      sourceReferences={block.sourceReferences} isInference={block.isInference} srDescription={sr}
    >
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {block.data.items.map((k, i) => {
          const Trend = k.trend === "up" ? TrendingUp : k.trend === "down" ? TrendingDown : Minus;
          const trendClr = k.trend === "up" ? "text-emerald-300" : k.trend === "down" ? "text-rose-300" : "text-neutral-400";
          return (
            <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{k.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-semibold text-neutral-50 tabular-nums">
                  {typeof k.value === "number" ? k.value.toLocaleString("pt-BR") : k.value}
                </span>
                {k.unit && <span className="text-[11px] text-neutral-500">{k.unit}</span>}
              </div>
              {(k.delta !== undefined || k.deltaLabel) && (
                <div className={`mt-1 flex items-center gap-1 text-[11px] ${trendClr}`}>
                  <Trend className="w-3 h-3" aria-hidden="true" />
                  {k.delta !== undefined ? <span className="tabular-nums">{k.delta > 0 ? "+" : ""}{k.delta}</span> : null}
                  {k.deltaLabel && <span className="text-neutral-500">{k.deltaLabel}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BlockShell>
  );
}

function TableView({ block }: { block: TableBlock }) {
  const { columns, rows } = block.data;
  const maxByCol = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of columns) {
      if (c.numeric && c.bar) {
        let max = -Infinity;
        for (const r of rows) {
          const v = r[c.key];
          if (typeof v === "number" && Number.isFinite(v) && v > max) max = v;
        }
        m[c.key] = Number.isFinite(max) ? max : 1;
      }
    }
    return m;
  }, [columns, rows]);

  const sr = `Tabela ${block.title ?? ""} com ${rows.length} linhas e colunas: ${columns.map((c) => c.label).join(", ")}.`;

  return (
    <BlockShell
      title={block.title} description={block.description} confidence={block.confidence}
      sourceReferences={block.sourceReferences} isInference={block.isInference} srDescription={sr}
    >
      <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
        <table className="w-full text-xs">
          <caption className="sr-only">{sr}</caption>
          <thead className="bg-white/[0.04]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="text-left px-3 py-2 text-brand-accent font-semibold border-b border-white/[0.06]">
                  {c.label}
                  {c.unit ? <span className="text-neutral-500 font-normal ml-1">({c.unit})</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="odd:bg-white/[0.01]">
                {columns.map((c) => {
                  const v = r[c.key];
                  if (c.numeric && c.bar && typeof v === "number") {
                    return (
                      <td key={c.key} className="px-3 py-2 border-b border-white/[0.04] align-middle">
                        <ProportionalBar value={v} max={maxByCol[c.key] ?? 1} unit={c.unit} />
                      </td>
                    );
                  }
                  return (
                    <td key={c.key} className={`px-3 py-2 border-b border-white/[0.04] text-neutral-200 align-top ${c.numeric ? "tabular-nums" : ""}`}>
                      {v === null || v === undefined || v === "" ? <span className="text-neutral-600">—</span> : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlockShell>
  );
}

function ChartView({ block }: { block: ChartBlock }) {
  const { variant, points, unit } = block.data;
  const sr = `Gráfico ${variant} ${block.title ?? ""}: ${points.map((p) => `${p.label} = ${p.value}${unit ? " " + unit : ""}`).join("; ")}.`;
  const data = points.map((p) => ({ label: p.label, value: p.value }));
  return (
    <BlockShell
      title={block.title} description={block.description} confidence={block.confidence}
      sourceReferences={block.sourceReferences} isInference={block.isInference} srDescription={sr}
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="#8A8A8A" fontSize={11} />
              <YAxis stroke="#8A8A8A" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : variant === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="#8A8A8A" fontSize={11} />
              <YAxis stroke="#8A8A8A" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" stroke="#8A8A8A" fontSize={11} />
              <YAxis stroke="#8A8A8A" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0A1628", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#C9A84C" fill="rgba(201,168,76,0.25)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </BlockShell>
  );
}

function RankingView({ block }: { block: RankingBlock }) {
  const sr = `Ranking com ${block.data.items.length} posições.`;
  return (
    <BlockShell
      title={block.title} description={block.description} confidence={block.confidence}
      sourceReferences={block.sourceReferences} isInference={block.isInference} srDescription={sr}
    >
      <ol className="space-y-1.5">
        {block.data.items.map((r) => (
          <li key={r.rank} className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <span className="w-6 h-6 rounded-md bg-brand-accent/15 text-brand-accent text-xs font-semibold flex items-center justify-center tabular-nums shrink-0">
              {r.rank <= 3 ? <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> : r.rank}
            </span>
            <span className="text-sm text-neutral-100 flex-1 truncate">{r.label}</span>
            {r.value !== undefined && (
              <span className="text-xs text-neutral-300 tabular-nums">
                {typeof r.value === "number" ? r.value.toLocaleString("pt-BR") : r.value}
                {block.data.unit ? <span className="text-neutral-500 ml-1">{block.data.unit}</span> : null}
              </span>
            )}
          </li>
        ))}
      </ol>
    </BlockShell>
  );
}

function AlertView({ block }: { block: AlertBlock }) {
  const map = {
    info: { Icon: Info, cls: "border-sky-400/30 bg-sky-400/[0.06] text-sky-100" },
    warn: { Icon: AlertTriangle, cls: "border-amber-400/30 bg-amber-400/[0.06] text-amber-100" },
    risk: { Icon: ShieldAlert, cls: "border-orange-400/30 bg-orange-400/[0.06] text-orange-100" },
    critical: { Icon: ShieldAlert, cls: "border-rose-400/40 bg-rose-400/[0.08] text-rose-100" },
  } as const;
  const { Icon, cls } = map[block.data.severity];
  return (
    <div role="alert" className={`my-3 rounded-xl border p-3 flex gap-3 ${cls}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {block.title && <div className="text-sm font-semibold mb-0.5">{block.title}</div>}
        <p className="text-xs leading-relaxed m-0">{block.data.message}</p>
        <SourceChips items={block.sourceReferences} />
      </div>
    </div>
  );
}

function EvidenceView({ block }: { block: EvidenceBlock }) {
  const sr = `Evidências: ${block.data.items.map((e) => e.indicator).join("; ")}.`;
  return (
    <BlockShell
      title={block.title ?? "Evidências primárias"} description={block.description}
      confidence={block.confidence} sourceReferences={block.sourceReferences}
      isInference={false} srDescription={sr}
    >
      <ul className="space-y-1.5">
        {block.data.items.map((e, i) => (
          <li key={i} className="text-xs text-neutral-200 flex items-start gap-2">
            <BookMarked className="w-3 h-3 text-brand-accent mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <span className="text-neutral-100 font-medium">{e.indicator}</span>
              {e.value !== undefined && <span className="ml-2 tabular-nums text-neutral-300">{String(e.value)}</span>}
              <span className="text-neutral-500 ml-2">
                — {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">
                    {e.source}
                  </a>
                ) : e.source}
                {e.year ? ` (${e.year})` : ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}

function RecommendationView({ block }: { block: RecommendationBlock }) {
  const priCls = {
    alta: "border-rose-400/30 bg-rose-400/[0.06] text-rose-200",
    media: "border-amber-400/30 bg-amber-400/[0.06] text-amber-200",
    baixa: "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-200",
  } as const;
  const sr = `Recomendações priorizadas: ${block.data.items.length} itens.`;
  return (
    <BlockShell
      title={block.title ?? "Recomendações priorizadas"} description={block.description}
      confidence={block.confidence} sourceReferences={block.sourceReferences}
      isInference={block.isInference ?? true} srDescription={sr}
    >
      <ul className="space-y-2">
        {block.data.items.map((r, i) => (
          <li key={i} className="flex gap-2.5">
            <ListChecks className="w-3.5 h-3.5 text-brand-accent mt-1 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priCls[r.priority]}`}>
                  {r.priority.toUpperCase()}
                </span>
                <span className="text-sm text-neutral-100">{r.text}</span>
              </div>
              {r.rationale && <p className="text-xs text-neutral-400 mt-0.5">{r.rationale}</p>}
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}

function NextStepView({ block }: { block: NextStepBlock }) {
  return (
    <div className="my-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Target className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
        <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-semibold">
          {block.title ?? "Próximos passos"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {block.data.items.map((s, i) => {
          const cls =
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-neutral-100 hover:text-brand-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60";
          if (s.route) {
            return (
              <Link key={i} to={s.route} className={cls} title={s.hint}>
                <span>{s.label}</span>
                <ArrowRight className="w-3 h-3 opacity-70" aria-hidden="true" />
              </Link>
            );
          }
          return (
            <span key={i} className="text-xs text-neutral-300 px-2 py-1">
              {s.label}
              {s.hint && <span className="text-neutral-500 ml-1">— {s.hint}</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ============ Dispatcher ============

export const AIInsightRenderer = memo(function AIInsightRenderer({ blocks, className }: RendererProps) {
  if (!blocks?.length) return null;
  return (
    <div className={className} aria-label="Visualização estruturada da resposta">
      {blocks.map((b) => {
        switch (b.type) {
          case "kpi": return <KPIView key={b.id} block={b} />;
          case "table": return <TableView key={b.id} block={b} />;
          case "chart": return <ChartView key={b.id} block={b} />;
          case "ranking": return <RankingView key={b.id} block={b} />;
          case "alert": return <AlertView key={b.id} block={b} />;
          case "evidence": return <EvidenceView key={b.id} block={b} />;
          case "recommendation": return <RecommendationView key={b.id} block={b} />;
          case "next_step": return <NextStepView key={b.id} block={b} />;
          default: {
            // Exhaustiveness safety
            const _exhaustive: never = b;
            void _exhaustive;
            return null;
          }
        }
      })}
    </div>
  );
});

export { BarChart3 as AIInsightIcon };
