import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Bell, CreditCard, Receipt, HelpCircle, Zap } from "lucide-react";

type SettingsTab = "profile" | "security" | "notifications" | "billing" | "payments" | "invoices" | "credits" | "support";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profilo", icon: <User className="w-4 h-4" /> },
  { id: "security", label: "Sicurezza", icon: <Shield className="w-4 h-4" /> },
  { id: "notifications", label: "Notifiche", icon: <Bell className="w-4 h-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="w-4 h-4" /> },
  { id: "payments", label: "Pagamenti", icon: <CreditCard className="w-4 h-4" /> },
  { id: "invoices", label: "Fatture", icon: <Receipt className="w-4 h-4" /> },
  { id: "credits", label: "Crediti", icon: <Zap className="w-4 h-4" /> },
  { id: "support", label: "Assistenza", icon: <HelpCircle className="w-4 h-4" /> },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="md:w-56 flex-shrink-0">
            <div className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Profilo</CardTitle>
                  <CardDescription>Gestisci le informazioni del tuo profilo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <Button variant="outline" size="sm" disabled>Cambia avatar</Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome</label>
                    <Input placeholder="Il tuo nome" defaultValue="Utente SafeViN" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input placeholder="email@esempio.com" disabled />
                  </div>
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Sicurezza</CardTitle>
                  <CardDescription>Gestisci password e autenticazione.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Password attuale</label>
                    <Input type="password" placeholder="••••••••" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nuova password</label>
                    <Input type="password" placeholder="••••••••" disabled />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
                    <div>
                      <p className="text-sm font-medium">Autenticazione a due fattori (2FA)</p>
                      <p className="text-xs text-muted-foreground">Aggiungi un ulteriore livello di sicurezza.</p>
                    </div>
                    <Switch disabled />
                  </div>
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Notifiche</CardTitle>
                  <CardDescription>Scegli quali notifiche ricevere.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Analisi completate", "Aggiornamenti prodotto", "Consigli settimanali", "Newsletter"].map(item => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <p className="text-sm">{item}</p>
                      <Switch disabled />
                    </div>
                  ))}
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}

            {activeTab === "billing" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>Il tuo piano e rinnovo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-semibold text-primary">Piano attuale: Starter (Gratuito)</p>
                    <p className="text-xs text-muted-foreground mt-1">Prova gratuita di 3 giorni.</p>
                  </div>
                  <Button variant="neon" disabled>Upgrade</Button>
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}

            {activeTab === "payments" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Metodi di pagamento</CardTitle>
                  <CardDescription>Gestisci i tuoi metodi di pagamento.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nessun metodo di pagamento configurato.</p>
                    <Badge variant="outline" className="text-xs mt-3">Coming soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "invoices" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Fatture</CardTitle>
                  <CardDescription>Storico delle fatture.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nessuna fattura disponibile.</p>
                    <Badge variant="outline" className="text-xs mt-3">Coming soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "credits" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Crediti</CardTitle>
                  <CardDescription>I tuoi crediti disponibili.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {["Audit Annuncio", "Audit Immagini", "Studio"].map(label => (
                      <div key={label} className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
                        <p className="text-2xl font-bold text-foreground">???</p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}

            {activeTab === "support" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Assistenza</CardTitle>
                  <CardDescription>Hai bisogno di aiuto?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-sm font-medium mb-1">FAQ</p>
                    <p className="text-xs text-muted-foreground">Le risposte alle domande più frequenti.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-sm font-medium mb-1">Contattaci</p>
                    <p className="text-xs text-muted-foreground">support@safevin.app</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Coming soon</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
