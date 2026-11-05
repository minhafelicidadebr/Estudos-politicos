/**
 * ConfidenceDistribution — Mini bar chart of confidence per axis
 * Sprint 14: Enhanced Dashboard
 */
import { motion } from "framer-motion";
import type { AxisAnalysis } from "@/types/aegis";
import { getConfidenceLevel } from "@/types/aegis";

export function ConfidenceDistribution({ axes, className }: { axes: AxisAnalysis[]; className?: string }) {
  const sorted = [...axes].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className={className}>
      <h4 className="text-micro text-neutral-500 uppercase tracking-wider font-semibold mb-4">Distribuição de Confiança</h4>
      <div className="space-y-2">
        {sorted.map((axis, i) => {
          const level = getConfidenceLevel(axis.confidence);
          const colorVar = level === 'high' ? '--confidence-high' : level === 'medium' ? '--confidence-medium' : level === 'low' ? '--confidence-low' : '--confidence-inconclusive';
          return (
            <div key={axis.axis_id} className="flex items-center gap-3">
              <span className="text-micro text-neutral-400 w-24 truncate shrink-0">{axis.axis_name.split(' ').slice(0, 2).join(' ')}</span>
              <div className="flex-1 h-2 rounded-full bg-neutral-700/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: `hsl(var(${colorVar}))` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${axis.confidence * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              </div>
              <span className="font-mono text-micro w-10 text-right" style={{ color: `hsl(var(${colorVar}))` }}>
                {(axis.confidence * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
