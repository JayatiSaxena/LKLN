
export interface UserProfile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
  email?: string;
  phone?: string;
  created_at?: string;
}

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  picture?: string;
  role?: 'user' | 'admin';
  created_at?: string;
};

export type SignupResult = { needsConfirmation: boolean; role?: string };

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: 'admin' | 'user') => Promise<UserProfile | null>;
  signup: (name: string, email: string, password: string) => Promise<SignupResult>;
  googleLogin: (credential: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}
