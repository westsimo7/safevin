import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import CollaborationChat from "@/components/CollaborationChat";
import { useSwipeBack } from "@/hooks/useSwipeBack";

const Collaboration = () => {
  useSwipeBack("/home");

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pt-4 sm:pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <PageTitle title="Collaborazioni" backTo="/home" />
          <CollaborationChat />
        </div>
      </main>
    </div>
  );
};

export default Collaboration;
