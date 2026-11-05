/**
 * ProportionalBar — barra discreta ao lado de um valor numérico dentro de tabelas.
 * Nunca oculta o valor original. Escala explícita por coluna. Acessível.
 */
import { memo } from "react";

interface Props {
  value: number;
  max: number;
  min?: number;
  unit?: string;
  ariaLabel?: string;
}

export const ProportionalBar = memo(function ProportionalBar({
  value,
  max,
  min = 0,
  unit,
  ariaLabel,
}: Props) {
  const safeMax = Number.isFinite(max) && max > min ? max : 1;
  const clamped = Math.max(min, Math.min(value, safeMax));
  const pct = ((clamped - min) / (safeMax - min)) * 100;

  return (
    <div className="inline-flex items-center gap-2 min-w-[120px]">
      <span
        className="tabular-nums text-neutral-100 text-xs font-medium min-w-[52px] text-right"
        aria-hidden={ariaLabel ? "true" : undefined}
      >
        {value.toLocaleString("pt-BR")}
        {unit ? <span className="text-neutral-500 ml-0.5">{unit}</span> : null}
      </span>
      <div
        className="relative h-1.5 flex-1 min-w-[48px] rounded-full bg-white/[0.06] overflow-hidden"
        role="img"
        aria-label={ariaLabel ?? `Barra proporcional: ${value}${unit ? " " + unit : ""} de máximo ${safeMax}`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand-accent/70"
          style={{ width: `${pct.toFixed(2)}%` }}
        />
      </div>
    </div>
  );
});
