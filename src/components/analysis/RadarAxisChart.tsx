/**
 * RadarAxisChart — Radar chart for analysis dashboard
 * Sprint 14: Enhanced Dashboard visualization
 */
import { motion } from "framer-motion";
import type { AxisAnalysis } from "@/types/aegis";

interface RadarAxisChartProps {
  axes: AxisAnalysis[];
  size?: number;
  className?: string;
}

export function RadarAxisChart({ axes, size = 300, className }: RadarAxisChartProps) {
  const center = size / 2;
  const radius = size * 0.36;
  const n = axes.length;

  const getPoint = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const scorePoints = axes.map((a, i) => getPoint(i, a.score)).map(p => `${p.x},${p.y}`).join(' ');
  const confPoints = axes.map((a, i) => getPoint(i, a.confidence * 10)).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto">
        {/* Grid rings */}
        {[2, 4, 6, 8, 10].map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon key={level} points={pts} fill="none" stroke="hsl(0 0% 18%)" strokeWidth="0.5" opacity={0.5} />
          );
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const p = getPoint(i, 10);
          return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="hsl(0 0% 18%)" strokeWidth="0.5" opacity={0.3} />;
        })}

        {/* Labels */}
        {axes.map((axis, i) => {
          const p = getPoint(i, 12);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(0 0% 54%)"
              fontSize="7"
              fontFamily="'DM Sans', sans-serif"
            >
              {axis.axis_name.split(' ').slice(0, 2).join(' ')}
            </text>
          );
        })}

        {/* Confidence polygon */}
        <motion.polygon
          points={confPoints}
          fill="hsl(var(--confidence-medium))"
          fillOpacity={0.06}
          stroke="hsl(var(--confidence-medium))"
          strokeWidth="1"
          strokeDasharray="4 3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />

        {/* Score polygon */}
        <motion.polygon
          points={scorePoints}
          fill="hsl(var(--brand-accent))"
          fillOpacity={0.12}
          stroke="hsl(var(--brand-accent))"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />

        {/* Score dots */}
        {axes.map((a, i) => {
          const p = getPoint(i, a.score);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="hsl(var(--brand-accent))"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
            />
          );
        })}
      </svg>
      <div className="flex justify-center gap-6 mt-3">
        <span className="flex items-center gap-2 text-micro text-neutral-400">
          <span className="w-3 h-0.5 bg-brand-accent rounded" /> Score
        </span>
        <span className="flex items-center gap-2 text-micro text-neutral-400">
          <span className="w-3 h-0.5 bg-confidence-medium rounded border-dashed" style={{ borderTop: '1px dashed' }} /> Confiança
        </span>
      </div>
    </div>
  );
}
