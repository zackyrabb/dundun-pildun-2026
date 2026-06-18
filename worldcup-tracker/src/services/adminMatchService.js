import { supabase, supabaseConfigError } from "./supabaseClient";

export async function createMatch(payload) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .insert(payload)
    .select()
    .single();
}

export async function updateMatch(matchId, payload) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()
    .single();
}

export async function deleteMatch(matchId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .delete()
    .eq("id", matchId);
}
