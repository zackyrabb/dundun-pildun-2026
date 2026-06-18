import { supabase, supabaseConfigError } from "./supabaseClient";

export async function importWorldCup2026Fixtures() {
  if (!supabase) {
    return { data: null, error: supabaseConfigError };
  }

  const { data, error } = await supabase.functions.invoke(
    "import-openfootball-2026",
    { body: {} },
  );

  return { data, error };
}
