/**
 * Sofia — Assistente IA Global da Ágora (v2 "Master Plus")
 *
 * Upgrades sobre v1:
 *  • UX: persistência em localStorage, "Nova conversa", expand/fullscreen,
 *    composer multilinha com autoresize, atalhos (⌘K abre, Esc fecha,
 *    Enter envia, Shift+Enter quebra linha, ↑ reedita última pergunta),
 *    ações por mensagem (copiar, regenerar, parar streaming),
 *    sugestões categorizadas em abas (Começar / Métodos / Módulos / Dados),
 *    chips de comando "/" e quick-jump para rotas mencionadas.
 *  • Apresentação: renderização markdown rica com tabelas roláveis em cards,
 *    blocos de destaque (💡 / ⚠️ / 🎯 / 📊), código com botão copiar,
 *    links internos viram <Link> do react-router (navegação SPA),
 *    skeleton shimmer de "pensando", indicador de streaming refinado.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, X, Loader2, Sparkles, MessageCircle, Maximize2, Minimize2,
  RefreshCw, Copy, Check, Trash2, StopCircle, Command, ArrowRight,
  BookOpen, Beaker, Layers, BarChart3,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import sofiaAvatar from "@/assets/sofia-avatar.jpg";
import { extractInsightBlocks } from "@/lib/aiInsights/parse";
import { AIInsightRenderer } from "@/components/ai-insights/AIInsightRenderer";

const ROUTE_CONTEXT: Record<string, { label: string; hint: string }> = {
  "/": { label: "Início", hint: "Landing" },
  "/compare": { label: "Comparação de Governos", hint: "Multi-governo · 28 eixos" },
  "/lab": { label: "Laboratório", hint: "Motores determinísticos" },
  "/methodology": { label: "Metodologia", hint: "PIR+ · SIB · Skills" },
  "/library": { label: "Biblioteca", hint: "Análises salvas" },
  "/audit": { label: "Auditoria", hint: "Trilha & governança" },
  "/insights": { label: "Insights", hint: "Padrões emergentes" },
  "/atlas": { label: "Atlas Global", hint: "KPIs por país" },
  "/world-map": { label: "Mapa Mundial PIR+", hint: "Heatmap planetário" },
  "/wrapped": { label: "Political Wrapped", hint: "Retrospectiva cívica" },
  "/heatmap": { label: "Heatmap Cívico", hint: "Engajamento" },
  "/liga": { label: "Liga Ágora", hint: "Leaderboard" },
};

function resolveRouteContext(pathname: string): { label: string; hint: string } {
  if (ROUTE_CONTEXT[pathname]) return ROUTE_CONTEXT[pathname];
  if (pathname.startsWith("/comparative/")) return { label: "Análise Comparativa", hint: "PIR+ multi-governo em curso" };
  if (pathname.startsWith("/analyze/")) return { label: "Análise de País", hint: "Engine PIR+ individual" };
  if (pathname.startsWith("/timeline/")) return { label: "Linha do Tempo", hint: "Trajetória histórica" };
  if (pathname.startsWith("/debate/")) return { label: "Debate", hint: "Discussão pública" };
  return { label: "Ágora", hint: "Plataforma analítica" };
}

type Msg = { role: "user" | "assistant"; content: string; ts?: number };

const STORAGE_KEY = "sofia.chat.v2";
const MAX_HISTORY = 40;

const SUGGESTION_GROUPS = [
  {
    id: "comecar",
    label: "Começar",
    icon: Sparkles,
    items: [
      "O que a Ágora faz em 3 parágrafos?",
      "Por onde começo se quero comparar 2 governos?",
      "Quais os 3 módulos mais úteis para um pesquisador?",
    ],
  },
  {
    id: "metodos",
    label: "Métodos",
    icon: BookOpen,
    items: [
      "Explique o framework PIR+ em uma tabela.",
      "Como funciona o Synthetic Control (SCM)?",
      "Diferença entre PCA, VAR e ABM no laboratório.",
    ],
  },
  {
    id: "modulos",
    label: "Módulos",
    icon: Beaker,
    items: [
      "Liste os 11 engines do laboratório em tabela.",
      "Quando usar o DNA Institucional (JSON_18)?",
      "O que faz o Radar Epistêmico?",
    ],
  },
  {
    id: "dados",
    label: "Dados",
    icon: BarChart3,
    items: [
      "Me mostre os 28 eixos analíticos em tabela.",
      "Como a confiança (confidence) é calculada?",
      "O que são fontes SIB (Source-Intelligence-Base)?",
    ],
  },
] as const;

const SLASH_COMMANDS = [
  { cmd: "/módulos", desc: "Liste engines do laboratório" },
  { cmd: "/eixos", desc: "Mostre os 28 eixos" },
  { cmd: "/rotas", desc: "Veja todas as rotas da Ágora" },
  { cmd: "/comparar", desc: "Como iniciar uma análise comparativa" },
  { cmd: "/metodologia", desc: "Resumo da metodologia PIR+/SIB" },
];

const INTERNAL_ROUTES = new Set([
  "/", "/compare", "/lab", "/methodology", "/library", "/audit", "/insights",
  "/atlas", "/world-map", "/wrapped", "/heatmap", "/liga", "/agency",
  "/wellbeing", "/career", "/fiscal-impact", "/epistemic-radar",
  "/intelligence-commons", "/history", "/settings",
]);

function loadHistory(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Msg[];
    return Array.isArray(parsed) ? parsed.slice(-MAX_HISTORY) : [];
  } catch { return []; }
}

function saveHistory(messages: Msg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY))); } catch { /* ignore */ }
}

function CodeBlock({ value, language }: { value: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };
  return (
    <div className="relative my-3 group/code">
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/80 border border-neutral-700/50 border-b-0 rounded-t-lg">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">{language || "code"}</span>
        <button
          onClick={onCopy}
          className="text-[11px] text-neutral-400 hover:text-brand-accent flex items-center gap-1 transition"
        >
          {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
        </button>
      </div>
      <pre className="m-0 p-3 bg-neutral-900/60 border border-neutral-700/50 border-t-0 rounded-b-lg overflow-x-auto text-[12px] leading-relaxed">
        <code className="text-neutral-100 font-mono">{value}</code>
      </pre>
    </div>
  );
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-xl border border-brand-accent/20 bg-gradient-to-br from-brand-accent/[0.04] to-transparent overflow-hidden">
      <div className="px-3 py-1.5 border-b border-brand-accent/15 flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-brand-accent" />
        <span className="text-[10px] uppercase tracking-wider text-brand-accent font-semibold">Dados estruturados</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function detectCalloutKind(text: string): { kind: "tip" | "warn" | "cta" | "data"; label: string } | null {
  const t = text.trimStart();
  if (t.startsWith("💡")) return { kind: "tip", label: "Insight" };
  if (t.startsWith("⚠️")) return { kind: "warn", label: "Atenção" };
  if (t.startsWith("🎯") || t.startsWith("➡️")) return { kind: "cta", label: "Próximo passo" };
  if (t.startsWith("📊") || t.startsWith("🔬")) return { kind: "data", label: "Dado / Método" };
  return null;
}

const calloutStyles = {
  tip: "border-brand-accent/40 bg-brand-accent/[0.06] text-neutral-100",
  warn: "border-amber-400/40 bg-amber-400/[0.06] text-amber-50",
  cta: "border-emerald-400/40 bg-emerald-400/[0.06] text-emerald-50",
  data: "border-sky-400/40 bg-sky-400/[0.06] text-sky-50",
};

function SofiaMarkdown({ text }: { text: string }) {
  const components: Components = {
    a: ({ href = "", children, ...rest }) => {
      const isInternal = href.startsWith("/") && INTERNAL_ROUTES.has(href.split("?")[0].split("#")[0]);
      if (isInternal) {
        return (
          <Link to={href} className="text-brand-accent hover:underline inline-flex items-center gap-1">
            {children}<ArrowRight className="w-3 h-3" />
          </Link>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline" {...rest}>{children}</a>;
    },
    table: ({ children }) => <TableCard><table className="w-full text-xs">{children}</table></TableCard>,
    thead: ({ children }) => <thead className="bg-brand-accent/10">{children}</thead>,
    th: ({ children }) => <th className="text-left px-3 py-2 text-brand-accent font-semibold border-b border-neutral-700/50">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 border-b border-neutral-700/30 text-neutral-200 align-top">{children}</td>,
    code: ({ className, children, ...props }) => {
      const inline = !className;
      const language = className?.replace("language-", "");
      const value = String(children).replace(/\n$/, "");
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent text-[0.85em] font-mono" {...props}>
            {children}
          </code>
        );
      }
      return <CodeBlock value={value} language={language} />;
    },
    pre: ({ children }) => <>{children}</>,
    p: ({ children }) => {
      const raw = typeof children === "string" ? children : (Array.isArray(children) ? children.map((c) => typeof c === "string" ? c : "").join("") : "");
      const callout = detectCalloutKind(raw);
      if (callout) {
        return (
          <div className={`my-3 px-4 py-3 rounded-xl border ${calloutStyles[callout.kind]}`}>
            <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1 font-semibold">{callout.label}</div>
            <p className="leading-relaxed text-sm m-0">{children}</p>
          </div>
        );
      }
      return <p className="my-2 leading-relaxed text-neutral-200">{children}</p>;
    },
    h1: ({ children }) => <h1 className="text-base font-semibold text-brand-accent mt-3 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-sm font-semibold text-brand-accent mt-3 mb-1.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-semibold text-neutral-50 mt-2 mb-1">{children}</h3>,
    ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-neutral-200">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-neutral-200">{children}</ol>,
    blockquote: ({ children }) => (
      <blockquote className="my-3 border-l-2 border-brand-accent/60 bg-brand-accent/[0.04] py-2 px-3 rounded-r text-neutral-200 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-neutral-700/40" />,
    strong: ({ children }) => <strong className="text-neutral-50 font-semibold">{children}</strong>,
  };
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text || "…"}</ReactMarkdown>;
}

function extractMentionedRoutes(text: string): string[] {
  const out = new Set<string>();
  const re = /`(\/[a-z-]+(?:\/[a-z-]+)?)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (INTERNAL_ROUTES.has(m[1])) out.add(m[1]);
  }
  return Array.from(out).slice(0, 4);
}

function ThinkingSkeleton() {
  return (
    <div className="flex gap-3">
      <img src={sofiaAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-brand-accent/40 shrink-0" />
      <div className="flex-1 max-w-[88%] px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-neutral-700/40">
        <div className="flex items-center gap-2 mb-2 text-[11px] text-brand-accent">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
          </span>
          Sofia está pensando…
        </div>
        <div className="space-y-2">
          <div className="h-2.5 rounded bg-neutral-700/40 animate-pulse w-[92%]" />
          <div className="h-2.5 rounded bg-neutral-700/40 animate-pulse w-[78%]" />
          <div className="h-2.5 rounded bg-neutral-700/40 animate-pulse w-[60%]" />
        </div>
      </div>
    </div>
  );
}

export function SofiaChatbot() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const routeCtx = useMemo(() => resolveRouteContext(location.pathname), [location.pathname]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof SUGGESTION_GROUPS[number]["id"]>("comecar");
  const [messages, setMessages] = useState<Msg[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist
  useEffect(() => { saveHistory(messages); }, [messages]);

  // Global shortcut: ⌘/Ctrl + J toggles Sofia (⌘K is reserved for Command Palette)
  // Also listens to the imperative "sofia:open" custom event fired by the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Guard: NEVER intercept ⌘/Ctrl+K — reservado para GlobalCommandPalette.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("sofia:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sofia:open", onOpenEvent);
    };
  }, [open]);

  // Focus & cleanup
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 220);
    return () => abortRef.current?.abort();
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Composer autoresize
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const showSlashMenu = input.trim().startsWith("/") && input.length <= 16;
  const filteredSlash = useMemo(
    () => SLASH_COMMANDS.filter((c) => c.cmd.startsWith(input.trim().toLowerCase())),
    [input]
  );

  const stop = () => abortRef.current?.abort();

  const send = useCallback(async (text: string, replaceLastAssistant = false) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim(), ts: Date.now() };
    const next = replaceLastAssistant
      ? [...messages.filter((_, i, arr) => !(i === arr.length - 1 && arr[i].role === "assistant"))]
      : [...messages, userMsg];
    if (!replaceLastAssistant) setMessages(next);
    setInput("");
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sofia-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        signal: ctrl.signal,
        body: JSON.stringify({ messages: next.slice(-16) }),
      });

      if (resp.status === 429) throw new Error("Limite de requisições. Aguarde alguns segundos.");
      if (resp.status === 402) throw new Error("Créditos esgotados na workspace Lovable AI.");
      if (!resp.ok || !resp.body) throw new Error("Falha ao conectar com a Sofia.");

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
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
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
                return [...prev, { role: "assistant", content: acc, ts: Date.now() }];
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
      toast({ title: "Erro da Sofia", description: e instanceof Error ? e.message : "—", variant: "destructive" });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading, messages, toast]);

  const regenerate = () => {
    // find last user msg
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        send(messages[i].content, true);
        return;
      }
    }
  };

  const copyMessage = (idx: number, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1400);
    });
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    } else if (e.key === "ArrowUp" && !input) {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (lastUser) setInput(lastUser.content);
    }
  };

  const drawerWidth = expanded ? "sm:w-[920px]" : "sm:w-[560px]";

  return (
    <>
      {/* Floating CTA */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-40 group flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary border border-brand-accent/40 shadow-[0_8px_32px_-8px_rgba(201,168,76,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(201,168,76,0.8)] hover:border-brand-accent/70 transition-all"
            aria-label="Conversar com a Sofia (⌘K)"
          >
            <div className="relative">
              <img src={sofiaAvatar} alt="Sofia" width={40} height={40} loading="lazy"
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-accent/60 group-hover:border-brand-accent transition" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-brand-primary" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] font-medium text-brand-accent leading-tight tracking-wide uppercase">Pergunte à Sofia</span>
              <span className="text-[13px] font-semibold text-neutral-50 leading-tight">Sua guia IA da Ágora</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded border border-brand-accent/40 text-[10px] text-brand-accent font-mono">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 240 }}
              className={`fixed right-0 top-0 bottom-0 w-full ${drawerWidth} bg-gradient-to-b from-brand-primary to-[hsl(216,60%,7%)] border-l border-brand-accent/20 z-50 flex flex-col shadow-2xl`}
              role="dialog"
              aria-label="Sofia — Assistente IA"
            >
              {/* Header */}
              <header className="px-5 py-4 border-b border-brand-accent/20 flex items-center gap-3 bg-gradient-to-r from-brand-secondary/40 to-transparent">
                <div className="relative">
                  <img src={sofiaAvatar} alt="Sofia" width={48} height={48} loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-accent/60" />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-body-md font-semibold text-neutral-50 flex items-center gap-2">
                    Sofia <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                    <span
                      className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-[10px] font-medium text-brand-accent"
                      title={`Contexto atual: ${routeCtx.label}`}
                    >
                      {routeCtx.label}
                    </span>
                  </h2>
                  <p className="text-micro text-neutral-400 truncate">
                    <span className="text-neutral-500">{routeCtx.hint}</span>
                    {messages.length > 0 && <> · {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"} · persistida</>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button onClick={clearChat}
                      className="w-9 h-9 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-amber-300 transition"
                      aria-label="Nova conversa" title="Nova conversa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setExpanded((v) => !v)}
                    className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-white/[0.06] items-center justify-center text-neutral-400 hover:text-neutral-50 transition"
                    aria-label={expanded ? "Reduzir" : "Expandir"} title={expanded ? "Reduzir" : "Expandir"}>
                    {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setOpen(false)}
                    className="w-9 h-9 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-neutral-50 transition"
                    aria-label="Fechar">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
                {messages.length === 0 && !loading && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-accent/10 to-brand-secondary/20 border border-brand-accent/30">
                      <p className="text-body-sm text-neutral-100 leading-relaxed">
                        Olá! Sou a <strong className="text-brand-accent">Sofia</strong> 👋 Conheço todo o ecossistema da Ágora — framework PIR+, 28 eixos analíticos, 11 engines determinísticos.
                      </p>
                      <p className="text-body-sm text-neutral-300 mt-2 leading-relaxed">
                        Pergunte qualquer coisa. Respondo com rigor científico, tabelas, links de navegação e protocolo anti-alucinação.
                      </p>
                    </div>

                    {/* Tabs */}
                    <div>
                      <div className="flex gap-1 mb-3 p-1 rounded-xl bg-white/[0.03] border border-neutral-700/40">
                        {SUGGESTION_GROUPS.map((g) => {
                          const Icon = g.icon;
                          const active = activeTab === g.id;
                          return (
                            <button key={g.id} onClick={() => setActiveTab(g.id)}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium transition ${
                                active ? "bg-brand-accent/15 text-brand-accent" : "text-neutral-400 hover:text-neutral-200"
                              }`}>
                              <Icon className="w-3.5 h-3.5" /> {g.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-2">
                        {SUGGESTION_GROUPS.find((g) => g.id === activeTab)?.items.map((q) => (
                          <button key={q} onClick={() => send(q)}
                            className="w-full text-left text-body-sm px-4 py-3 rounded-xl border border-neutral-700/40 bg-white/[0.02] hover:border-brand-accent/50 hover:bg-brand-accent/[0.06] transition text-neutral-200 flex items-center justify-between group">
                            <span>{q}</span>
                            <MessageCircle className="w-3.5 h-3.5 text-neutral-600 group-hover:text-brand-accent transition" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-neutral-700/40 font-mono">/</kbd> comandos ·
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-neutral-700/40 font-mono">↑</kbd> reeditar ·
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-neutral-700/40 font-mono">⌘K</kbd> abrir/fechar
                    </div>
                  </div>
                )}

                {messages.map((m, i) => {
                  const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
                  const routes = m.role === "assistant" ? extractMentionedRoutes(m.content) : [];
                  // Extração segura de blocos estruturados (validados por Zod). Falha silenciosa.
                  const insights = m.role === "assistant"
                    ? extractInsightBlocks(m.content)
                    : { blocks: [], cleanedText: m.content };
                  const textForMarkdown = insights.blocks.length > 0 ? insights.cleanedText : m.content;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      {m.role === "assistant" ? (
                        <img src={sofiaAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-brand-accent/40 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-xs font-bold shrink-0">
                          Eu
                        </div>
                      )}
                      <div className={`flex-1 max-w-[88%] ${m.role === "user" ? "flex justify-end" : ""}`}>
                        {m.role === "user" ? (
                          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-brand-accent/15 border border-brand-accent/30 text-neutral-50 text-body-sm whitespace-pre-wrap">
                            {m.content}
                          </div>
                        ) : (
                          <div className="group/msg space-y-2">
                            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-neutral-700/40 text-neutral-100 text-sm">
                              <SofiaMarkdown text={textForMarkdown} />
                              {loading && isLastAssistant && (
                                <span className="inline-block w-1.5 h-4 ml-0.5 bg-brand-accent animate-pulse align-middle" />
                              )}
                            </div>

                            {/* Visualização estruturada — só renderiza se blocos válidos após schema */}
                            {insights.blocks.length > 0 && (
                              <AIInsightRenderer blocks={insights.blocks} />
                            )}

                            {/* Quick-jump chips for mentioned routes */}
                            {routes.length > 0 && !loading && (
                              <div className="flex flex-wrap gap-1.5 pl-1">
                                {routes.map((r) => (
                                  <button key={r} onClick={() => { navigate(r); setOpen(false); }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 text-[11px] text-brand-accent transition">
                                    Ir para <code className="font-mono">{r}</code> <ArrowRight className="w-3 h-3" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Message actions */}
                            {!loading && (
                              <div className="flex items-center gap-1 pl-1 opacity-0 group-hover/msg:opacity-100 transition">
                                <button onClick={() => copyMessage(i, m.content)}
                                  className="text-[11px] text-neutral-500 hover:text-brand-accent flex items-center gap-1 px-2 py-1 rounded transition">
                                  {copiedIdx === i ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                                </button>
                                {isLastAssistant && (
                                  <button onClick={regenerate}
                                    className="text-[11px] text-neutral-500 hover:text-brand-accent flex items-center gap-1 px-2 py-1 rounded transition">
                                    <RefreshCw className="w-3 h-3" /> Regenerar
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {loading && messages[messages.length - 1]?.role === "user" && <ThinkingSkeleton />}
              </div>

              {/* Composer */}
              <div className="border-t border-brand-accent/20 bg-brand-primary/60 backdrop-blur">
                {/* Slash command palette */}
                {showSlashMenu && filteredSlash.length > 0 && (
                  <div className="px-5 pt-3">
                    <div className="rounded-xl border border-brand-accent/30 bg-brand-primary/80 overflow-hidden">
                      {filteredSlash.map((c) => (
                        <button key={c.cmd}
                          onClick={() => { setInput(""); send(c.desc + ` (${c.cmd})`); }}
                          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-brand-accent/10 transition">
                          <code className="text-[12px] text-brand-accent font-mono">{c.cmd}</code>
                          <span className="text-[11px] text-neutral-400">{c.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <form
                  onSubmit={(e) => { e.preventDefault(); send(input); }}
                  className="px-5 py-4 flex gap-2 items-end"
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Pergunte à Sofia… (Enter envia · Shift+Enter quebra linha · / comandos)"
                    disabled={loading}
                    className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-white/[0.05] border border-neutral-700/40 focus:border-brand-accent/60 focus:outline-none focus:ring-1 focus:ring-brand-accent/40 text-body-sm text-neutral-50 placeholder:text-neutral-600 disabled:opacity-50 max-h-[180px]"
                  />
                  {loading ? (
                    <button type="button" onClick={stop}
                      className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center hover:bg-amber-500/30 transition"
                      aria-label="Parar">
                      <StopCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={!input.trim()}
                      className="w-11 h-11 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center disabled:opacity-40 hover:bg-brand-accent-bright transition shadow-lg shadow-brand-accent/20"
                      aria-label="Enviar">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
