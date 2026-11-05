/**
 * discoverGovernmentsService — Gera governos para QUALQUER país via IA (PIR+/AAM).
 * Cache em localStorage para preservar créditos Lovable AI.
 */
import type { GovernmentRecord } from "@/types/aegis";

const URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/comparative-analysis`;
const CACHE_PREFIX = "agora:discovered-govs:v1:";

const FALLBACK_COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D85A30", "#7F77DD", "#E24B4A"];

export async function discoverGovernments(
  countryId: string,
  countryName: string,
  count = 4
): Promise<GovernmentRecord[]> {
  const key = `${CACHE_PREFIX}${countryId.toUpperCase()}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached) as GovernmentRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }

  const res = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      type: "discover_governments",
      payload: { country: countryName, countryId: countryId.toUpperCase(), count },
    }),
  });

  const payload = await res.json().catch(() => null) as { error?: string; result?: { governments?: GovernmentRecord[] } } | null;
  if (!res.ok || payload?.error) {
    throw new Error(payload?.error || `Falha ao descobrir governos (${res.status})`);
  }

  const list = (payload?.result?.governments ?? []).map((g, i) => ({
    ...g,
    countryId: countryId.toUpperCase(),
    color: g.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    dataCoveragePct: g.dataCoveragePct ?? 70,
    analyticalMaturity: g.analyticalMaturity ?? "Média",
    contextFlags: g.contextFlags ?? [],
  })) as GovernmentRecord[];

  if (list.length === 0) throw new Error("A IA não retornou governos válidos.");

  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* ignore quota */ }
  return list;
}

export function clearDiscoveredGovernments(countryId: string) {
  try { localStorage.removeItem(`${CACHE_PREFIX}${countryId.toUpperCase()}`); } catch { /* ignore */ }
}

export function getCachedDiscovered(countryId: string): GovernmentRecord[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${countryId.toUpperCase()}`);
    return raw ? (JSON.parse(raw) as GovernmentRecord[]) : null;
  } catch { return null; }
}
