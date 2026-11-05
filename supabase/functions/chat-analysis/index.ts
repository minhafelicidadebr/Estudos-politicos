// Sprint 14 — AI Co-Pilot. Streaming Q&A over a comparative analysis.
// Uses Lovable AI Gateway. SSE pass-through, line-by-line client parsing.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMsg { role: "user" | "assistant"; content: string }
interface Body {
  messages: ChatMsg[];
  context: {
    title?: string;
    countryId?: string;
    governments?: Array<{ id?: string; name?: string; period?: string }>;
    axisData?: Record<string, Record<string, number>>;
    scores?: Record<string, unknown>;
  };
  language?: "pt" | "en" | "es";
}

const SYSTEM_BASE = `Você é o Co-Piloto Analítico da plataforma Ágora — um assistente sênior treinado no framework PIR+ (Perspectiva, Imparcialidade, Rigor) e SIB (Source-Intelligence-Base).
Regras inegociáveis:
1. Responda APENAS com base nos dados fornecidos no contexto. Nunca invente números, eventos ou citações.
2. Se a pergunta exigir dado ausente, declare explicitamente "esse dado não consta na análise atual".
3. Tom imparcial, jornalístico, sem rótulos partidários. Use comparações numéricas sempre que possível.
4. Respostas curtas (3-6 parágrafos no máximo), com pontos numerados quando útil.
5. Quando pertinente, sugira 1-2 perguntas de aprofundamento ao final entre colchetes [Sugestão: ...].`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const langName = body.language === "en" ? "English" : body.language === "es" ? "Español" : "Português brasileiro";
    const ctx = body.context ?? {} as Body["context"];
    const govs = (ctx.governments ?? []).map((g) => `- ${g.name ?? g.id ?? "?"}${g.period ? ` (${g.period})` : ""}`).join("\n");
    const axisLines = Object.entries(ctx.axisData ?? {})
      .slice(0, 28)
      .map(([axis, perGov]) => {
        const pairs = Object.entries(perGov ?? {})
          .map(([g, v]) => `${g}=${typeof v === "number" ? (v as number).toFixed(1) : v}`)
          .join(", ");
        return `• ${axis}: ${pairs}`;
      })
      .join("\n");
    const scoresLine = Object.entries(ctx.scores ?? {})
      .filter(([, v]) => typeof v === "number")
      .map(([k, v]) => `${k}=${(v as number).toFixed(2)}`)
      .join(", ");

    const contextBlock = `IDIOMA: ${langName}
ANÁLISE: ${ctx.title ?? "(sem título)"} — País: ${ctx.countryId ?? "?"}
GOVERNOS:
${govs || "(não informados)"}
SCORES AGREGADOS: ${scoresLine || "(não informados)"}
EIXOS:
${axisLines || "(sem eixos)"}`;

    const messages = [
      { role: "system", content: `${SYSTEM_BASE}\n\n=== CONTEXTO DA ANÁLISE ===\n${contextBlock}` },
      ...(body.messages ?? []).slice(-12),
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados na sua workspace Lovable AI." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await resp.text();
      console.error("AI gateway error", resp.status, txt);
      return new Response(JSON.stringify({ error: "Falha no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-analysis error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
