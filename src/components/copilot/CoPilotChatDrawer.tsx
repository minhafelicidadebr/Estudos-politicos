/**
 * CoPilotChatDrawer — Sprint 14
 * Streaming Q&A drawer over a saved analysis. SSE line-by-line render.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Loader2, Bot, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavedAnalysis } from "@/services/analysesService";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Qual governo se sai melhor em saúde e por quê?",
  "Onde está a maior divergência entre os governos?",
  "Quais são os 3 padrões institucionais convergentes?",
  "Resuma o veredito analítico em 5 linhas.",
];

interface Props {
  analysis: SavedAnalysis | null;
  open: boolean;
  onClose: () => void;
}

export function CoPilotChatDrawer({ analysis, open, onClose }: Props) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setMessages([]);
    return () => abortRef.current?.abort();
  }, [open, analysis?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || !analysis || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-analysis`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: ctrl.signal,
        body: JSON.stringify({
          messages: next,
          language: "pt",
          context: {
            title: analysis.title,
            countryId: analysis.country_id,
            governments: analysis.governments,
            axisData: analysis.axis_data,
            scores: analysis.scores,
          },
        }),
      });

      if (resp.status === 429) throw new Error("Limite de requisições. Aguarde alguns segundos.");
      if (resp.status === 402) throw new Error("Créditos esgotados na sua workspace Lovable AI.");
      if (!resp.ok || !resp.body) throw new Error("Falha ao iniciar resposta da IA.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m);
                }
                return [...prev, { role: "assistant", content: acc }];
              });
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast({ title: "Erro no Co-Piloto", description: e instanceof Error ? e.message : "—", variant: "destructive" });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-brand-deep border-l border-brand-accent/20 z-50 flex flex-col"
            role="dialog" aria-label="Co-Piloto Analítico"
          >
            <header className="px-5 py-4 border-b border-neutral-700/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-accent/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-body-md font-semibold text-neutral-50">Co-Piloto Analítico</h2>
                <p className="text-micro text-neutral-500 truncate">{analysis?.title}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-50 transition" aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="space-y-4">
                  <p className="text-body-sm text-neutral-400">
                    Faça perguntas sobre esta análise. Eu respondo apenas com base nos dados verificados — sem inventar.
                  </p>
                  <div className="grid gap-2">
                    {SUGGESTED.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-body-sm px-3 py-2.5 rounded-lg border border-neutral-700/40 bg-white/[0.02] hover:border-brand-accent/40 hover:bg-brand-accent/5 transition text-neutral-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-brand-accent/20 text-brand-accent" : "bg-white/[0.06] text-neutral-300"}`}>
                    {m.role === "user" ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`flex-1 px-4 py-3 rounded-xl text-body-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-brand-accent/10 text-neutral-50" : "bg-white/[0.03] text-neutral-200 border border-neutral-700/30"}`}>
                    {m.content}
                    {loading && i === messages.length - 1 && m.role === "assistant" && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-brand-accent animate-pulse align-middle" />
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-body-sm text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Co-piloto pensando…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="px-5 py-4 border-t border-neutral-700/40 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo sobre esta análise…"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-neutral-700/40 focus:border-brand-accent/60 focus:outline-none text-body-sm text-neutral-50 placeholder:text-neutral-600 disabled:opacity-50"
              />
              <button
                type="submit" disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-lg bg-brand-accent text-brand-deep flex items-center justify-center disabled:opacity-40 hover:bg-brand-accent-bright transition"
                aria-label="Enviar"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
