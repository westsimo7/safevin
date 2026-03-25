import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, RefreshCw } from "lucide-react";

interface AlreadyAnalyzedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseCached: () => void;
  onReanalyze: () => void;
}

const AlreadyAnalyzedDialog = ({ open, onOpenChange, onUseCached, onReanalyze }: AlreadyAnalyzedDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="border-border bg-card">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Annuncio già analizzato
        </AlertDialogTitle>
        <AlertDialogDescription>
          Questo annuncio è identico a uno già analizzato in precedenza. Vuoi vedere il risultato precedente o rianalizzarlo da zero?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onUseCached}>
          <History className="w-4 h-4 mr-1.5" />
          Usa risultato precedente
        </AlertDialogCancel>
        <AlertDialogAction onClick={onReanalyze}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Rianalizza
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AlreadyAnalyzedDialog;
