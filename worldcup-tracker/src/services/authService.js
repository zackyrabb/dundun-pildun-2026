import { supabase, supabaseConfigError } from "./supabaseClient";

export async function signUp(email, password) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase.auth.signUp({
    email,
    password
  });
}

export async function signIn(email, password) {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signOut() {
  if (!supabase) {
    return { error: supabaseConfigError };
  }

  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getSession() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session;
}
