import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { checkAndRegisterDevice } from "@/lib/deviceGuard";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const runDeviceCheck = async (uid: string) => {
      if (checkedUserIdRef.current === uid) return;
      checkedUserIdRef.current = uid;

      const result = await checkAndRegisterDevice();
      if (!result.allowed && result.reason === "device_already_registered") {
        toast.error(
          "Questo dispositivo è già stato usato per registrare un altro account. Non è possibile creare o accedere con un account differente.",
          { duration: 8000 }
        );
        await supabase.auth.signOut();
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        runDeviceCheck(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_OUT") {
        checkedUserIdRef.current = null;
        return;
      }

      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        // Defer per evitare deadlock col listener
        setTimeout(() => runDeviceCheck(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
