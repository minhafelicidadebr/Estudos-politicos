/**
 * AISkillsPanel — vitrine premium da Biblioteca de Skills Ágora (v2.0 ToT).
 * Usada em AIPromptTransparency (por eixo) e MethodologyPage (global).
 * Cada card abre um pop-out pedagógico profundo; CTAs globais abrem o
 * protocolo de auditoria independente e a colaboração aberta.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, ShieldCheck, Scale, Brain, CheckCircle2, ArrowUpRight,
  Beaker, Users, GitBranch, Layers,
} from "lucide-react";
import { AI_SKILLS, SKILLS_LIBRARY_VERSION, type AISkill, type SkillTier } from "@/data/aiSkills";
import { Button } from "@/components/ui/button";
import { SkillDeepDiveModal } from "@/components/skills/SkillDeepDiveModal";
import { IndependentAuditModal } from "@/components/skills/IndependentAuditModal";
import { SkillContributionModal } from "@/components/skills/SkillContributionModal";

const TIER_META: Record<SkillTier, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string; dot: string }> = {
  core:          { label: "Núcleo",        icon: Brain,       tone: "text-brand-accent border-brand-accent/40 bg-brand-accent/10", dot: "bg-brand-accent" },
  rigor:         { label: "Rigor",         icon: Beaker,      tone: "text-axis-a border-axis-a/40 bg-axis-a/10",                   dot: "bg-axis-a" },
  integridade:   { label: "Integridade",   icon: ShieldCheck, tone: "text-axis-b border-axis-b/40 bg-axis-b/10",                   dot: "bg-axis-b" },
  epistemologia: { label: "Epistemologia", icon: Scale,       tone: "text-axis-c border-axis-c/40 bg-axis-c/10",                   dot: "bg-axis-c" },
};

interface Props {
  compact?: boolean;
  title?: string;
  description?: string;
  activeSkillIds?: string[];
}

export function AISkillsPanel({
  compact = false,
  title = "Biblioteca de Skills Premium — a lógica por trás de cada pesquisa",
  description = "Oito skills metodológicas construídas sob um framework Tree of Thoughts: para cada decisão de método, geramos caminhos concorrentes, escolhemos por critério explícito e publicamos o caminho descartado. Todas se aplicam automaticamente em cada pesquisa do app — antipolarização, rigor econométrico e cadeia de custódia rastreável.",
  activeSkillIds,
}: Props) {
  const [selected, setSelected] = useState<AISkill | null>(null);
  const [deepOpen, setDeepOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [filter, setFilter] = useState<SkillTier | "all">("all");

  const visible = useMemo(
    () => (filter === "all" ? AI_SKILLS : AI_SKILLS.filter((s) => s.tier === filter)),
    [filter]
  );

  const openDeep = (s: AISkill) => { setSelected(s); setDeepOpen(true); };

  return (
    <section
      className="relative overflow-hidden rounded-[1.5rem] border border-brand-accent/25 bg-gradient-to-br from-brand-accent/[0.05] via-transparent to-axis-a/[0.04] p-4 sm:p-6 space-y-5"
      aria-labelledby="ai-skills-title"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent" />

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-brand-accent">
          <Sparkles className="w-4 h-4" />
          <p className="text-micro uppercase tracking-[0.22em]">Ágora AI Skills · v{SKILLS_LIBRARY_VERSION} · Tree of Thoughts</p>
        </div>
        <h3 id="ai-skills-title" className="font-display text-heading-md text-neutral-50">{title}</h3>
        <p className="text-body-sm text-neutral-400 max-w-3xl leading-relaxed">{description}</p>

        {/* Filtros por camada */}
        <div className="flex flex-wrap gap-2 mt-1" role="tablist" aria-label="Filtrar skills por camada">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} icon={Layers} label={`Todas · ${AI_SKILLS.length}`} tone="text-neutral-200 border-neutral-700/60 bg-white/[0.04]" />
          {(Object.keys(TIER_META) as SkillTier[]).map((t) => {
            const meta = TIER_META[t];
            const count = AI_SKILLS.filter((s) => s.tier === t).length;
            return (
              <FilterChip
                key={t}
                active={filter === t}
                onClick={() => setFilter(filter === t ? "all" : t)}
                icon={meta.icon}
                label={`${meta.label} · ${count}`}
                tone={meta.tone}
              />
            );
          })}
        </div>
      </header>

      {/* Grade de skills */}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
        {visible.map((s, i) => (
          <SkillCard
            key={s.id}
            skill={s}
            index={i}
            highlighted={!activeSkillIds || activeSkillIds.includes(s.id)}
            onOpen={() => openDeep(s)}
          />
        ))}
      </div>

      {/* CTA — auditoria independente */}
      <div className="grid gap-3 md:grid-cols-3">
        <article className="md:col-span-2 relative overflow-hidden rounded-xl border border-axis-c/30 bg-gradient-to-br from-axis-c/[0.08] to-transparent p-5">
          <div className="flex items-center gap-2 text-axis-c mb-2">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-micro uppercase tracking-[0.2em]">Compromisso com a verdade verificável</p>
          </div>
          <h4 className="font-display text-heading-sm text-neutral-50 mb-1.5">
            Não confie em nós — audite. E nós ensinamos como.
          </h4>
          <p className="text-body-sm text-neutral-400 leading-relaxed mb-4 max-w-2xl">
            Toda a inteligência das Skills reduz erro, viés e alucinação, mas não elimina a incerteza. Por isso publicamos
            um protocolo de 6 etapas e prompts prontos para você reauditar qualquer análise com fontes primárias e com
            modelos de IA de outras famílias — método científico aplicado de fora para dentro.
          </p>
          <Button onClick={() => { setSelected(null); setAuditOpen(true); }} className="gap-2">
            <ShieldCheck className="w-4 h-4" /> Abrir protocolo de auditoria independente
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </article>

        <article className="relative overflow-hidden rounded-xl border border-axis-b/30 bg-gradient-to-br from-axis-b/[0.08] to-transparent p-5 flex flex-col">
          <div className="flex items-center gap-2 text-axis-b mb-2">
            <Users className="w-4 h-4" />
            <p className="text-micro uppercase tracking-[0.2em]">Inteligência coletiva</p>
          </div>
          <h4 className="font-display text-heading-sm text-neutral-50 mb-1.5">Melhore uma skill</h4>
          <p className="text-body-sm text-neutral-400 leading-relaxed mb-4 flex-1">
            Encontrou divergência ou um método mais robusto? Propostas com fonte verificável entram no changelog versionado.
          </p>
          <Button variant="outline" onClick={() => setContribOpen(true)} className="gap-2 w-full">
            <Users className="w-4 h-4" /> Contribuir
          </Button>
        </article>
      </div>

      {/* Pop-outs */}
      <SkillDeepDiveModal
        skill={selected}
        open={deepOpen}
        onOpenChange={setDeepOpen}
        onOpenAudit={() => { setDeepOpen(false); setAuditOpen(true); }}
        onOpenContribute={() => { setDeepOpen(false); setContribOpen(true); }}
      />
      <IndependentAuditModal
        open={auditOpen}
        onOpenChange={setAuditOpen}
        contextPrompt={selected?.externalAuditPrompt}
        contextLabel={selected ? `${selected.id} · ${selected.name}` : undefined}
      />
      <SkillContributionModal open={contribOpen} onOpenChange={setContribOpen} skillId={selected?.id} />
    </section>
  );
}

function FilterChip({
  active, onClick, icon: Icon, label, tone,
}: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string; tone: string }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-micro font-medium transition-all ${tone} ${
        active ? "ring-1 ring-inset ring-current opacity-100" : "opacity-70 hover:opacity-100"
      }`}
    >
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

function SkillCard({
  skill, index, highlighted, onOpen,
}: { skill: AISkill; index: number; highlighted: boolean; onOpen: () => void }) {
  const meta = TIER_META[skill.tier];
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.24) }}
      className={`group relative rounded-xl border overflow-hidden transition-all ${
        highlighted
          ? "border-neutral-700/40 bg-white/[0.03] hover:border-brand-accent/50 hover:bg-white/[0.05]"
          : "border-neutral-800/40 bg-white/[0.015] opacity-60"
      }`}
    >
      <button onClick={onOpen} className="w-full text-left p-4 flex flex-col gap-3 h-full" aria-label={`Abrir detalhes de ${skill.name}`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${meta.tone}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-micro text-neutral-500">{skill.id}</span>
              <span className={`text-micro px-1.5 py-0.5 rounded border ${meta.tone}`}>{meta.label}</span>
              <span className="text-micro text-neutral-500 font-mono">v{skill.version}</span>
            </div>
            <h4 className="text-body-sm font-semibold text-neutral-50 leading-snug">{skill.name}</h4>
            <p className="text-micro text-neutral-400 mt-1 leading-relaxed">{skill.tagline}</p>
          </div>
        </div>

        {/* Preview pedagógico — nível cidadão */}
        <p className="text-micro text-neutral-400 leading-relaxed line-clamp-3">
          {skill.pedagogy.citizen}
        </p>

        {/* Sinais de auditabilidade */}
        <div className="mt-auto flex items-center gap-3 flex-wrap pt-1 text-micro text-neutral-500">
          <span className="inline-flex items-center gap-1"><GitBranch className="w-3 h-3 text-axis-a" />{skill.totBranches.length} decisão ToT</span>
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-confidence-high" />{skill.metrics.length} métricas</span>
          <span className="inline-flex items-center gap-1"><Beaker className="w-3 h-3 text-confidence-low" />{skill.failureModes.length} modos de falha</span>
        </div>

        <span className="inline-flex items-center gap-1 text-micro text-brand-accent font-medium group-hover:gap-2 transition-all">
          Entender a lógica em profundidade <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </button>
    </motion.article>
  );
}
