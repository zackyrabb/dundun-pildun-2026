import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getPredictionByMatch(userId, matchId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .maybeSingle();
}

export async function upsertPrediction({
  userId,
  matchId,
  predictedHomeScore,
  predictedAwayScore,
}) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("predictions")
    .upsert(
      {
        user_id: userId,
        match_id: matchId,
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,match_id",
      }
    )
    .select()
    .single();
}

export async function getUserPredictions(userId) {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("predictions")
    .select(`
      *,
      match:matches(
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getAllPredictions() {
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
