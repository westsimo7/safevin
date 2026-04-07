import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import measureWidth from "@/assets/measure-width.png";
import measureLength from "@/assets/measure-length.png";

interface MeasurementGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MeasurementGuideDialog = ({ open, onOpenChange }: MeasurementGuideDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Come misurare il tuo articolo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Disponi l'articolo su una superficie piana.
          </p>

          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-semibold">Ampiezza delle spalle:</span>{" "}
              misura dalla cucitura di una spalla all'altra sul lato posteriore dell'articolo.
            </li>
            <li>
              <span className="font-semibold">Lunghezza:</span>{" "}
              misura dalla parte superiore della scollatura fino all'orlo inferiore.
            </li>
          </ul>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="rounded-xl border border-border/50 p-3 bg-muted/10">
                <img
                  src={measureWidth}
                  alt="Ampiezza delle spalle"
                  className="w-full h-auto"
                  loading="lazy"
                  width={512}
                  height={512}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Ampiezza delle spalle</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-xl border border-border/50 p-3 bg-muted/10">
                <img
                  src={measureLength}
                  alt="Lunghezza"
                  className="w-full h-auto"
                  loading="lazy"
                  width={512}
                  height={512}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Lunghezza</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="neon" className="w-full" onClick={() => onOpenChange(false)}>
            Fatto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeasurementGuideDialog;
