import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import UpgradeChat from "@/components/UpgradeChat";

const Upgrade = () => {
  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Upgrade" backTo="/home" />
          <UpgradeChat />
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
