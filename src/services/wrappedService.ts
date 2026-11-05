/**
 * wrappedService — Sprint 8: Political Wrapped data aggregator.
 * Computes user retrospective stats from saved analyses + civic actions.
 * Pure read-only aggregation; no mutations.
 */
import { supabase } from "@/integrations/supabase/client";

export interface WrappedStats {
  totalAnalyses: number;
  totalCivicActions: number;
  countriesAnalyzed: string[];
  topCountry: { id: string; count: number } | null;
  averageScore: number | null;
  highestScore: { value: number; title: string; countryId: string } | null;
  lowestScore: { value: number; title: string; countryId: string } | null;
  axesExplored: number;
  actionsByAxis: { axisId: string; count: number }[];
  firstAnalysisDate: string | null;
  lastAnalysisDate: string | null;
  streakDays: number;
  governmentsAnalyzed: number;
  archetype: WrappedArchetype;
}

export interface WrappedArchetype {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
}

const ARCHETYPES: Record<string, WrappedArchetype> = {
  scholar: {
    id: "scholar",
    title: "O Acadêmico",
    subtitle: "Rigor metodológico em primeiro lugar",
    description: "Você prioriza profundidade analítica e cobertura completa de eixos antes de tirar conclusões.",
    emoji: "🎓",
  },
  strategist: {
    id: "strategist",
    title: "O Estrategista",
    subtitle: "Padrões cruzados, decisões claras",
    description: "Você compara governos lado a lado e identifica alavancas estruturais de mudança.",
    emoji: "♟️",
  },
  citizen: {
    id: "citizen",
    title: "O Cidadão Engajado",
    subtitle: "Análise vira ação",
    description: "Você transforma cada insight em ações cívicas concretas — petições, contatos, voluntariado.",
    emoji: "🗳️",
  },
  explorer: {
    id: "explorer",
    title: "O Explorador",
    subtitle: "Curiosidade comparativa internacional",
    description: "Você analisa múltiplos países e busca lições transferíveis entre contextos.",
    emoji: "🌍",
  },
  apprentice: {
    id: "apprentice",
    title: "O Aprendiz",
    subtitle: "Começando a jornada analítica",
    description: "Você está construindo sua base — cada análise expande seu repertório crítico.",
    emoji: "✨",
  },
};

function pickArchetype(s: Omit<WrappedStats, "archetype">): WrappedArchetype {
  if (s.totalAnalyses === 0) return ARCHETYPES.apprentice;
  if (s.totalCivicActions >= 5 && s.totalCivicActions >= s.totalAnalyses) return ARCHETYPES.citizen;
  if (s.countriesAnalyzed.length >= 3) return ARCHETYPES.explorer;
  if (s.governmentsAnalyzed >= 8) return ARCHETYPES.strategist;
  if (s.axesExplored >= 10) return ARCHETYPES.scholar;
  return ARCHETYPES.apprentice;
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export async function fetchWrappedStats(): Promise<WrappedStats> {
  const [analysesRes, actionsRes] = await Promise.all([
    supabase.from("analyses").select("*").order("created_at", { ascending: true }),
    supabase.from("user_civic_actions").select("*").order("completed_at", { ascending: true }),
  ]);

  if (analysesRes.error) throw analysesRes.error;
  if (actionsRes.error) throw actionsRes.error;

  const analyses = analysesRes.data ?? [];
  const actions = actionsRes.data ?? [];

  const countryCount = new Map<string, number>();
  let scoreSum = 0;
  let scoreN = 0;
  let highest: WrappedStats["highestScore"] = null;
  let lowest: WrappedStats["lowestScore"] = null;
  const axesSet = new Set<string>();
  let govCount = 0;

  for (const a of analyses) {
    countryCount.set(a.country_id, (countryCount.get(a.country_id) ?? 0) + 1);
    const scores = (a.scores as Record<string, unknown>) ?? {};
    const axisData = (a.axis_data as Record<string, unknown>) ?? {};
    Object.keys(axisData).forEach((k) => axesSet.add(k));
    const govs = Array.isArray(a.governments) ? a.governments : [];
    govCount += govs.length;
    const avg = typeof scores.average === "number" ? (scores.average as number) : null;
    if (avg !== null) {
      scoreSum += avg;
      scoreN++;
      if (!highest || avg > highest.value) highest = { value: avg, title: a.title, countryId: a.country_id };
      if (!lowest || avg < lowest.value) lowest = { value: avg, title: a.title, countryId: a.country_id };
    }
  }

  const actionsByAxisMap = new Map<string, number>();
  for (const a of actions) {
    if (a.axis_id) actionsByAxisMap.set(a.axis_id, (actionsByAxisMap.get(a.axis_id) ?? 0) + 1);
  }

  let topCountry: WrappedStats["topCountry"] = null;
  for (const [id, count] of countryCount.entries()) {
    if (!topCountry || count > topCountry.count) topCountry = { id, count };
  }

  const allDates = [...analyses.map((a) => a.created_at), ...actions.map((a) => a.completed_at)];

  const partial: Omit<WrappedStats, "archetype"> = {
    totalAnalyses: analyses.length,
    totalCivicActions: actions.length,
    countriesAnalyzed: [...countryCount.keys()],
    topCountry,
    averageScore: scoreN ? scoreSum / scoreN : null,
    highestScore: highest,
    lowestScore: lowest,
    axesExplored: axesSet.size,
    actionsByAxis: [...actionsByAxisMap.entries()]
      .map(([axisId, count]) => ({ axisId, count }))
      .sort((a, b) => b.count - a.count),
    firstAnalysisDate: analyses[0]?.created_at ?? null,
    lastAnalysisDate: analyses[analyses.length - 1]?.created_at ?? null,
    streakDays: computeStreak(allDates),
    governmentsAnalyzed: govCount,
  };

  return { ...partial, archetype: pickArchetype(partial) };
}
