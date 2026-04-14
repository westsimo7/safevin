import { useState, useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import CreativeDirectorChat from "@/components/CreativeDirectorChat";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ArtistDirector = () => {
  useSwipeBack("/home");
  const { user } = useAuth();
  const [completedCampaigns, setCompletedCampaigns] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Count completed campaigns
      const { count } = await supabase
        .from("creative_director_conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed");
      setCompletedCampaigns(count || 0);

      // Get plan to determine total allowed
      const { data: credits } = await supabase
        .from("user_credits")
        .select("plan_type, credits_total")
        .eq("user_id", user.id)
        .order("period_start", { ascending: false })
        .limit(1);

      if (credits && credits.length > 0) {
        const plan = credits[0].plan_type;
        setTotalCampaigns(plan === "expert" ? 6 : plan === "pro" ? 2 : 0);
      } else {
        setTotalCampaigns(0);
      }
    };
    load();
  }, [user]);

  const remaining = Math.max(0, totalCampaigns - completedCampaigns);

  const info = [
    { label: "Foto per campagna", value: "Max 8", icon: Camera, color: "text-primary" },
    { label: "Revisioni incluse", value: "1", icon: RefreshCw, color: "text-amber-500" },
    { label: "Campagne rimanenti", value: `${remaining} / ${totalCampaigns}`, icon: Palette, color: "text-green-500" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Artist Director" backTo="/home" />

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {info.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <p className="text-sm font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <CreativeDirectorChat />
        </div>
      </main>
    </div>
  );
};

export default ArtistDirector;
