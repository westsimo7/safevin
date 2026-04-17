import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Moon, Shield, User, LogOut, ChevronDown, ChevronUp, Palette, CreditCard, Receipt, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreativeDirectorChat from "@/components/CreativeDirectorChat";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  useSwipeBack("/home");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("safevin-theme") !== "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.remove("light");
      localStorage.setItem("safevin-theme", "dark");
    } else {
      root.classList.add("light");
      localStorage.setItem("safevin-theme", "light");
    }
  }, [darkMode]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cdOpen, setCdOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    avatar_url: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nome, cognome, email, telefono, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          nome: data.nome || "",
          cognome: data.cognome || "",
          email: data.email || "",
          telefono: data.telefono || "",
          avatar_url: (data as any).avatar_url || "",
        });
      }
      // Check if user has founder role (founder sees inbox page instead) or expert/pro plan
      const { data: isFounder } = await supabase.rpc("has_role", { _user_id: user.id, _role: "founder" as const });
      if (isFounder) {
        setUserPlan("founder");
      } else {
        // TODO: connect to real plan system - for now check role
        setUserPlan("expert"); // Placeholder - will be replaced with real plan check
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          cognome: profile.cognome,
          telefono: profile.telefono,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Salvato", description: "Profilo aggiornato con successo." });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File troppo grande", description: "Massimo 5MB.", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url } as any)
        .eq("user_id", user.id);
      if (updErr) throw updErr;
      setProfile((p) => ({ ...p, avatar_url: url }));
      toast({ title: "Foto profilo aggiornata" });
    } catch (err: any) {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-20">
        <PageTitle title="Impostazioni" backTo="/home" />

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label>Notifiche Push</Label>
                    <p className="text-xs text-muted-foreground">Ricevi aggiornamenti sui tuoi annunci</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label>Modalità Scura</Label>
                    <p className="text-xs text-muted-foreground">Attiva il tema scuro</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <button
                className="w-full flex items-center gap-3 hover:text-primary transition-colors text-left"
                onClick={() => navigate("/profile")}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium flex-1">Profilo Utente</span>
                <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <span>Metodo di pagamento</span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <span>Fatture e ricevute</span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span>Notifiche</span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy e Sicurezza</span>
              </div>
            </CardContent>
          </Card>

          {/* Creative Director section - visible for expert and pro plans */}
          {(userPlan === "expert" || userPlan === "pro") && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <button
                  className="w-full flex items-center justify-between hover:text-amber-500 transition-colors"
                  onClick={() => setCdOpen(!cdOpen)}
                >
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Creative Director</span>
                  </div>
                  {cdOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {cdOpen && (
                  <div className="animate-fade-in">
                    <CreativeDirectorChat />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Button 
            variant="destructive" 
            className="w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Disconnetti
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
