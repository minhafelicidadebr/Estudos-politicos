/**
 * SourceTag — Renders a data source with institution, date, confidence
 * @example <SourceTag source={{ institution: "World Bank", abbreviation: "WB", ... }} />
 */
import { ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceBadge } from "./confidence-badge";
import { type DataSource } from "@/types/aegis";

interface SourceTagProps {
  source: DataSource;
  compact?: boolean;
  className?: string;
}

export function SourceTag({ source, compact = false, className }: SourceTagProps) {
  const handleClick = () => {
    if (source.url && source.validated) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-micro text-neutral-400 font-mono", className)}>
        <span className="font-semibold text-neutral-200">{source.abbreviation}</span>
        {source.date && <span>· {source.date}</span>}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!source.url || !source.validated}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-700/50 hover:border-neutral-600 transition-colors text-left group disabled:cursor-default disabled:opacity-70",
        className
      )}
      aria-label={`Fonte: ${source.institution}`}
    >
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-body-sm text-neutral-200 font-medium truncate">{source.institution}</span>
        <div className="flex items-center gap-2 text-micro text-neutral-400">
          {source.date && <span>{source.date}</span>}
          <span>· {source.data_type}</span>
        </div>
      </div>
      <ConfidenceBadge confidence={source.confidence} size="sm" />
      {source.url && source.validated ? (
        <ExternalLink className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 shrink-0" />
      ) : source.url && !source.validated ? (
        <AlertCircle className="w-3.5 h-3.5 text-confidence-medium shrink-0" />
      ) : null}
    </button>
  );
}
