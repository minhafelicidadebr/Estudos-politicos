/**
 * ModuleDeepDiveModal — Premium explanatory modal for advanced modules.
 * Displays methodology, value proposition, innovation, processes and pedagogical hooks.
 */
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Microscope,
  Lightbulb,
  Workflow,
  GraduationCap,
  ShieldCheck,
  Layers,
  Database,
  Settings2,
  Cpu,
  CheckCircle2,
  BarChart3,
  Rocket,
  type LucideIcon,
} from 'lucide-react';

export interface ModuleDeepDive {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  link: string;
  badges: string[];
  jsonTag: string;
  methodology: string;
  valueProp: string;
  innovation: string;
  process: string[];
  pedagogicalHook: string;
  scientificBase: string[];
  /** Optional per-module enrichment for the operational roadmap. */
  inputs?: string[];
  outputs?: string[];
  kpis?: string[];
  integrations?: string[];
  ctaLabel?: string;
}

/* ----------------- Operational Roadmap auto-builder ------------------
 * Derives a 6-phase state-of-the-art operational flow from the module's
 * existing fields, with optional overrides via inputs/outputs/kpis/etc.
 * Keeps the data model lean while delivering a premium visual flow.
 * ------------------------------------------------------------------- */
type Phase = {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  bullets: string[];
};

function buildRoadmap(m: ModuleDeepDive): Phase[] {
  const p = m.process ?? [];
  const setupSteps = p.slice(0, Math.max(1, Math.ceil(p.length / 3)));
  const computeSteps = p.slice(setupSteps.length, setupSteps.length + Math.ceil(p.length / 3));
  const validateSteps = p.slice(setupSteps.length + computeSteps.length);

  const defaultInputs = [
    'Seleção contextual do usuário (governo, período, cenário)',
    `Corpus indexado da Ágora — referência ${m.jsonTag}`,
    'Parâmetros calibrados pelo motor (defaults auditáveis)',
  ];
  const defaultOutputs = [
    'Visualizações interativas com tooltips explicativos',
    'Relatório executivo exportável (PDF editorial + JSON bruto)',
    'Trilha de auditoria SIB com snapshot reprodutível',
  ];
  const defaultKpis = [
    'Cobertura SIB ≥ 0,75',
    'Confiança calibrada (IC 80% / 95%)',
    'Reprodutibilidade determinística (mesma entrada → mesma saída)',
  ];
  const defaultIntegrations = [
    'Biblioteca (citações e leituras complementares)',
    'Co-Piloto Sofia (explicação contextual ao vivo)',
    'Auditoria & Metodologia (rastreio completo)',
  ];

  return [
    {
      id: 'inputs',
      label: 'Entradas & Pré-requisitos',
      icon: Database,
      description: 'Dados, parâmetros e contexto necessários para iniciar a simulação com integridade.',
      bullets: m.inputs ?? defaultInputs,
    },
    {
      id: 'setup',
      label: 'Configuração & Calibração',
      icon: Settings2,
      description: 'Definição de cenário, normalização de variáveis e calibração determinística do motor.',
      bullets: setupSteps.length ? setupSteps : ['Configuração assistida por defaults auditáveis.'],
    },
    {
      id: 'compute',
      label: 'Processamento Determinístico',
      icon: Cpu,
      description: 'Execução do núcleo matemático/estatístico — 100% reprodutível, sem LLM no loop crítico.',
      bullets: computeSteps.length ? computeSteps : ['Execução do motor central conforme metodologia.'],
    },
    {
      id: 'validate',
      label: 'Validação & Auditoria SIB',
      icon: CheckCircle2,
      description: 'Checagens de robustez, cobertura mínima de fontes e selo Source-Intelligence-Base.',
      bullets: validateSteps.length
        ? [...validateSteps, ...(m.kpis ?? defaultKpis).slice(0, 1)]
        : (m.kpis ?? defaultKpis),
    },
    {
      id: 'outputs',
      label: 'Saídas & Visualizações',
      icon: BarChart3,
      description: 'Como o resultado é apresentado: cartões, gráficos, narrativa e exportações premium.',
      bullets: m.outputs ?? defaultOutputs,
    },
    {
      id: 'action',
      label: 'Ação Cívica & Integrações',
      icon: Rocket,
      description: 'Próximos passos sugeridos e integrações com os demais módulos do ecossistema Ágora.',
      bullets: m.integrations ?? defaultIntegrations,
    },
  ];
}

interface Props {
  module: ModuleDeepDive | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SectionBlock = ({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: LucideIcon;
  label: string;
  color: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
  >
    <div className="flex items-center gap-2 mb-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: color + '18' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
        {label}
      </h4>
    </div>
    <div className="text-sm text-neutral-400 leading-relaxed">{children}</div>
  </motion.div>
);

export const ModuleDeepDiveModal = ({ module, open, onOpenChange }: Props) => {
  if (!module) return null;
  const Icon = module.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto bg-[#0A1628] border border-white/10 p-0">
        {/* Header */}
        <div
          className="relative p-6 border-b border-white/5"
          style={{
            background: `linear-gradient(135deg, ${module.color}18 0%, transparent 70%)`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: module.color + '20' }}
            >
              <Icon className="w-7 h-7" style={{ color: module.color }} />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ color: module.color, backgroundColor: module.color + '12' }}
                >
                  {module.jsonTag}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Módulo determinístico
                </span>
              </div>
              <DialogTitle className="font-display text-xl text-neutral-50 leading-tight">
                {module.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-brand-accent/80 italic mt-1">
                {module.subtitle}
              </DialogDescription>
            </div>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed mt-4">{module.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {module.badges.map((b) => (
              <span
                key={b}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{
                  borderColor: module.color + '30',
                  color: module.color,
                  backgroundColor: module.color + '08',
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SectionBlock icon={Microscope} label="Metodologia" color={module.color}>
              {module.methodology}
            </SectionBlock>
            <SectionBlock icon={Lightbulb} label="Proposta de Valor" color={module.color}>
              {module.valueProp}
            </SectionBlock>
            <SectionBlock icon={Sparkles} label="Inovação" color={module.color}>
              {module.innovation}
            </SectionBlock>
            <SectionBlock icon={GraduationCap} label="Gancho Pedagógico" color={module.color}>
              {module.pedagogicalHook}
            </SectionBlock>
          </div>

          <SectionBlock icon={Workflow} label="Fluxo do Processo (resumo)" color={module.color}>
            <ol className="space-y-2 mt-1">
              {module.process.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: module.color + '18',
                      color: module.color,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-neutral-400 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </SectionBlock>

          {/* ----------- Roadmap Operacional Completo (6 fases) ----------- */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-5">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: module.color + '18' }}
              >
                <Rocket className="w-3.5 h-3.5" style={{ color: module.color }} />
              </div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-200">
                Roadmap Operacional Completo
              </h4>
              <span className="ml-auto text-[10px] text-neutral-500">6 fases · ponta-a-ponta</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Do dado bruto à ação cívica — fluxo determinístico auditável, alinhado ao framework PIR+/SIB.
            </p>

            <ol className="relative space-y-3">
              <div
                className="absolute left-[14px] top-2 bottom-2 w-px opacity-30"
                style={{ background: `linear-gradient(180deg, ${module.color}, transparent)` }}
                aria-hidden
              />
              {buildRoadmap(module).map((phase, idx) => {
                const PhaseIcon = phase.icon;
                return (
                  <motion.li
                    key={phase.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="relative pl-10"
                  >
                    <div
                      className="absolute left-0 top-0.5 w-7 h-7 rounded-lg flex items-center justify-center ring-2 ring-[#0A1628]"
                      style={{ backgroundColor: module.color + '22', color: module.color }}
                    >
                      <PhaseIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/10 transition-colors">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{ color: module.color, backgroundColor: module.color + '12' }}
                        >
                          Fase {idx + 1}
                        </span>
                        <h5 className="text-sm font-semibold text-neutral-100">{phase.label}</h5>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-relaxed mb-2">
                        {phase.description}
                      </p>
                      <ul className="space-y-1">
                        {phase.bullets.map((b, i) => (
                          <li key={i} className="flex gap-2 text-[12px] text-neutral-400 leading-relaxed">
                            <span
                              className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                              style={{ backgroundColor: module.color }}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>


          <SectionBlock icon={Layers} label="Base Científica" color={module.color}>
            <div className="flex flex-wrap gap-1.5">
              {module.scientificBase.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded-md text-[11px] bg-white/[0.04] border border-white/5 text-neutral-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </SectionBlock>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/70" />
            100% determinístico · Protocolo SIB · Trilha de auditoria completa
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={module.link}
              onClick={() => onOpenChange(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: module.color,
                color: '#0A1628',
              }}
            >
              <Sparkles className="w-4 h-4" />
              {module.ctaLabel ?? 'Explorar este módulo'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-3 rounded-xl text-sm font-medium border border-white/10 text-neutral-400 hover:bg-white/5 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleDeepDiveModal;
