import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Inbox, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FreeListingEmailPopup = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const handleConfirm = async () => {
    if (!user?.email) {
      onOpenChange(false);
      return;
    }
    setSending(true);
    try {
      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      const name =
        (meta.full_name as string) ||
        (meta.name as string) ||
        (meta.first_name as string) ||
        (user.email?.split("@")[0] ?? "");

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "first-listing-generated",
          recipientEmail: user.email,
          idempotencyKey: `free-listing-available-${user.id}`,
          templateData: { name: String(name).split(" ")[0] },
        },
      });
      toast({
        title: "Email inviata",
        description: "Controlla la tua casella postale (anche spam).",
      });
    } catch (e) {
      console.error("send free-listing email failed", e);
    } finally {
      setSending(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30 bg-background">
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Annuncio gratis
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground leading-tight font-[Poppins]">
            Il tuo annuncio gratis è in arrivo
          </DialogTitle>
          <DialogDescription className="text-sm text-foreground/75 mt-2 leading-relaxed">
            Ti spediamo subito un'email con il tuo annuncio prova SAFEViN.
            Controlla la casella postale (anche la cartella <span className="font-semibold">spam</span>).
          </DialogDescription>
        </div>

        <div className="px-6 pb-2">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Inbox className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Apri la tua email</p>
              <p className="text-[11px] text-muted-foreground">L'invio parte appena confermi qui sotto.</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 space-y-2">
          <Button
            onClick={handleConfirm}
            disabled={sending}
            variant="neon"
            size="lg"
            className="w-full h-12 text-base"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            {sending ? "Invio…" : "Ho capito, inviamela"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreeListingEmailPopup;
