// Sprint 13 — AI Narrator. Streams an editorial narrative for a comparative analysis.
// Uses Lovable AI Gateway (LOVABLE_API_KEY auto-provisioned). SSE pass-through.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  title?: string;
  countryId?: string;
  governments?: Array<{ id?: string; name?: string; period?: string }>;
  axisData?: Record<string, Record<string, number>>;
  scores?: Record<string, unknown>;
  language?: "pt" | "en" | "es";
}

const SYSTEM = `Você é um analista político sênior do framework PIR+ (Perspectiva, Imparcialidade, Rigor) da plataforma Ágora.
Escreva uma narrativa editorial curta (350-500 palavras), sóbria, comparativa e imparcial sobre os governos analisados.
Estrutura obrigatória:
1) Abertura cinematográfica (1 parágrafo).
2) Pontos de divergência mais marcantes entre governos por eixo (com números).
3) Convergências e padrões institucionais.
4) Veredito analítico (não-partidário) com nuances.
Estilo: jornalismo de longa-forma, primeira frase forte, frases ritmadas, zero jargão técnico desnecessário.
Nunca invente dados. Use apenas os números fornecidos.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const langName = body.language === "en" ? "English" : body.language === "es" ? "Español" : "Português brasileiro";
    const govs = (body.governments ?? []).map((g) => `- ${g.name ?? g.id ?? "?"}${g.period ? ` (${g.period})` : ""}`).join("\n");
    const axisLines = Object.entries(body.axisData ?? {})
      .slice(0, 28)
      .map(([axis, perGov]) => {
        const pairs = Object.entries(perGov ?? {})
          .map(([g, v]) => `${g}=${typeof v === "number" ? v.toFixed(1) : v}`)
          .join(", ");
        return `• ${axis}: ${pairs}`;
      })
      .join("\n");
    const scoresLine = Object.entries(body.scores ?? {})
      .filter(([, v]) => typeof v === "number")
      .map(([k, v]) => `${k}=${(v as number).toFixed(2)}`)
      .join(", ");

    const userMsg = `Idioma: ${langName}.
Análise: ${body.title ?? "(sem título)"} — País: ${body.countryId ?? "?"}.

Governos:
${govs || "(não informados)"}

Scores agregados: ${scoresLine || "(não informados)"}

Eixos analíticos:
${axisLines || "(sem eixos)"}

Escreva agora a narrativa.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados na sua workspace Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await resp.text();
      console.error("AI gateway error", resp.status, txt);
      return new Response(JSON.stringify({ error: "Falha no gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("narrate-analysis error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
