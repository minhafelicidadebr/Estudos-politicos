/**
 * ScoreBar — Animated progress bar for axis/global scores (0-10)
 * @example <ScoreBar score={7.2} axis="Capital Humano" showBand animated />
 */
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getScoreBand } from "@/types/aegis";

interface ScoreBarProps {
  score: number;
  axis?: string;
  showBand?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number): string {
  if (score <= 2) return 'hsl(var(--confidence-low))';
  if (score <= 4) return 'hsl(var(--confidence-medium))';
  if (score <= 6) return 'hsl(var(--axis-a))';
  if (score <= 8) return 'hsl(var(--confidence-high))';
  return 'hsl(142, 71%, 35%)';
}

const sizeMap = {
  sm: { bar: 'h-1.5', text: 'text-micro', score: 'text-body-sm' },
  md: { bar: 'h-2', text: 'text-body-sm', score: 'text-body-md' },
  lg: { bar: 'h-3', text: 'text-body-sm', score: 'text-heading-md' },
};

export function ScoreBar({ score, axis, showBand = false, animated = true, size = 'md', className }: ScoreBarProps) {
  const band = getScoreBand(score);
  const color = getScoreColor(score);
  const s = sizeMap[size];
  const pct = (score / 10) * 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={10} aria-label={`${axis || 'Score'}: ${score.toFixed(1)} — ${band}`}>
      <div className="flex items-center justify-between">
        {axis && <span className={cn("text-neutral-400 truncate", s.text)}>{axis}</span>}
        <div className="flex items-center gap-2 ml-auto">
          <span className={cn("font-mono font-bold text-neutral-50", s.score)}>{score.toFixed(1)}</span>
          {showBand && (
            <span className={cn("px-2 py-0.5 rounded-full font-medium", s.text)} style={{ backgroundColor: `${color}20`, color }}>
              {band}
            </span>
          )}
        </div>
      </div>
      <div className={cn("w-full rounded-full bg-neutral-700/50 overflow-hidden", s.bar)}>
        {animated ? (
          <motion.div
            className={cn("h-full rounded-full")}
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        ) : (
          <div className={cn("h-full rounded-full")} style={{ backgroundColor: color, width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
