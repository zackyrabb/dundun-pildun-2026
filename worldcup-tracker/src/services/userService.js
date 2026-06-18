import { supabase, supabaseConfigError } from "./supabaseClient";

const favoriteTeamsRelation = `
  user_favorite_teams(
    team_id,
    teams(*)
  )
`;

const predictionMatchRelation = `
  *,
  match:matches(
    *,
    home_team:teams!matches_home_team_id_fkey(*),
    away_team:teams!matches_away_team_id_fkey(*)
  )
`;

export async function getPublicUsers() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select(`
      *,
      ${favoriteTeamsRelation}
    `)
    .order("full_name", { ascending: true });
}

export async function getPublicUserById(userId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select(`
      *,
      ${favoriteTeamsRelation}
    `)
    .eq("id", userId)
    .single();
}

export async function getPublicUserPredictions(userId) {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("predictions")
    .select(predictionMatchRelation)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getPublicUsersPredictions() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("predictions")
    .select(`
      *,
      profile:profiles(*),
      match:matches(
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      )
    `);
}
