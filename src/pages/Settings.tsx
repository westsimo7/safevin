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
import { Bell, Moon, Shield, User, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  useSwipeBack("/home");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("nome, cognome, email, telefono")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          nome: data.nome || "",
          cognome: data.cognome || "",
          email: data.email || "",
          telefono: data.telefono || "",
        });
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
                className="w-full flex items-center justify-between hover:text-primary transition-colors"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Profilo Utente</span>
                </div>
                {profileOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {profileOpen && (
                <div className="space-y-4 pt-2 pl-8 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input
                      placeholder="Il tuo nome"
                      value={profile.nome}
                      onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Cognome</Label>
                    <Input
                      placeholder="Il tuo cognome"
                      value={profile.cognome}
                      onChange={(e) => setProfile({ ...profile, cognome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Telefono</Label>
                    <Input
                      type="tel"
                      placeholder="+39 000 000 0000"
                      value={profile.telefono}
                      onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                    />
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={handleSave} disabled={saving}>
                    {saving ? "Salvataggio..." : "Salva modifiche"}
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy e Sicurezza</span>
              </div>
            </CardContent>
          </Card>

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
