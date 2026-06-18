import { supabase, supabaseConfigError } from "./supabaseClient";

export async function createTeam(payload) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .insert(payload)
    .select()
    .single();
}

export async function updateTeam(teamId, payload) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .update(payload)
    .eq("id", teamId)
    .select()
    .single();
}

export async function deleteTeam(teamId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .delete()
    .eq("id", teamId);
}

export async function getTeamById(teamId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();
}
