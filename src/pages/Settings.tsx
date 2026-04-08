import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Moon, Shield, User, LogOut } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  useSwipeBack("/home");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

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
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <User className="w-5 h-5 text-muted-foreground" />
                <span>Profilo Utente</span>
              </div>
              <div className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy e Sicurezza</span>
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="destructive" 
            className="w-full gap-2"
            onClick={() => navigate("/")}
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
