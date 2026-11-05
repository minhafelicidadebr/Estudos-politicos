/**
 * ConfidenceBadge — Displays a confidence level with color-coded indicator
 * @example <ConfidenceBadge confidence={0.78} showLabel />
 */
import { cn } from "@/lib/utils";
import { getConfidenceLevel, type ConfidenceLevel } from "@/types/aegis";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const levelConfig: Record<ConfidenceLevel, { label: string; tooltip: string; barClass: string; textClass: string }> = {
  high: {
    label: 'Alta',
    tooltip: 'Dados sustentam solidamente esta afirmação',
    barClass: 'bg-confidence-high',
    textClass: 'text-confidence-high',
  },
  medium: {
    label: 'Moderada',
    tooltip: 'Dados apontam com ressalvas',
    barClass: 'bg-confidence-medium',
    textClass: 'text-confidence-medium',
  },
  low: {
    label: 'Baixa',
    tooltip: 'Inferência plausível mas frágil',
    barClass: 'bg-confidence-low',
    textClass: 'text-confidence-low',
  },
  inconclusive: {
    label: 'Inconclusiva',
    tooltip: 'Dados insuficientes para determinar',
    barClass: 'bg-confidence-inconclusive',
    textClass: 'text-confidence-inconclusive',
  },
};

const sizeMap = {
  sm: { bar: 'h-1.5 w-12', text: 'text-micro', gap: 'gap-1.5' },
  md: { bar: 'h-2 w-16', text: 'text-body-sm', gap: 'gap-2' },
  lg: { bar: 'h-2.5 w-20', text: 'text-body-md', gap: 'gap-3' },
};

export function ConfidenceBadge({ confidence, showLabel = false, size = 'md', className }: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(confidence);
  const config = levelConfig[level];
  const s = sizeMap[size];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center", s.gap, className)} role="meter" aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={1} aria-label={`Confiança: ${(confidence * 100).toFixed(0)}% — ${config.label}`}>
          <span className={cn("rounded-full overflow-hidden bg-neutral-700", s.bar)}>
            <span className={cn("h-full block rounded-full transition-all duration-700", config.barClass)} style={{ width: `${confidence * 100}%` }} />
          </span>
          <span className={cn("font-mono font-medium", s.text, config.textClass)}>
            {(confidence * 100).toFixed(0)}%
          </span>
          {showLabel && (
            <span className={cn("font-medium", s.text, config.textClass)}>{config.label}</span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-neutral-800 border-neutral-700 text-neutral-200 text-xs">
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
