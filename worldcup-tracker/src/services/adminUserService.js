import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getAllUsers() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function getUserById(userId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function updateUserRole(userId, role) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();
}

export async function getUserStats(userId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const [favoritesResult, predictionsResult] = await Promise.all([
    supabase
      .from("user_favorite_teams")
      .select("team_id, teams(*)")
      .eq("user_id", userId),

    supabase
      .from("predictions")
      .select(`
        *,
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `)
      .eq("user_id", userId),
  ]);

  if (favoritesResult.error) {
    return { data: null, error: favoritesResult.error };
  }

  if (predictionsResult.error) {
    return { data: null, error: predictionsResult.error };
  }

  return {
    data: {
      favoriteTeams: favoritesResult.data || [],
      predictions: predictionsResult.data || [],
    },
    error: null,
  };
}
