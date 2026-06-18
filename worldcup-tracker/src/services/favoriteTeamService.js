import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getTeams() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });
}

export async function getUserFavoriteTeams(userId) {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("user_favorite_teams")
    .select("team_id, teams(*)")
    .eq("user_id", userId);
}

export async function saveUserFavoriteTeams(userId, teamIds) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const { error: deleteError } = await supabase
    .from("user_favorite_teams")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { data: null, error: deleteError };
  }

  const rows = teamIds.map((teamId) => ({
    user_id: userId,
    team_id: teamId
  }));

  return supabase
    .from("user_favorite_teams")
    .insert(rows)
    .select();
}
