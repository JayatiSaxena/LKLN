import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type UserProfile } from "../../types/auth";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { supabase } from "../supabase";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuthStore();
  const { subscribeToCart, fetchItems: fetchCart } = useCartStore();
  const { subscribeToWishlist, fetchItems: fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      // Initial fetch to ensure data is there as soon as user logs in
      fetchCart(user.id);
      fetchWishlist(user.id);

      // Realtime subscriptions
      const unsubCart = subscribeToCart(user.id);
      const unsubWishlist = subscribeToWishlist(user.id);

      return () => {
        unsubCart();
        unsubWishlist();
      };
    }
  }, [user, fetchCart, fetchWishlist, subscribeToCart, subscribeToWishlist]);

  const getProfile = async (id: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    return data as UserProfile | null;
  };

  const login = async (email: string, password: string, expectedRole?: 'admin' | 'user') => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await getProfile(data.user.id);
    const isAdmin = profile?.role === 'admin';
    if (expectedRole && (expectedRole === 'admin') !== isAdmin) {
      await supabase.auth.signOut();
      throw new Error(
        expectedRole === 'admin'
          ? "This account does not have admin access."
          : "Admin accounts must sign in through the Admin Portal."
      );
    }
    useAuthStore.setState({ user: data.user, profile, loading: false });
    return profile;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("An account with this email already exists. Please sign in.");
    }
    if (!data.session || !data.user) return { needsConfirmation: true };
    const profile = await getProfile(data.user.id);
    return { needsConfirmation: false, role: profile?.role };
  };

  const googleLogin = async (credential: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: credential,
    });
    if (error) throw error;
    const profile = await getProfile(data.user.id);
    if (profile?.role === 'admin') {
      await supabase.auth.signOut();
      throw new Error("Admin accounts must sign in through the Admin Portal.");
    }
    useAuthStore.setState({ user: data.user, profile, loading: false });
    return profile;
  };

  const logout = async () => {
    const wasAdmin = profile?.role === 'admin';
    await signOut();
    useCartStore.setState({ items: [] });
    useWishlistStore.setState({ items: [] });
    navigate(wasAdmin ? "/admin/login" : "/", { replace: true });
  };

  const value = useMemo(() => ({ 
    user: user ? { 
      ...user, 
      name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0], 
      picture: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
      phone: profile?.phone || user.phone || undefined,
      role: profile?.role as 'user' | 'admin' | undefined,
      created_at: profile?.created_at || user.created_at
    } : null, 
    loading, 
    login, 
    signup, 
    googleLogin, 
    logout 
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
