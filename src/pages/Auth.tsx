import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const VALID_CHECKOUT_PLANS = new Set(["pro", "expert"]);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const checkoutPlan = searchParams.get("checkout") ?? "";
  const hasPendingCheckout = VALID_CHECKOUT_PLANS.has(checkoutPlan);
  // If checkout is pending, default to signup mode (most users coming from landing pricing won't have account yet)
  const [isLogin, setIsLogin] = useState(!hasPendingCheckout);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", nome: "", cognome: "" });
  const [resetting, setResetting] = useState(false);

  const handleForgotPassword = async () => {
    if (!form.email) {
      toast({ title: "Inserisci la tua email", description: "Scrivi l'email sopra, poi clicca di nuovo.", variant: "destructive" });
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Email inviata", description: "Controlla la posta per il link di reset password." });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  // After auth success: either start checkout or go home (or /pricing after a fresh signup)
  const proceedAfterAuth = async () => {
    if (!hasPendingCheckout) {
      const postSignup = sessionStorage.getItem("safevin_post_signup_pricing") === "1";
      if (postSignup) {
        sessionStorage.removeItem("safevin_post_signup_pricing");
        sessionStorage.setItem("safevin_pricing_exit_pending", "1");
        navigate("/pricing", { replace: true });
        return;
      }
      navigate("/home", { replace: true });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: checkoutPlan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Nessun URL di checkout ricevuto");
    } catch (e: any) {
      toast({
        title: "Errore",
        description: e?.message ?? "Impossibile avviare il pagamento",
        variant: "destructive",
      });
      navigate("/home", { replace: true });
    }
  };

  // If user is/becomes logged in (e.g. via OAuth redirect or already signed in), trigger checkout or home
  useEffect(() => {
    if (user) {
      proceedAfterAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        // The useEffect on `user` will trigger proceedAfterAuth (checkout or /home)
      } else {
        sessionStorage.setItem("safevin_post_signup_pricing", "1");
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              given_name: form.nome,
              family_name: form.cognome,
              name: `${form.nome} ${form.cognome}`.trim(),
            },
          },
        });
        if (error) throw error;
        // If a session was created immediately (email confirmation disabled), useEffect handles it.
        // Otherwise inform the user to verify email.
        if (!data.session) {
          toast({
            title: "Registrazione completata",
            description: hasPendingCheckout
              ? "Controlla la tua email per verificare l'account, poi accedi per completare il pagamento."
              : "Controlla la tua email per verificare l'account.",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Si è verificato un errore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Preserve checkout intent across OAuth redirect by returning to /auth with the same query.
      const redirectTarget = hasPendingCheckout
        ? `${window.location.origin}/auth?checkout=${checkoutPlan}`
        : `${window.location.origin}/home`;
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectTarget,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.redirected) {
        return;
      }

      // If no redirect happened, useEffect on user will handle proceedAfterAuth.
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Errore con Google Sign In.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-foreground">SAFE</span>
            <span className="text-primary">ViN</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isLogin ? "Accedi al tuo account" : "Crea il tuo account"}
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 space-y-4">
            {/* Google */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continua con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">oppure</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Nome"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        className="pl-9 h-9 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cognome</Label>
                    <Input
                      placeholder="Cognome"
                      value={form.cognome}
                      onChange={(e) => setForm({ ...form, cognome: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@esempio.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-9 h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-9 pr-9 h-9 text-sm"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Caricamento..." : isLogin ? "Accedi" : "Registrati"}
              </Button>

              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetting}
                  className="block w-full text-center text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  {resetting ? "Invio in corso…" : "Password dimenticata?"}
                </button>
              )}
            </form>

            <p className="text-center text-xs text-muted-foreground">
              {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
              <button
                className="text-primary hover:underline font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Registrati" : "Accedi"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
