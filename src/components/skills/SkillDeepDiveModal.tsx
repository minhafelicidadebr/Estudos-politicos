/**
 * SkillDeepDiveModal — pop-out premium com explicação pedagógica ampliada de uma Skill.
 * Abas: Como pensa (ToT) · Pedagogia (3 níveis) · Falhas & Métricas · Auditoria & Evolução.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  GitBranch, GraduationCap, AlertTriangle, ShieldCheck, X, Copy, Check,
  Lightbulb, HelpCircle, Target, History, MessagesSquare,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AISkill } from "@/data/aiSkills";
import { useToast } from "@/hooks/use-toast";

type TabId = "tot" | "pedagogia" | "falhas" | "auditoria";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "tot", label: "Como pensa", icon: GitBranch },
  { id: "pedagogia", label: "Pedagogia", icon: GraduationCap },
  { id: "falhas", label: "Falhas & Métricas", icon: AlertTriangle },
  { id: "auditoria", label: "Auditoria & Evolução", icon: ShieldCheck },
];

interface Props {
  skill: AISkill | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenAudit?: () => void;
  onOpenContribute?: () => void;
}

export function SkillDeepDiveModal({ skill, open, onOpenChange, onOpenAudit, onOpenContribute }: Props) {
  const [tab, setTab] = useState<TabId>("tot");
  const [level, setLevel] = useState<"citizen" | "manager" | "specialist">("citizen");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!skill) return null;

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(skill.externalAuditPrompt);
    setCopied(true);
    toast({ title: "Prompt copiado", description: `Auditoria externa de ${skill.id} pronta para colar em outra IA.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden border-brand-accent/25 bg-[hsl(var(--background))]/95 backdrop-blur-xl [&>button]:hidden"
      >
        {/* Header */}
        <header className="relative p-5 sm:p-6 border-b border-neutral-800/60 bg-gradient-to-br from-brand-accent/[0.07] via-transparent to-axis-a/[0.06]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent" />
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 w-8 h-8 rounded-lg border border-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-neutral-50 hover:border-brand-accent/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-wrap mb-2 pr-10">
            <span className="font-mono text-micro text-neutral-500">{skill.id}</span>
            <span className="text-micro px-1.5 py-0.5 rounded border border-brand-accent/40 bg-brand-accent/10 text-brand-accent">
              v{skill.version}
            </span>
            <span className="text-micro text-neutral-500 uppercase tracking-[0.18em]">{skill.tier}</span>
          </div>
          <h2 className="font-display text-heading-md text-neutral-50">{skill.name}</h2>
          <p className="text-body-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">{skill.tagline}</p>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 px-3 sm:px-5 pt-3 overflow-x-auto scrollbar-none border-b border-neutral-800/50" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 px-3 py-2 text-micro sm:text-body-sm font-medium rounded-t-lg flex items-center gap-1.5 transition-colors ${
                  active ? "text-brand-accent" : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
                {active && (
                  <motion.span layoutId="skill-tab" className="absolute inset-x-1 -bottom-px h-0.5 bg-brand-accent rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[58vh] overflow-y-auto">
          {tab === "tot" && (
            <>
              <Block title="Objetivo desta skill" icon={<Target className="w-3.5 h-3.5 text-brand-accent" />}>
                <p className="text-body-sm text-neutral-300 leading-relaxed">{skill.purpose}</p>
              </Block>

              {skill.totBranches.map((b, i) => (
                <div key={i} className="rounded-xl border border-neutral-800/60 bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-axis-a mt-0.5 shrink-0" />
                    <p className="text-body-sm text-neutral-100 font-medium">{b.question}</p>
                  </div>
                  <div className="space-y-1.5">
                    {b.branches.map((br) => {
                      const isChosen = br.startsWith(b.chosen.slice(0, 2));
                      return (
                        <div
                          key={br}
                          className={`text-micro rounded-lg border px-3 py-2 leading-relaxed ${
                            isChosen
                              ? "border-confidence-high/40 bg-confidence-high/[0.08] text-neutral-100"
                              : "border-neutral-800/60 bg-white/[0.015] text-neutral-400 line-through decoration-neutral-600"
                          }`}
                        >
                          {br}
                        </div>
                      );
                    })}
                  </div>
                  <dl className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <dt className="text-micro uppercase tracking-[0.14em] text-neutral-500 mb-1">Critério de escolha</dt>
                      <dd className="text-micro text-neutral-300 leading-relaxed">{b.criterion}</dd>
                    </div>
                    <div>
                      <dt className="text-micro uppercase tracking-[0.14em] text-neutral-500 mb-1">Por que descartamos</dt>
                      <dd className="text-micro text-neutral-300 leading-relaxed">{b.rejectedBecause}</dd>
                    </div>
                  </dl>
                </div>
              ))}

              <Block title="Método (pipeline determinístico)" icon={<GitBranch className="w-3.5 h-3.5 text-axis-a" />}>
                <ol className="space-y-1.5">
                  {skill.methodology.map((m) => (
                    <li key={m} className="text-micro text-neutral-300 leading-relaxed">{m}</li>
                  ))}
                </ol>
              </Block>
            </>
          )}

          {tab === "pedagogia" && (
            <>
              <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Nível de profundidade">
                {([
                  ["citizen", "Cidadão"],
                  ["manager", "Gestor"],
                  ["specialist", "Especialista"],
                ] as const).map(([k, label]) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={level === k}
                    onClick={() => setLevel(k)}
                    className={`px-3 py-1.5 rounded-full text-micro border transition-colors ${
                      level === k
                        ? "border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
                        : "border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <motion.p
                key={level}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-body-sm text-neutral-200 leading-relaxed"
              >
                {skill.pedagogy[level]}
              </motion.p>

              <div className="rounded-xl border border-axis-c/25 bg-axis-c/[0.05] p-4">
                <div className="flex items-center gap-1.5 text-micro uppercase tracking-[0.14em] text-axis-c mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Analogia
                </div>
                <p className="text-body-sm text-neutral-200 leading-relaxed italic">{skill.pedagogy.analogy}</p>
              </div>

              <div className="rounded-xl border border-brand-accent/25 bg-brand-accent/[0.05] p-4">
                <div className="flex items-center gap-1.5 text-micro uppercase tracking-[0.14em] text-brand-accent mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Pergunta socrática
                </div>
                <p className="text-body-sm text-neutral-100 leading-relaxed">{skill.pedagogy.socraticQuestion}</p>
              </div>

              <Block title="Princípios invioláveis" icon={<ShieldCheck className="w-3.5 h-3.5 text-confidence-high" />}>
                <ul className="space-y-1.5">
                  {skill.principles.map((p) => (
                    <li key={p} className="text-micro text-neutral-300 leading-relaxed pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-brand-accent/70">{p}</li>
                  ))}
                </ul>
              </Block>
            </>
          )}

          {tab === "falhas" && (
            <>
              <p className="text-body-sm text-neutral-400 leading-relaxed">
                Nenhuma metodologia é infalível. Publicamos como esta skill falha, o que dispara internamente e como você percebe.
              </p>
              <div className="space-y-2.5">
                {skill.failureModes.map((f) => (
                  <div key={f.flag} className="rounded-xl border border-confidence-low/25 bg-confidence-low/[0.04] p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-body-sm text-neutral-100 font-medium">{f.symptom}</p>
                      <span className="font-mono text-micro px-1.5 py-0.5 rounded bg-confidence-low/15 text-confidence-low">{f.flag}</span>
                    </div>
                    <p className="text-micro text-neutral-400"><span className="text-neutral-500">Causa: </span>{f.cause}</p>
                    <p className="text-micro text-neutral-300"><span className="text-neutral-500">Mitigação: </span>{f.mitigation}</p>
                  </div>
                ))}
              </div>

              <Block title="Métricas que você pode verificar" icon={<Target className="w-3.5 h-3.5 text-axis-a" />}>
                <div className="space-y-2">
                  {skill.metrics.map((m) => (
                    <div key={m.name} className="rounded-lg border border-neutral-800/60 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-body-sm text-neutral-100">{m.name}</span>
                        <span className="text-micro font-mono text-confidence-high">alvo {m.target}</span>
                      </div>
                      <p className="text-micro text-neutral-400 mt-1 leading-relaxed">{m.howToVerify}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="Salvaguardas (proibições)" icon={<AlertTriangle className="w-3.5 h-3.5 text-confidence-low" />}>
                <ul className="space-y-1.5">
                  {skill.guardrails.map((g) => (
                    <li key={g} className="text-micro text-neutral-300 leading-relaxed pl-3 relative before:content-['✕'] before:absolute before:left-0 before:text-confidence-low/70">{g}</li>
                  ))}
                </ul>
              </Block>
            </>
          )}

          {tab === "auditoria" && (
            <>
              <Block title="Audite esta skill em 3 passos" icon={<ShieldCheck className="w-3.5 h-3.5 text-axis-c" />}>
                <ol className="space-y-2">
                  {skill.selfAuditSteps.map((s, i) => (
                    <li key={s} className="flex gap-2.5 text-micro text-neutral-300 leading-relaxed">
                      <span className="w-5 h-5 shrink-0 rounded-full border border-axis-c/40 text-axis-c flex items-center justify-center font-mono">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </Block>

              <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/40 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-neutral-800/60">
                  <span className="text-micro uppercase tracking-[0.14em] text-neutral-400">Prompt de auditoria externa ({skill.id})</span>
                  <Button size="sm" variant="ghost" onClick={copyPrompt} className="h-7 text-micro gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-confidence-high" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <pre className="p-4 text-micro text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono max-h-56 overflow-y-auto">
                  {skill.externalAuditPrompt}
                </pre>
              </div>

              <Block title="Evolução versionada" icon={<History className="w-3.5 h-3.5 text-brand-accent" />}>
                <div className="space-y-2">
                  {skill.changelog.map((c) => (
                    <div key={c.version} className="flex gap-3 text-micro">
                      <span className="font-mono text-brand-accent shrink-0">v{c.version}</span>
                      <div>
                        <p className="text-neutral-300 leading-relaxed">{c.change}</p>
                        <p className="text-neutral-500 mt-0.5">{c.date} · origem: {c.origin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="Questões abertas — contribua" icon={<MessagesSquare className="w-3.5 h-3.5 text-axis-b" />}>
                <ul className="space-y-1.5">
                  {skill.openQuestions.map((q) => (
                    <li key={q} className="text-micro text-neutral-300 leading-relaxed pl-3 relative before:content-['?'] before:absolute before:left-0 before:text-axis-b">{q}</li>
                  ))}
                </ul>
              </Block>
            </>
          )}
        </div>

        {/* Footer CTAs */}
        <footer className="flex flex-col sm:flex-row gap-2 p-4 border-t border-neutral-800/60 bg-white/[0.015]">
          <Button onClick={onOpenAudit} className="flex-1 gap-2" variant="default">
            <ShieldCheck className="w-4 h-4" /> Audite você mesmo com outra IA
          </Button>
          <Button onClick={onOpenContribute} className="flex-1 gap-2" variant="outline">
            <MessagesSquare className="w-4 h-4" /> Propor melhoria a esta skill
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Block({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 text-micro uppercase tracking-[0.14em] text-neutral-500 mb-2">
        {icon} {title}
      </div>
      {children}
    </section>
  );
}
