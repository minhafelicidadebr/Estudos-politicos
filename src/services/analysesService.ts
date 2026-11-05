/**
 * analysesService — CRUD for saved comparative analyses on Lovable Cloud.
 * All operations are RLS-protected (user_id = auth.uid()).
 */
import { supabase } from "@/integrations/supabase/client";

export interface SavedAnalysis {
  id: string;
  user_id: string;
  title: string;
  country_id: string;
  governments: unknown;
  axis_data: unknown;
  scores: unknown;
  framework_version: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export async function listAnalyses(): Promise<SavedAnalysis[]> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedAnalysis[];
}

export async function getAnalysis(id: string): Promise<SavedAnalysis | null> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as SavedAnalysis | null;
}

export async function saveAnalysis(input: {
  title: string;
  countryId: string;
  governments: unknown;
  axisData: unknown;
  scores: unknown;
  isPublic?: boolean;
}): Promise<SavedAnalysis> {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("not_authenticated");
  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userRes.user.id,
      title: input.title,
      country_id: input.countryId,
      governments: input.governments as never,
      axis_data: input.axisData as never,
      scores: input.scores as never,
      is_public: input.isPublic ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SavedAnalysis;
}

export async function deleteAnalysis(id: string): Promise<void> {
  const { error } = await supabase.from("analyses").delete().eq("id", id);
  if (error) throw error;
}

export async function logCivicAction(input: {
  actionType: string;
  axisId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("not_authenticated");
  const { error } = await supabase.from("user_civic_actions").insert({
    user_id: userRes.user.id,
    action_type: input.actionType,
    axis_id: input.axisId ?? null,
    description: input.description,
    metadata: (input.metadata ?? {}) as never,
  });
  if (error) throw error;
}
