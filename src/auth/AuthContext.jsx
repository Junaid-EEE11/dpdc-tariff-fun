import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getAuthRedirectUrl,
  isSupabaseConfigured,
  supabase,
} from "./supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
      if (event === "SIGNED_OUT") setPasswordRecovery(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    [],
  );

  const signUp = useCallback(
    (email, password) =>
      supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getAuthRedirectUrl() },
      }),
    [],
  );

  const requestPasswordReset = useCallback(
    (email) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl(),
      }),
    [],
  );

  const updatePassword = useCallback(
    (password) => supabase.auth.updateUser({ password }),
    [],
  );

  const completePasswordRecovery = useCallback(() => {
    setPasswordRecovery(false);
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut({ scope: "local" }), []);

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      loading,
      passwordRecovery,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      completePasswordRecovery,
      signOut,
    }),
    [
      completePasswordRecovery,
      loading,
      passwordRecovery,
      requestPasswordReset,
      session,
      signIn,
      signOut,
      signUp,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
