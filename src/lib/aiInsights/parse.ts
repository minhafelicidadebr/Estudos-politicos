/**
 * Extração segura de blocos estruturados a partir de texto/markdown vindo da IA.
 * Convenção: a IA pode incluir 1+ fences ```insights ... ``` contendo JSON.
 * Fallback: retorna { blocks: [], remainingText } — nunca lança.
 */
import { validatePayload, validateBlock } from "./schema";
import type { AIInsightBlock } from "@/types/aiInsights";

const FENCE = /```insights\s*\n([\s\S]*?)```/gi;

export interface ExtractResult {
  blocks: AIInsightBlock[];
  /** Texto original menos os fences de insights (para renderizar markdown). */
  cleanedText: string;
}

export function extractInsightBlocks(text: string): ExtractResult {
  if (!text || typeof text !== "string") return { blocks: [], cleanedText: text ?? "" };
  const collected: AIInsightBlock[] = [];
  let cleaned = text;

  const matches = Array.from(text.matchAll(FENCE));
  for (const m of matches) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("[aiInsights] JSON inválido em fence 'insights'");
      }
      continue;
    }
    // Aceita payload completo { version, blocks } ou array direto ou bloco único.
    const payload = validatePayload(parsed);
    if (payload) {
      collected.push(...payload.blocks);
    } else if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const b = validateBlock(item);
        if (b) collected.push(b);
      }
    } else {
      const b = validateBlock(parsed);
      if (b) collected.push(b);
    }
  }

  cleaned = text.replace(FENCE, "").trim();
  return { blocks: collected, cleanedText: cleaned };
}
