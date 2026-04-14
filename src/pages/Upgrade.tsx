import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import UpgradeChat from "@/components/UpgradeChat";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Truck } from "lucide-react";

const Upgrade = () => {
  useSwipeBack("/home");

  const commissions = [
    { label: "Commissioni ricevute", value: "0.00", icon: ArrowDownCircle, color: "text-green-500" },
    { label: "Commissioni ritirate", value: "0.00", icon: ArrowUpCircle, color: "text-primary" },
    { label: "Commissioni in transito", value: "0.00", icon: Truck, color: "text-amber-500" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Upgrade" backTo="/home" />
          <UpgradeChat />

          {/* Commissioni */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground mb-3">Commissioni</h3>
            <div className="grid grid-cols-3 gap-3">
              {commissions.map((c) => (
                <Card key={c.label}>
                  <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                    <p className="text-lg font-bold text-foreground">€{c.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{c.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
