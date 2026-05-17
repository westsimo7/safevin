import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    try { window.history.back(); } catch {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background text-foreground">
          <div className="max-w-md text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Qualcosa è andato storto</h1>
            <p className="text-sm text-muted-foreground">
              Si è verificato un errore inatteso. Prova a tornare indietro o ricaricare la pagina.
              Se hai caricato una foto da iPhone in formato HEIC, riprova convertendola in JPEG dalle impostazioni della fotocamera.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={this.handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Indietro
              </Button>
              <Button onClick={() => window.location.reload()}>Ricarica</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
