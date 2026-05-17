import { useState, useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Shield, MessageSquare, Rocket, HelpCircle, Handshake, Gift, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminUser {
  user_id: string;
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  role: string;
  plan: string;
  studio_used: number;
  studio_limit: number;
  bonus_credits: number;
  cd_used: number;
  cd_limit: number;
  created_at: string;
  studio_count: number;
  analysis_count: number;
  free_redeemed: boolean;
  bundle_purchased: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSwipeBack("/home");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const load = async (showSpinner = false) => {
      if (showSpinner) setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_all_users_admin");
        if (!active) return;
        if (error) {
          console.error("Admin access denied:", error);
          setAuthorized(false);
        } else {
          setUsers(data || []);
          setAuthorized(true);
        }
      } catch {
        if (active) setAuthorized(false);
      } finally {
        if (active && showSpinner) setLoading(false);
      }
    };

    load(true);

    // Realtime: refresh on any change to creations / analyses / credits
    const channel = supabase
      .channel("admin-dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "studio_creations" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "analyses" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_credits" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bundle_purchases" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "free_listing_claims" }, () => load())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        <AppNavbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Shield className="w-12 h-12 text-destructive/50 mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Accesso negato</h1>
          <p className="text-sm text-muted-foreground">Non hai i permessi per accedere a questa sezione.</p>
        </main>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalCreations = users.reduce((sum, u) => sum + u.studio_count + u.analysis_count, 0);
  const totalFreeRedeemed = users.reduce((sum, u) => sum + (u.free_redeemed ? 1 : 0), 0);
  const totalBundlePurchased = users.reduce((sum, u) => sum + (u.bundle_purchased || 0), 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <PageTitle title="Dashboard Founder" backTo="/home" />

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Utenti</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCreations}</p>
                  <p className="text-xs text-muted-foreground">Annunci totali</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalFreeRedeemed}</p>
                  <p className="text-xs text-muted-foreground">Free riscattati</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalBundlePurchased}</p>
                  <p className="text-xs text-muted-foreground">Acquistati (bundle)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Artist Director Inbox button */}
          <Button
            className="w-full mb-3 bg-amber-500 hover:bg-amber-600 text-white gap-2"
            onClick={() => navigate("/admin/inbox")}
          >
            <MessageSquare className="w-4 h-4" />
            Artist Director — Inbox
          </Button>

          {/* Upgrade Inbox button */}
          <Button
            className="w-full mb-3 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={() => navigate("/admin/upgrade-inbox")}
          >
            <Rocket className="w-4 h-4" />
            Upgrade — Inbox
          </Button>

          {/* Collaboration Inbox button */}
          <Button
            className="w-full mb-3 bg-amber-500/80 hover:bg-amber-500 text-white gap-2"
            onClick={() => navigate("/admin/collaboration-inbox")}
          >
            <Handshake className="w-4 h-4" />
            Collaborazioni — Inbox
          </Button>

          {/* Support Inbox button */}
          <Button
            className="w-full mb-6 border-border/50 gap-2"
            variant="outline"
            onClick={() => navigate("/admin/support-inbox")}
          >
            <HelpCircle className="w-4 h-4" />
            Supporto — Inbox
          </Button>

          {/* Users table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Utente</th>
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Ruolo</th>
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Piano</th>
                      <th className="text-center p-3 text-xs text-muted-foreground font-medium">Annunci</th>
                      <th className="text-left p-3 text-xs text-muted-foreground font-medium">Registrato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const plan = u.plan || "free";
                      const used = u.studio_used ?? 0;
                      const planLimit = u.studio_limit ?? 1;
                      const bonus = u.bonus_credits ?? 0;
                      const available = planLimit + bonus;
                      return (
                        <tr key={u.user_id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <p className="font-medium text-foreground truncate max-w-[200px]">
                              {u.nome || u.cognome ? `${u.nome} ${u.cognome}`.trim() : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email}</p>
                          </td>
                          <td className="p-3">
                            <Badge className={
                              u.role === "founder"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : u.role === "admin"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-muted text-muted-foreground border-border/50"
                            }>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-xs capitalize">{plan}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-semibold ${used >= available ? "text-destructive" : "text-foreground"}`}>
                              {used}
                            </span>
                            <span className="text-muted-foreground">/{available}</span>
                            {bonus > 0 && (
                              <span className="ml-1 text-[10px] font-bold text-orange-500">+{bonus}</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString("it-IT")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
