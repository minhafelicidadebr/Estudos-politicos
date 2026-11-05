/**
 * AnalysisProgressPanel — Real-time simulation of 9-stage analysis pipeline
 * Sprint 14: Enhanced Dashboard with progress simulation
 */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search, Settings, FlaskConical, FileCheck,
  GitCompare, BarChart3, Shield, BookOpen, Database,
  Check, Loader2,
} from "lucide-react";

interface Stage {
  id: number;
  icon: React.ElementType;
  label: string;
  desc: string;
  duration: number; // ms
}

const stages: Stage[] = [
  { id: 1, icon: Search, label: "Diagnóstico do País", desc: "Identificando regime, estrutura e maturidade...", duration: 2000 },
  { id: 2, icon: Settings, label: "Configuração de Eixos", desc: "Ativando eixos A + B automáticos + C selecionados...", duration: 1200 },
  { id: 3, icon: FlaskConical, label: "Análise PIR+ (paralela)", desc: "Tese, antítese e julgamento por eixo...", duration: 5000 },
  { id: 4, icon: FileCheck, label: "Classificação de Evidências", desc: "Validando fontes e cadeia de custódia...", duration: 2500 },
  { id: 5, icon: GitCompare, label: "Efeitos Cruzados", desc: "Identificando top 3 interações entre eixos...", duration: 2000 },
  { id: 6, icon: BarChart3, label: "Cálculo de Scores", desc: "Pesos, penalizações e bonificações...", duration: 1500 },
  { id: 7, icon: Shield, label: "Validação VCO (GPT-4o)", desc: "Cross-validation independente...", duration: 3000 },
  { id: 8, icon: BookOpen, label: "Output Pedagógico", desc: "Adaptando para a camada selecionada...", duration: 1800 },
  { id: 9, icon: Database, label: "Registro de Auditoria", desc: "Escrevendo trilha imutável...", duration: 800 },
];

export function AnalysisProgressPanel({
  isRunning,
  onComplete,
}: {
  isRunning: boolean;
  onComplete?: () => void;
}) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isRunning) return;
    setCurrentStage(0);
    setCompletedStages(new Set());

    let idx = 0;
    const runNext = () => {
      if (idx >= stages.length) {
        onComplete?.();
        return;
      }
      setCurrentStage(idx);
      setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, idx]));
        idx++;
        runNext();
      }, stages[idx].duration);
    };
    runNext();
  }, [isRunning]);

  const totalTime = stages.reduce((a, s) => a + s.duration, 0);
  const elapsed = stages.filter((_, i) => completedStages.has(i)).reduce((a, s) => a + s.duration, 0);
  const progress = elapsed / totalTime;

  return (
    <div className="p-6 rounded-2xl border border-brand-accent/20 bg-brand-accent/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-body-md font-semibold text-neutral-50">Pipeline de Análise</h3>
        <span className="font-mono text-micro text-brand-accent">{Math.round(progress * 100)}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-neutral-700/50 mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-accent"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const completed = completedStages.has(i);
          const active = currentStage === i && !completed;
          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active ? 'bg-brand-accent/10' : completed ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {completed ? (
                  <Check className="w-4 h-4 text-confidence-high" />
                ) : active ? (
                  <Loader2 className="w-4 h-4 text-brand-accent animate-spin" />
                ) : (
                  <stage.icon className="w-4 h-4 text-neutral-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-body-sm font-medium ${active ? 'text-neutral-50' : completed ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {stage.label}
                </p>
                {active && <p className="text-micro text-neutral-400">{stage.desc}</p>}
              </div>
              <span className="font-mono text-micro text-neutral-600">0{stage.id}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
