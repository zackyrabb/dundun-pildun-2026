import { supabase, supabaseConfigError } from "./supabaseClient";

export async function getProfile(userId) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function getAllProfiles() {
  if (!supabase) {
    return { data: [], error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });
}

export async function upsertProfile(profile) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();
}

export async function uploadAvatar(userId, file) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/profile.${fileExt}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true
    });

  if (error) {
    return { data: null, error };
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return {
    data: {
      path: filePath,
      publicUrl: publicUrlData.publicUrl
    },
    error: null
  };
}
