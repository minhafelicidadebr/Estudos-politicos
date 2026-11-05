/**
 * NarrativeModal — Sprint 13.
 * Streams a Lovable-AI generated editorial narrative for a saved analysis.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavedAnalysis } from "@/services/analysesService";

interface Props {
  open: boolean;
  onClose: () => void;
  analysis: SavedAnalysis | null;
}

const NARRATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/narrate-analysis`;

export function NarrativeModal({ open, onClose, analysis }: Props) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open || !analysis) return;
    setText("");
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const resp = await fetch(NARRATE_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            title: analysis.title,
            countryId: analysis.country_id,
            governments: analysis.governments,
            axisData: analysis.axis_data,
            scores: analysis.scores,
            language: "pt",
          }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) toast({ title: "Limite atingido", description: "Aguarde alguns instantes.", variant: "destructive" });
          else if (resp.status === 402) toast({ title: "Créditos esgotados", description: "Adicione créditos em Workspace > Usage.", variant: "destructive" });
          else toast({ title: "Falha ao gerar narrativa", variant: "destructive" });
          setStreaming(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let done = false;

        while (!done) {
          const { done: rDone, value } = await reader.read();
          if (rDone) break;
          buffer += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nl);
            buffer = buffer.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { done = true; break; }
            try {
              const parsed = JSON.parse(json);
              const c = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (c) setText((prev) => prev + c);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          toast({ title: "Erro de rede", variant: "destructive" });
        }
      } finally {
        setStreaming(false);
      }
    })();

    return () => controller.abort();
  }, [open, analysis, toast]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-primary/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Narrativa gerada por IA"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(720px,92vw)] max-h-[88vh] flex flex-col rounded-2xl border border-brand-accent/30 bg-brand-primary shadow-[0_30px_120px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <header className="flex items-center justify-between p-5 border-b border-neutral-700/40">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-brand-accent/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <h2 className="font-display text-heading-md text-neutral-50">Narrativa editorial</h2>
                  <p className="text-micro text-neutral-500">Gerada por IA · Lovable AI Gateway</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  disabled={!text || streaming}
                  className="px-3 py-1.5 rounded-lg border border-neutral-700/40 text-body-sm text-neutral-300 hover:border-brand-accent/30 hover:text-brand-accent disabled:opacity-30 transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button onClick={onClose} aria-label="Fechar" className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-50 hover:bg-white/[0.04] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-7 py-6">
              <article className="prose prose-invert max-w-none">
                {text.split(/\n\n+/).map((para, i) => (
                  <p key={i} className="text-body-md text-neutral-200 leading-[1.75] mb-4 first-letter:font-display first-letter:text-3xl first-letter:text-brand-accent first-letter:mr-1 first:first-letter:font-display">
                    {para}
                    {streaming && i === text.split(/\n\n+/).length - 1 && (
                      <span className="inline-block w-2 h-5 ml-1 bg-brand-accent animate-pulse align-middle" />
                    )}
                  </p>
                ))}
                {streaming && !text && (
                  <div className="flex items-center gap-3 text-neutral-400">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                    <span className="text-body-sm">Compondo narrativa…</span>
                  </div>
                )}
              </article>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
