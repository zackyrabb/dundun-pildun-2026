import { supabase, supabaseConfigError } from "./supabaseClient";

const matchRelation = `
  *,
  home_team:teams!matches_home_team_id_fkey(*),
  away_team:teams!matches_away_team_id_fkey(*)
`;

export async function getTeams() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });
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

export async function getTeamMatches(teamId) {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("matches")
    .select(matchRelation)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("match_date", { ascending: true });
}
