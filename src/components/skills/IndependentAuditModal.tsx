/**
 * IndependentAuditModal — CTA "Audite você mesmo".
 * Ensina, com método científico, como o usuário audita as respostas das Skills
 * usando fontes primárias e IAs externas independentes.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check, ShieldCheck, FlaskConical, AlertTriangle, Scale } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EXTERNAL_AUDIT_PROTOCOL, MASTER_AUDIT_PROMPT } from "@/data/aiSkills";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contextPrompt?: string; // prompt específico da skill, quando aberto a partir dela
  contextLabel?: string;
}

export function IndependentAuditModal({ open, onOpenChange, contextPrompt, contextLabel }: Props) {
  const [copied, setCopied] = useState<"master" | "context" | null>(null);
  const { toast } = useToast();

  const copy = async (text: string, which: "master" | "context") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    toast({ title: "Prompt copiado", description: "Cole em um modelo de outra família para auditoria independente." });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden border-axis-c/25 bg-[hsl(var(--background))]/95 backdrop-blur-xl [&>button]:hidden">
        <header className="relative p-5 sm:p-6 border-b border-neutral-800/60 bg-gradient-to-br from-axis-c/[0.08] via-transparent to-brand-accent/[0.05]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-axis-c/60 to-transparent" />
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 w-8 h-8 rounded-lg border border-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-neutral-50 hover:border-axis-c/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-axis-c mb-2">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-micro uppercase tracking-[0.22em]">Protocolo de auditoria independente</p>
          </div>
          <h2 className="font-display text-heading-md text-neutral-50 pr-10">
            Não confie em nós — verifique. Aqui está como fazer isso com método.
          </h2>
          <p className="text-body-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Nossas Skills reduzem erro, viés e alucinação — mas nenhuma metodologia elimina a incerteza. O compromisso do Ágora
            é com a aproximação da verdade, não com a autoridade da resposta. Este protocolo mostra como auditar qualquer
            análise usando fontes primárias e modelos de IA externos e independentes.
          </p>
        </header>

        <div className="p-5 sm:p-6 space-y-5 max-h-[58vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            {EXTERNAL_AUDIT_PROTOCOL.map((s, i) => (
              <motion.article
                key={s.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-neutral-800/60 bg-white/[0.02] p-4 hover:border-axis-c/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-lg border border-axis-c/40 bg-axis-c/10 text-axis-c flex items-center justify-center font-mono text-micro">
                    {s.step}
                  </span>
                  <h3 className="text-body-sm font-semibold text-neutral-50">{s.title}</h3>
                </div>
                <p className="text-micro text-neutral-300 leading-relaxed">{s.detail}</p>
                <p className="text-micro text-neutral-500 mt-2 leading-relaxed">
                  <span className="text-brand-accent">Dica — </span>{s.tip}
                </p>
              </motion.article>
            ))}
          </div>

          <section className="rounded-xl border border-confidence-medium/25 bg-confidence-medium/[0.05] p-4">
            <div className="flex items-center gap-1.5 text-micro uppercase tracking-[0.14em] text-confidence-medium mb-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Armadilhas comuns na auditoria com IA
            </div>
            <ul className="space-y-1.5">
              {[
                "Concordância entre dois modelos da mesma família não é evidência independente — use famílias diferentes.",
                "Perguntar 'isso está certo?' induz confirmação. Peça sempre a refutação mais forte possível.",
                "Modelos sem acesso à web podem inventar séries. Exija instituição, ano e método — e aceite 'não verificável'.",
                "Divergência de valor pode ser revisão de série (vintage), não erro: compare a data de publicação.",
                "Uma única fonte confirmando não fecha auditoria; triangule com o portal oficial primário.",
              ].map((t) => (
                <li key={t} className="text-micro text-neutral-300 leading-relaxed pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-confidence-medium/80">
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {contextPrompt && (
            <PromptBox
              label={`Prompt específico — ${contextLabel ?? "skill selecionada"}`}
              text={contextPrompt}
              copied={copied === "context"}
              onCopy={() => copy(contextPrompt, "context")}
              accentClass="border-brand-accent/25"
            />
          )}

          <PromptBox
            label="Prompt-mestre de auditoria (7 etapas) — cole em outra IA"
            text={MASTER_AUDIT_PROMPT}
            copied={copied === "master"}
            onCopy={() => copy(MASTER_AUDIT_PROMPT, "master")}
            accentClass="border-axis-c/25"
          />

          <section className="rounded-xl border border-neutral-800/60 bg-white/[0.02] p-4">
            <div className="flex items-center gap-1.5 text-micro uppercase tracking-[0.14em] text-neutral-400 mb-2">
              <Scale className="w-3.5 h-3.5 text-brand-accent" /> Como interpretar o resultado da sua auditoria
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {[
                { k: "CONFIRMADO", c: "text-confidence-high border-confidence-high/30 bg-confidence-high/[0.06]", d: "Valor, ano e fonte batem com o portal oficial. Nada a fazer." },
                { k: "DIVERGENTE", c: "text-confidence-low border-confidence-low/30 bg-confidence-low/[0.06]", d: "Há diferença material. Envie fonte, valor e data pela colaboração aberta — vira nova versão da skill." },
                { k: "NÃO VERIFICÁVEL", c: "text-confidence-inconclusive border-neutral-700/50 bg-white/[0.02]", d: "Nem confirma nem refuta. Deveria estar marcado como inferência na análise." },
              ].map((x) => (
                <div key={x.k} className={`rounded-lg border p-3 ${x.c}`}>
                  <p className="font-mono text-micro mb-1">{x.k}</p>
                  <p className="text-micro text-neutral-300 leading-relaxed">{x.d}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-micro text-neutral-500 leading-relaxed flex gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
            Auditoria bem-feita é reprodutível: registre fonte, valor, data de acesso e o prompt usado. Isso é o mínimo para
            que sua divergência seja verificável por terceiros — o mesmo padrão que exigimos de nós.
          </p>
        </div>

        <footer className="p-4 border-t border-neutral-800/60 bg-white/[0.015] flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function PromptBox({
  label, text, copied, onCopy, accentClass,
}: { label: string; text: string; copied: boolean; onCopy: () => void; accentClass: string }) {
  return (
    <div className={`rounded-xl border ${accentClass} bg-neutral-900/50 overflow-hidden`}>
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-neutral-800/60">
        <span className="text-micro uppercase tracking-[0.14em] text-neutral-400">{label}</span>
        <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 text-micro gap-1.5">
          {copied ? <Check className="w-3.5 h-3.5 text-confidence-high" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="p-4 text-micro text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">
        {text}
      </pre>
    </div>
  );
}
