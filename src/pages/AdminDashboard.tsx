import { useState, useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Shield } from "lucide-react";

interface AdminUser {
  user_id: string;
  email: string;
  nome: string;
  cognome: string;
  telefono: string;
  role: string;
  created_at: string;
  studio_count: number;
  analysis_count: number;
}

const planLimits: Record<string, number> = {
  free: 2,
  starter: 10,
  pro: 25,
  expert: 60,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSwipeBack("/home");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.rpc("get_all_users_admin");
        if (error) {
          console.error("Admin access denied:", error);
          setAuthorized(false);
          setLoading(false);
          return;
        }
        setUsers(data || []);
        setAuthorized(true);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    load();
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

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <PageTitle title="Dashboard Founder" backTo="/home" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Utenti registrati</p>
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
          </div>

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
                      const plan = "starter"; // TODO: connect to real plan
                      const limit = planLimits[plan] || 10;
                      const created = u.studio_count + u.analysis_count;
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
                            <span className={`font-semibold ${created >= limit ? "text-destructive" : "text-foreground"}`}>
                              {created}
                            </span>
                            <span className="text-muted-foreground">/{limit}</span>
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
