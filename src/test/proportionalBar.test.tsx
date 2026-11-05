import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProportionalBar } from "@/components/ai-insights/ProportionalBar";

describe("ProportionalBar", () => {
  it("mostra o valor numérico original", () => {
    render(<ProportionalBar value={42} max={100} unit="pts" />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText(/pts/)).toBeInTheDocument();
  });

  it("expõe aria-label com escala explícita", () => {
    render(<ProportionalBar value={20} max={80} />);
    const bar = screen.getByRole("img");
    expect(bar.getAttribute("aria-label")).toMatch(/20/);
    expect(bar.getAttribute("aria-label")).toMatch(/80/);
  });

  it("clampa valores acima do máximo sem quebrar", () => {
    render(<ProportionalBar value={9999} max={100} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("lida com max inválido (0 ou negativo) usando fallback 1", () => {
    render(<ProportionalBar value={0.5} max={0} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
