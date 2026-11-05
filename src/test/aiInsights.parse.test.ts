import { describe, it, expect } from "vitest";
import { extractInsightBlocks } from "@/lib/aiInsights/parse";

describe("extractInsightBlocks", () => {
  it("retorna vazio quando não há fence insights", () => {
    const r = extractInsightBlocks("apenas markdown puro **negrito**");
    expect(r.blocks).toEqual([]);
    expect(r.cleanedText).toContain("markdown puro");
  });

  it("extrai bloco válido e remove fence do texto", () => {
    const text = [
      "Análise:",
      "```insights",
      JSON.stringify({
        version: 1,
        blocks: [{ id: "a1", type: "alert", data: { severity: "info", message: "olá" } }],
      }),
      "```",
      "Fim.",
    ].join("\n");
    const r = extractInsightBlocks(text);
    expect(r.blocks.length).toBe(1);
    expect(r.blocks[0].type).toBe("alert");
    expect(r.cleanedText).not.toContain("```insights");
  });

  it("nunca lança em JSON malformado", () => {
    const text = "```insights\n{not json}\n```";
    expect(() => extractInsightBlocks(text)).not.toThrow();
    expect(extractInsightBlocks(text).blocks).toEqual([]);
  });

  it("aceita array direto de blocos", () => {
    const text = "```insights\n" + JSON.stringify([
      { id: "n1", type: "next_step", data: { items: [{ label: "Ir", route: "/compare" }] } },
    ]) + "\n```";
    const r = extractInsightBlocks(text);
    expect(r.blocks.length).toBe(1);
  });

  it("lida com input vazio sem quebrar", () => {
    expect(extractInsightBlocks("").blocks).toEqual([]);
    expect(extractInsightBlocks(undefined as unknown as string).blocks).toEqual([]);
  });
});
