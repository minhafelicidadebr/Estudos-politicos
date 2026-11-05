/**
 * AxisBadge — Badge for axis layer identification (A/B/C)
 * @example <AxisBadge layer="A" label="Universal" />
 */
import { cn } from "@/lib/utils";
import type { AxisLayer } from "@/types/aegis";

interface AxisBadgeProps {
  layer: AxisLayer;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const layerConfig: Record<AxisLayer, { color: string; bg: string; defaultLabel: string }> = {
  A: { color: 'text-axis-a', bg: 'bg-axis-a/10 border-axis-a/30', defaultLabel: 'Universal' },
  B: { color: 'text-axis-b', bg: 'bg-axis-b/10 border-axis-b/30', defaultLabel: 'Estrutural' },
  C: { color: 'text-axis-c', bg: 'bg-axis-c/10 border-axis-c/30', defaultLabel: 'Modular' },
};

export function AxisBadge({ layer, label, size = 'sm', className }: AxisBadgeProps) {
  const config = layerConfig[layer];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 border rounded-full font-mono font-medium",
      config.bg, config.color,
      size === 'sm' ? 'px-2 py-0.5 text-micro' : 'px-3 py-1 text-body-sm',
      className
    )}>
      {layer}
      {label !== undefined ? label : config.defaultLabel ? ` · ${config.defaultLabel}` : ''}
    </span>
  );
}
