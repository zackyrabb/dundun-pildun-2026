import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getMatches() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order("match_date", { ascending: true });
}

export async function getMatchById(matchId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq("id", matchId)
    .single();
}

export async function getFinishedMatches() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq("status", "finished")
    .order("match_date", { ascending: false });
}

export async function getScheduledMatches() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq("status", "scheduled")
    .order("match_date", { ascending: true });
}
