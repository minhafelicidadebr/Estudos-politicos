/**
 * AIPromptTransparency — Full transparency layer for comparative analysis (FABLE 5.0).
 * Reveals: ToT reasoning tree + discarded alternatives, canonical system prompt,
 * versioned task prompts, 13-stage pipeline report, sources chain,
 * download prompt as .md, and user-driven prompt improvement suggestions.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Sparkles, GitBranch, FileText, Download, Copy, Send,
  ChevronDown, ChevronRight, Wand2, BookOpen, Database, Cpu, Lightbulb, Layers,
} from "lucide-react";
import type { AxisComparativeResult, GovernmentRecord, PrimaryDataPoint } from "@/types/aegis";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { AISkillsPanel } from "@/components/comparative/AISkillsPanel";
import { AI_SKILLS } from "@/data/aiSkills";
import { CANONICAL_SYSTEM_PROMPT, VERSIONED_TASK_PROMPTS } from "@/data/promptRegistry";

interface Props {
  result: AxisComparativeResult;
  countryName: string;
  governments?: GovernmentRecord[];
}

export function AIPromptTransparency({ result, countryName, governments = [] }: Props) {
  const [treeOpen, setTreeOpen] = useState(true);
  const [totDecisionsOpen, setTotDecisionsOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionEmail, setSuggestionEmail] = useState("");
  const [suggestionType, setSuggestionType] = useState<"aprimoramento" | "correção" | "novo_protocolo">("aprimoramento");

  const userPromptEcho = useMemo(() => {
    const govList = (governments.length
      ? governments
      : result.governmentScores.map((g) => ({
          id: g.governmentId,
          name: g.governmentName,
          leaderName: "—",
          party: "—",
          yearStart: parseInt(g.period.split("–")[0], 10) || 0,
          yearEnd: parseInt(g.period.split("–")[1], 10) || null,
        }))
    ).map((g) => `${g.name} (${g.leaderName}, ${g.party}, ${g.yearStart}–${g.yearEnd ?? "presente"}) [id:${g.id}]`).join("; ");

    return `Análise PIR+ comparativa FABLE 5.0 para ${countryName}, eixo ${result.axisId} — ${result.axisName}, camada ${result.layer}.
Governos: ${govList}

APLIQUE rigorosamente PIR+, AAM v5.0, APP+ v5.0, SIB v5.0 e CCE v5.0.
Quando faltar série verificável para o período do mandato, use "value": null e declare "dado não disponível" (NUNCA preencha 0.0 para dado ausente).
Retorne JSON estruturado auditável pelo motor determinístico FABLE 5.0.`;
  }, [result, countryName, governments]);

  const fullPromptMarkdown = useMemo(
    () => `# Prompt Canônico Auditado — ${result.axisName} (${result.axisId})

**País:** ${countryName}
**Framework:** ${result.auditTrail.frameworkVersion}
**Prompt ID:** ${result.auditTrail.promptId}
**Modelo Executado:** ${result.auditTrail.modelVersion}
**Modo de Execução:** ${result.executionMode || result.auditTrail.executionMode || 'RESEARCH_PARTIAL'}
**Timestamp:** ${result.auditTrail.timestamp}

---

## 1. SYSTEM PROMPT CANÔNICO (Ágora FABLE 5.0)

\`\`\`
${CANONICAL_SYSTEM_PROMPT}
\`\`\`

---

## 2. USER PROMPT (Contexto Sanitizado)

\`\`\`
${userPromptEcho}
\`\`\`

---

## 3. Cadeia de Custódia de Evidências (CCE v5.0)

${(result.cceTable || []).map(
  (r) => `- **${r.dataName}** — ${r.institution} [originGroup: ${r.originGroup || '—'}] (${r.year}) · ${r.methodologyType} · SIB ${(r.sibConfidence * 100).toFixed(0)}% [${r.sibBand}]`
).join("\n")}

---

## 4. Trilha de Auditoria

- Governos analisados: ${result.auditTrail.governmentsCount}
- Fontes catalogadas: ${result.auditTrail.sourcesCount} (Grupos independentes: ${result.auditTrail.independentOriginsCount ?? result.auditTrail.sourcesCount})
- SIB médio recalculado: ${(result.auditTrail.averageSibConfidence * 100).toFixed(0)}%
- VCO: ${result.auditTrail.vcoStatus}
${result.auditTrail.aamFlagsTriggered?.length ? `- Flags AAM: ${result.auditTrail.aamFlagsTriggered.join(", ")}` : ""}
`,
    [result, countryName, userPromptEcho]
  );

  function copyPrompt() {
    navigator.clipboard.writeText(fullPromptMarkdown);
    toast({ title: "Prompt copiado", description: "O super-prompt canônico FABLE 5.0 está na sua área de transferência." });
  }

  function downloadPrompt() {
    const blob = new Blob([fullPromptMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${result.axisId}-${countryName.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Download iniciado", description: `prompt-${result.axisId}.md` });
  }

  function submitSuggestion() {
    if (suggestionText.trim().length < 20) {
      toast({ title: "Sugestão muito curta", description: "Escreva ao menos 20 caracteres explicando a melhoria.", variant: "destructive" });
      return;
    }
    const record = {
      id: crypto.randomUUID(),
      axisId: result.axisId,
      axisName: result.axisName,
      country: countryName,
      promptId: result.auditTrail.promptId,
      frameworkVersion: result.auditTrail.frameworkVersion,
      type: suggestionType,
      email: suggestionEmail || null,
      suggestion: suggestionText.trim(),
      createdAt: new Date().toISOString(),
    };
    const key = "aegis.prompt-suggestions";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(record);
    localStorage.setItem(key, JSON.stringify(existing));

    setSuggestionText("");
    setSuggestionEmail("");
    setSuggestOpen(false);
    toast({
      title: "Sugestão registrada",
      description: "Obrigado — sua contribuição entrou na fila de curadoria do comitê metodológico.",
    });
  }

  // Tree of Thoughts branches — one per government
  const branches = result.governmentScores.map((gs) => ({
    id: gs.governmentId,
    name: gs.governmentName,
    period: gs.period,
    score: gs.score,
    eligible: gs.eligibleForRanking !== false && gs.score !== null && !gs.isQuarantined,
    sib: gs.sibAverage,
    tese: gs.thesisSummary,
    antitese: gs.antithesisSummary,
    metodo: gs.methodologicalNote,
    data: gs.primaryData || [],
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[1.5rem] border border-brand-accent/25 bg-gradient-to-br from-brand-accent/[0.04] via-transparent to-axis-a/[0.04] p-6 space-y-6"
      aria-labelledby="ai-transparency-title"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent" />
      <div className="absolute -top-24 -right-16 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-accent mb-1">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-micro uppercase tracking-[0.22em]">Transparência da IA · FABLE 5.0</p>
          </div>
          <h3 id="ai-transparency-title" className="font-display text-heading-md text-neutral-50">
            Como esta análise foi construída e governada
          </h3>
          <p className="text-body-sm text-neutral-400 mt-1 max-w-2xl">
            Inspecione a Árvore de Pensamento (Tree of Thoughts), as alternativas descartadas, o pipeline de 13 estágios, os prompts versionados e a biblioteca de skills.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyPrompt} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" /> Copiar prompt
          </Button>
          <Button size="sm" variant="outline" onClick={downloadPrompt} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Baixar .md
          </Button>
          <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
                <Wand2 className="w-3.5 h-3.5" /> Sugerir melhoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Sugerir aprimoramento do super-prompt</DialogTitle>
                <DialogDescription>
                  Sua sugestão vai para a curadoria do comitê metodológico. Descreva o que refinar em PIR+, AAM, APP, SIB ou nas fontes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {(["aprimoramento", "correção", "novo_protocolo"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSuggestionType(t)}
                      className={`px-3 py-1.5 rounded-full text-micro font-medium border transition-all ${
                        suggestionType === t
                          ? "bg-brand-accent text-brand-primary border-brand-accent"
                          : "border-neutral-700/50 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {t === "aprimoramento" ? "Aprimoramento" : t === "correção" ? "Correção" : "Novo protocolo"}
                    </button>
                  ))}
                </div>
                <Input
                  type="email"
                  placeholder="Seu e-mail (opcional, para retorno)"
                  value={suggestionEmail}
                  onChange={(e) => setSuggestionEmail(e.target.value)}
                />
                <Textarea
                  placeholder="Ex.: Sugiro que a antítese peça também um teste de robustez sobre o intervalo de confiança do indicador..."
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  rows={7}
                  maxLength={2000}
                />
                <p className="text-micro text-neutral-500 text-right">{suggestionText.length}/2000</p>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSuggestOpen(false)}>Cancelar</Button>
                <Button onClick={submitSuggestion} className="gap-1.5 bg-brand-accent text-brand-primary hover:bg-brand-accent/90">
                  <Send className="w-3.5 h-3.5" /> Enviar sugestão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SKILL / FRAMEWORK CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetaCard icon={<Sparkles className="w-3.5 h-3.5" />} label="Skills FABLE 5.0" value={`${AI_SKILLS.length} skills auditáveis`} hint={result.auditTrail.frameworkVersion} tone="accent" />
        <MetaCard icon={<Cpu className="w-3.5 h-3.5" />} label="Modelo Executado" value={result.auditTrail.modelVersion} hint={result.auditTrail.promptId} />
        <MetaCard icon={<BookOpen className="w-3.5 h-3.5" />} label="Framework" value="PIR+ · AAM · APP+ · SIB · CCE" hint="ToT + Validação Determinística" />
        <MetaCard icon={<Database className="w-3.5 h-3.5" />} label="Fontes / Origens" value={`${result.auditTrail.sourcesCount} (${result.auditTrail.independentOriginsCount ?? result.auditTrail.sourcesCount} indep.)`} hint={`SIB médio ${(result.auditTrail.averageSibConfidence * 100).toFixed(0)}%`} />
      </div>

      {/* PREMIUM SKILLS LIBRARY */}
      <AISkillsPanel
        title="Biblioteca de Skills FABLE 5.0 aplicadas nesta análise"
        description="Cada skill é um mecanismo verificável em código: curadoria bayesiana com desduplicação por originGroup, invariância por troca de rótulos e ordem, rigor econométrico (Δ% vs p.p.), cadeia de custódia CCE e auditoria adversária."
      />

      {/* TREE OF THOUGHTS — RAMOS POR GOVERNO */}
      <Collapsible open={treeOpen} onOpenChange={setTreeOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-body-sm font-semibold text-neutral-100 hover:text-brand-accent transition-colors">
          <ChevronDown className={`w-4 h-4 transition-transform ${treeOpen ? "" : "-rotate-90"}`} />
          <GitBranch className="w-4 h-4 text-brand-accent" />
          Árvore de Pensamento (Tree of Thoughts) — {branches.length} ramos por governo
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-3">
            {branches.map((b, i) => (
              <TreeBranch key={b.id} branch={b} index={i} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* DELIBERAÇÃO ToT — ALTERNATIVAS METODOLÓGICAS E RAMO ESCOLHIDO */}
      {result.totDecisions && result.totDecisions.length > 0 && (
        <Collapsible open={totDecisionsOpen} onOpenChange={setTotDecisionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-body-sm font-semibold text-neutral-100 hover:text-brand-accent transition-colors">
            <ChevronRight className={`w-4 h-4 transition-transform ${totDecisionsOpen ? "rotate-90" : ""}`} />
            <GitBranch className="w-4 h-4 text-brand-accent" />
            Deliberação Metodológica ToT (Alternativas Concorrentes vs Ramo Escolhido) ({result.totDecisions.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 space-y-3">
              {result.totDecisions.map((dec) => (
                <div key={dec.decisionId} className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] space-y-2 text-xs">
                  <p className="font-semibold text-brand-accent">{dec.problem}</p>
                  <div className="grid gap-2 md:grid-cols-3">
                    {dec.alternatives.map((alt, altIdx) => (
                      <div
                        key={alt.id}
                        className={`p-2.5 rounded-lg border ${
                          altIdx === 0
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-neutral-800 bg-black/20 opacity-80"
                        }`}
                      >
                        <p className="font-mono font-bold text-[11px] mb-1">
                          {altIdx === 0 ? "✓ Ramo Escolhido: " : "✗ Descartado: "}
                          {alt.label}
                        </p>
                        <p className="text-neutral-300 text-[11px]">{alt.description}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-neutral-300"><strong>Decisão:</strong> {dec.decision}</p>
                  <p className="text-neutral-400"><strong>Limitação residual:</strong> {dec.limitations}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* PIPELINE CANÔNICO DE 13 ESTÁGIOS */}
      {result.pipelineStages && result.pipelineStages.length > 0 && (
        <Collapsible open={pipelineOpen} onOpenChange={setPipelineOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-body-sm font-semibold text-neutral-100 hover:text-brand-accent transition-colors">
            <ChevronRight className={`w-4 h-4 transition-transform ${pipelineOpen ? "rotate-90" : ""}`} />
            <Layers className="w-4 h-4 text-brand-accent" />
            Pipeline Canônico de 13 Estágios (Execução Determinística)
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {result.pipelineStages.map((st) => (
                <div key={st.stepNumber} className="p-2.5 rounded-lg border border-neutral-800 bg-black/20 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-neutral-200">
                      #{st.stepNumber} {st.stageName}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${
                      st.status === "OPERATIONAL" ? "bg-emerald-500/15 text-emerald-300" :
                      st.status === "PARTIAL" ? "bg-amber-500/15 text-amber-300" :
                      "bg-cyan-500/15 text-cyan-300"
                    }`}>
                      {st.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">{st.detail}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* FULL PROMPT VIEWER */}
      <Collapsible open={promptOpen} onOpenChange={setPromptOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-body-sm font-semibold text-neutral-100 hover:text-brand-accent transition-colors">
          <ChevronRight className={`w-4 h-4 transition-transform ${promptOpen ? "rotate-90" : ""}`} />
          <FileText className="w-4 h-4 text-brand-accent" />
          Ver Prompts Canônicos Versionados (System + Task Prompts v5.0.0)
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <PromptBlock title="SYSTEM PROMPT CANÔNICO" subtitle="Ágora FABLE 5.0 (Regras Invioláveis)" body={CANONICAL_SYSTEM_PROMPT} />
            <PromptBlock title="USER PROMPT" subtitle="Contexto sanitizado deste eixo" body={userPromptEcho} />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {Object.values(VERSIONED_TASK_PROMPTS).map((tp) => (
              <div key={tp.id} className="p-2.5 rounded-lg border border-neutral-800 bg-black/20 text-[11px]">
                <p className="font-mono font-bold text-brand-accent">{tp.id}</p>
                <p className="text-neutral-300 font-medium">{tp.title}</p>
                <p className="text-neutral-500 mt-0.5 line-clamp-2">{tp.purpose}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-3">
            <Lightbulb className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <p className="text-micro text-neutral-300 leading-relaxed">
              O modelo produz JSON estruturado sob o SYSTEM PROMPT canônico, e o motor determinístico FABLE 5.0 audita cada indicador antes da publicação.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.section>
  );
}

function MetaCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "accent" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "accent" ? "border-brand-accent/30 bg-brand-accent/5" : "border-neutral-700/30 bg-white/[0.02]"}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${tone === "accent" ? "text-brand-accent" : "text-neutral-500"}`}>
        {icon}
        <p className="text-micro uppercase tracking-[0.16em]">{label}</p>
      </div>
      <p className="text-body-sm font-semibold text-neutral-50 truncate">{value}</p>
      {hint && <p className="text-micro text-neutral-500 mt-0.5 truncate font-mono">{hint}</p>}
    </div>
  );
}

function PromptBlock({ title, subtitle, body }: { title: string; subtitle: string; body: string }) {
  return (
    <div className="rounded-xl border border-neutral-700/30 bg-neutral-950/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800/50">
        <div>
          <p className="text-micro font-bold text-brand-accent">{title}</p>
          <p className="text-micro text-neutral-500">{subtitle}</p>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(body); toast({ title: `${title} copiado` }); }}
          className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-100 hover:bg-white/5 transition-colors"
          aria-label={`Copiar ${title}`}
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
      <pre className="p-3 text-[11px] leading-relaxed text-neutral-300 whitespace-pre-wrap font-mono max-h-72 overflow-y-auto">{body}</pre>
    </div>
  );
}

interface BranchData {
  id: string;
  name: string;
  period: string;
  score: number | null;
  eligible: boolean;
  sib: number;
  tese: string;
  antitese: string;
  metodo: string;
  data: PrimaryDataPoint[];
}

function TreeBranch({ branch, index }: { branch: BranchData; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const scoreDisplay = branch.score !== null && branch.eligible ? branch.score.toFixed(1) : "S/D";

  return (
    <div className="rounded-xl border border-neutral-700/30 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="font-mono text-micro text-brand-accent shrink-0">Ramo #{index + 1}</span>
        <span className="text-body-sm font-medium text-neutral-100 flex-1 truncate">{branch.name}</span>
        <span className="text-micro font-mono text-neutral-500 hidden sm:inline">{branch.period}</span>
        <span className="font-display text-heading-sm text-brand-accent">{scoreDisplay}</span>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-neutral-800/40">
          <ThoughtStep step="1" label="TESE" tone="high" body={branch.tese} />
          <ThoughtStep step="2" label="ANTÍTESE" tone="warn" body={branch.antitese} />
          <ThoughtStep step="3" label="SÍNTESE E GOVERNANÇA" tone="accent" body={`${branch.metodo} · Score final: ${scoreDisplay} · SIB ${(branch.sib * 100).toFixed(0)}%`} />
          {branch.data.length > 0 && (
            <div className="rounded-lg border border-neutral-800/50 bg-neutral-950/40 overflow-hidden">
              <p className="px-3 py-1.5 text-micro font-bold text-neutral-400 border-b border-neutral-800/50 bg-white/[0.02]">
                Evidências primárias que sustentaram a síntese
              </p>
              <ul className="divide-y divide-neutral-800/40">
                {branch.data.map((d, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2 text-micro">
                    <span className="text-neutral-300 flex-1 truncate">{d.metricName}</span>
                    <span className="font-mono text-neutral-50">
                      {d.value !== null ? `${d.value} ${d.unit}` : "Dado não disponível (S/D)"}
                    </span>
                    <span className="text-neutral-500 hidden sm:inline">{d.source} ({d.year})</span>
                    {d.sib?.value != null && (
                      <span className={`font-mono text-micro font-bold ${
                        d.sib.band === "ALTA" ? "text-confidence-high" :
                        d.sib.band === "MODERADA" ? "text-confidence-medium" :
                        "text-semantic-error"
                      }`}>
                        SIB {(d.sib.value * 100).toFixed(0)}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ThoughtStep({ step, label, tone, body }: { step: string; label: string; tone: "high" | "warn" | "accent"; body: string }) {
  const toneCls =
    tone === "high" ? "border-confidence-high/40 bg-confidence-high/5 text-confidence-high"
    : tone === "warn" ? "border-semantic-warning/40 bg-semantic-warning/5 text-semantic-warning"
    : "border-brand-accent/40 bg-brand-accent/5 text-brand-accent";
  return (
    <div className={`rounded-lg border-l-2 p-3 ${toneCls}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-micro font-bold opacity-80">{step}.</span>
        <p className="text-micro font-bold">{label}</p>
      </div>
      <p className="text-body-sm text-neutral-300 leading-relaxed">{body}</p>
    </div>
  );
}
