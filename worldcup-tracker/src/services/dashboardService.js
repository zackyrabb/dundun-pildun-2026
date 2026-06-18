import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getDashboardData(userId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const [favoriteTeamsResult, matchesResult, predictionsResult, profilesResult] = await Promise.all([
    supabase
      .from("user_favorite_teams")
      .select("team_id, teams(*)")
      .eq("user_id", userId),
    supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `),
    supabase
      .from("predictions")
      .select(`
        *,
        profile:profiles(*),
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `),
    supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true }),
  ]);

  const error =
    favoriteTeamsResult.error ||
    matchesResult.error ||
    predictionsResult.error ||
    profilesResult.error;

  if (error) {
    return { data: null, error };
  }

  return {
    data: {
      favoriteTeams: favoriteTeamsResult.data ?? [],
      matches: matchesResult.data ?? [],
      predictions: predictionsResult.data ?? [],
      profiles: profilesResult.data ?? [],
    },
    error: null,
  };
}
