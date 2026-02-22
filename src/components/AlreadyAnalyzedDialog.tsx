import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown } from "lucide-react";

interface AlreadyAnalyzedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
}

const AlreadyAnalyzedDialog = ({ open, onOpenChange, onUpgrade }: AlreadyAnalyzedDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">Annuncio già analizzato</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Questo annuncio ha già un SafeScore™ attivo.
            <br />
            <span className="text-foreground font-medium">
              Passa a Expert per sbloccare l'analisi multi-pattern avanzata e correzioni personalizzate.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="sm:flex-1">Chiudi</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onUpgrade}
            className="sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Passa a Expert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlreadyAnalyzedDialog;
