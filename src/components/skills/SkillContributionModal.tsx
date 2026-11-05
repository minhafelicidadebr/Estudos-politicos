/**
 * SkillContributionModal — inteligência coletiva.
 * Permite propor melhorias auditáveis a uma Skill; a proposta é registrada
 * localmente e pode ser copiada/exportada para envio ao comitê.
 */
import { useState } from "react";
import { X, Send, Copy, Check, Users, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_SKILLS } from "@/data/aiSkills";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "agora:skill-contributions";

const KINDS = [
  { id: "correcao", label: "Correção factual", hint: "Um dado ou fonte está errado" },
  { id: "metodo", label: "Melhoria de método", hint: "Um passo do pipeline pode ser mais robusto" },
  { id: "fonte", label: "Nova fonte canônica", hint: "Fonte primária melhor ou mais recente" },
  { id: "vies", label: "Viés detectado", hint: "Assimetria de tratamento ou linguagem" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  skillId?: string;
}

export function SkillContributionModal({ open, onOpenChange, skillId }: Props) {
  const [target, setTarget] = useState(skillId ?? AI_SKILLS[0].id);
  const [kind, setKind] = useState<string>("metodo");
  const [evidence, setEvidence] = useState("");
  const [proposal, setProposal] = useState("");
  const [source, setSource] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const effectiveTarget = skillId ?? target;
  const skill = AI_SKILLS.find((s) => s.id === effectiveTarget);
  const valid = proposal.trim().length > 20 && source.trim().length > 3;

  const payload = () =>
    `PROPOSTA DE MELHORIA — Biblioteca de Skills Ágora
Skill: ${effectiveTarget} · ${skill?.name} (v${skill?.version})
Tipo: ${KINDS.find((k) => k.id === kind)?.label}
Evidência observada: ${evidence || "—"}
Proposta: ${proposal}
Fonte verificável: ${source}
Data: ${new Date().toISOString()}`;

  const submit = () => {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    prev.push({ skillId: effectiveTarget, kind, evidence, proposal, source, at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
    toast({
      title: "Proposta registrada",
      description: "Sua contribuição entrou na fila de revisão do comitê metodológico.",
    });
    setEvidence(""); setProposal(""); setSource("");
    onOpenChange(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(payload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden border-axis-b/25 bg-[hsl(var(--background))]/95 backdrop-blur-xl [&>button]:hidden">
        <header className="relative p-5 sm:p-6 border-b border-neutral-800/60 bg-gradient-to-br from-axis-b/[0.08] via-transparent to-brand-accent/[0.05]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-axis-b/60 to-transparent" />
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 w-8 h-8 rounded-lg border border-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-neutral-50 hover:border-axis-b/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-axis-b mb-2">
            <Users className="w-4 h-4" />
            <p className="text-micro uppercase tracking-[0.22em]">Inteligência coletiva</p>
          </div>
          <h2 className="font-display text-heading-md text-neutral-50 pr-10">Proponha uma melhoria auditável</h2>
          <p className="text-body-sm text-neutral-400 mt-2 leading-relaxed max-w-xl">
            Cada skill evolui por versão. Propostas com fonte verificável entram na fila de revisão e, quando aceitas,
            aparecem no changelog com origem "colaboração da comunidade".
          </p>
        </header>

        <div className="p-5 sm:p-6 space-y-4 max-h-[56vh] overflow-y-auto">
          {!skillId && (
            <Field label="Skill alvo">
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-white/[0.03] px-3 py-2 text-body-sm text-neutral-100"
              >
                {AI_SKILLS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-neutral-900">{s.id} — {s.name}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Tipo de contribuição">
            <div className="grid sm:grid-cols-2 gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  onClick={() => setKind(k.id)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    kind === k.id
                      ? "border-axis-b/50 bg-axis-b/10"
                      : "border-neutral-800 bg-white/[0.02] hover:border-neutral-700"
                  }`}
                >
                  <p className="text-body-sm text-neutral-100">{k.label}</p>
                  <p className="text-micro text-neutral-500">{k.hint}</p>
                </button>
              ))}
            </div>
          </Field>

          <Field label="O que você observou (opcional)">
            <Textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Ex.: o valor de 2023 diverge da série revisada publicada pela instituição em março."
              rows={2}
            />
          </Field>

          <Field label="Sua proposta">
            <Textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Descreva a mudança concreta ao princípio, método ou salvaguarda da skill."
              rows={4}
            />
          </Field>

          <Field label="Fonte verificável (instituição, indicador, ano ou URL)">
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ex.: FMI WEO out/2025, tabela de PIB real, série revisada"
            />
          </Field>

          <p className="text-micro text-neutral-500 leading-relaxed flex gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
            Propostas sem fonte verificável não são avaliadas — o mesmo padrão probatório que aplicamos às nossas análises.
          </p>
        </div>

        <footer className="flex flex-col sm:flex-row gap-2 p-4 border-t border-neutral-800/60 bg-white/[0.015]">
          <Button variant="outline" onClick={copy} className="gap-2">
            {copied ? <Check className="w-4 h-4 text-confidence-high" /> : <Copy className="w-4 h-4" />}
            Copiar proposta
          </Button>
          <Button onClick={submit} disabled={!valid} className="flex-1 gap-2">
            <Send className="w-4 h-4" /> Enviar para revisão
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-micro uppercase tracking-[0.14em] text-neutral-500">{label}</label>
      {children}
    </div>
  );
}
