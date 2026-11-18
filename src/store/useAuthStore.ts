import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { type User } from "@supabase/supabase-js";
import { type UserProfile } from "../types/auth";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

let subscribed = false;
let initPromise: Promise<void> | null = null;

/** Loads the profile row; if the row is missing (e.g. account created before the trigger existed) creates it. */
const loadProfile = async (user: User): Promise<UserProfile | null> => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  if (data) return data as UserProfile;

  // RLS only allows inserting your own row with role = 'user'
  const meta = user.user_metadata ?? {};
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: meta.full_name ?? meta.name ?? "",
      avatar_url: meta.avatar_url ?? meta.picture ?? "",
      role: "user",
    })
    .select("*")
    .maybeSingle();
  if (insertError) console.error("Error creating missing profile:", insertError);
  return (created as UserProfile | null) ?? null;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;
    set({ profile: await loadProfile(user) });
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.error("Sign out error:", e);
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
    set({ user: null, profile: null, loading: false });
  },
  initialize: () => {
    if (initPromise) return initPromise; // StrictMode / re-render safe
    initPromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        if (user) {
          set({ user, loading: true });
          set({ profile: await loadProfile(user) });
        } else {
          set({ user: null, profile: null });
        }
      } catch (e) {
        console.error("Auth initialisation failed:", e);
      } finally {
        set({ loading: false, initialized: true }); // never leave the app on the splash screen
      }

      if (subscribed) return;
      subscribed = true;
      supabase.auth.onAuthStateChange((event, session) => {
        const newUser = session?.user ?? null;
        if (!newUser) {
          set({ user: null, profile: null, loading: false });
          return;
        }
        const current = get().profile;
        if (event === "TOKEN_REFRESHED" || (current?.id === newUser.id && event !== "USER_UPDATED")) {
          set({ user: newUser });
          return;
        }
        set({ user: newUser, loading: true });
        // Defer: calling supabase inside this callback can deadlock the auth lock
        setTimeout(async () => {
          const profile = await loadProfile(newUser);
          set({ profile, loading: false });
        }, 0);
      });
    })();
    return initPromise;
  },
}));
