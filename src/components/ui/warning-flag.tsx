/**
 * WarningFlag — Displays methodology warnings with expandable message
 * @example <WarningFlag type="INFERÊNCIA" message="Score inferido de proxy regional" />
 */
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { type WarningType } from "@/types/aegis";

interface WarningFlagProps {
  type: WarningType;
  message?: string;
  className?: string;
}

const criticalTypes: WarningType[] = ['CONFIANCA_BAIXA', 'CONFLITO_FONTES'];

export function WarningFlag({ type, message, className }: WarningFlagProps) {
  const [expanded, setExpanded] = useState(false);
  const isCritical = criticalTypes.includes(type);

  return (
    <div className={cn(
      "flex flex-col rounded-lg border px-3 py-2 text-xs",
      isCritical
        ? "border-destructive/30 bg-destructive/5"
        : "border-confidence-medium/30 bg-confidence-medium/5",
      className
    )}>
      <button
        onClick={() => message && setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
        aria-expanded={message ? expanded : undefined}
      >
        <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0", isCritical ? "text-destructive" : "text-confidence-medium")} />
        <span className={cn("font-mono font-semibold", isCritical ? "text-destructive" : "text-confidence-medium")}>
          {type}
        </span>
        {message && (
          <ChevronDown className={cn("w-3 h-3 ml-auto text-neutral-400 transition-transform", expanded && "rotate-180")} />
        )}
      </button>
      {expanded && message && (
        <p className="mt-2 text-neutral-400 pl-5.5 leading-relaxed">{message}</p>
      )}
    </div>
  );
}
