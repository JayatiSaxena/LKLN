import { createClient } from "@supabase/supabase-js";

// Use placeholder values to prevent createClient from throwing if keys are missing
// This allows the App to load and show the ConfigError component instead of a blank screen
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("errors");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // keep the session across page refreshes
    autoRefreshToken: true,
    detectSessionInUrl: true,    // email-confirmation / OAuth redirects
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "lkln-auth",
  },
});
