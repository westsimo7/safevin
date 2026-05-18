import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Invia la mail di benvenuto una sola volta per utente, SOLO dopo che
      // l'email è stata confermata (per Google OAuth è immediato, per
      // email/password avviene dopo il click sul link di conferma).
      if (event === "SIGNED_IN" && session?.user) {
        const u = session.user;
        const key = `welcomeEmailSent:${u.id}`;
        const emailConfirmed = !!(u.email_confirmed_at || (u as any).confirmed_at);
        if (emailConfirmed && !localStorage.getItem(key)) {
          const createdAt = u.created_at ? new Date(u.created_at).getTime() : 0;
          const isNew = createdAt && Date.now() - createdAt < 24 * 60 * 60 * 1000;
          if (isNew) {
            localStorage.setItem(key, "1");
            const name =
              (u.user_metadata?.given_name as string | undefined) ||
              (u.user_metadata?.name as string | undefined)?.split(" ")[0] ||
              undefined;
            setTimeout(() => {
              supabase.functions
                .invoke("send-transactional-email", {
                  body: {
                    templateName: "welcome",
                    recipientEmail: u.email,
                    idempotencyKey: `welcome-${u.id}`,
                    templateData: { name },
                  },
                })
                .catch((err) => console.error("welcome email failed", err));
            }, 0);
          }
        }
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
