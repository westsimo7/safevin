import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_MESSAGES = [
  "Analizzando qualità visiva…",
  "Rilevando dettagli critici…",
  "Incrociando dati di sicurezza…",
  "Calcolando punteggio reale…",
  "Ottimizzando suggerimenti…",
];

const DEEP_MESSAGE =
  "Sto ragionando in modo approfondito per offrirti un risultato iper dettagliato e ottimizzato.";

interface SmartLoaderProps {
  title?: string;
  messages?: string[];
}

const SmartLoader = ({ title, messages = DEFAULT_MESSAGES }: SmartLoaderProps) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    const timeout = setTimeout(() => setDeep(true), 25000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [messages]);

  return (
    <Card className="border-border/50 animate-fade-in">
      <CardContent className="py-16 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {title && <p className="font-semibold text-center">{title}</p>}

        <p
          key={deep ? "deep" : msgIndex}
          className="text-sm text-muted-foreground text-center max-w-sm min-h-[40px] animate-fade-in"
        >
          {deep ? DEEP_MESSAGE : messages[msgIndex]}
        </p>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 300}ms` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartLoader;
