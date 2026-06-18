import { supabase, supabaseConfigError } from "./supabaseClient";

export async function syncWorldCupData() {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const { data, error } = await supabase.functions.invoke(
    "sync-footballdata-wc-2026",
    { body: {} },
  );

  return { data, error };
}
