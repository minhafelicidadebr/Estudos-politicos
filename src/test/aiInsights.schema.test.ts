import { describe, it, expect } from "vitest";
import { validateBlock, validatePayload } from "@/lib/aiInsights/schema";

describe("aiInsights schema", () => {
  it("valida bloco KPI mínimo", () => {
    const b = validateBlock({
      id: "k1", type: "kpi",
      data: { items: [{ label: "PIB", value: 100, unit: "USD" }] },
    });
    expect(b).not.toBeNull();
    expect(b?.type).toBe("kpi");
  });

  it("rejeita bloco sem type", () => {
    expect(validateBlock({ id: "x", data: {} })).toBeNull();
  });

  it("rejeita tabela sem colunas", () => {
    expect(validateBlock({ id: "t", type: "table", data: { columns: [], rows: [] } })).toBeNull();
  });

  it("valida payload e descarta blocos inválidos preservando os válidos", () => {
    const p = validatePayload({
      version: 1,
      blocks: [
        { id: "ok", type: "alert", data: { severity: "warn", message: "atenção" } },
        { id: "bad", type: "kpi", data: { items: [] } },
      ],
    });
    expect(p?.blocks.length).toBe(1);
    expect(p?.blocks[0].id).toBe("ok");
  });

  it("rejeita payload sem envelope válido", () => {
    expect(validatePayload({ foo: "bar" })).toBeNull();
  });
});
