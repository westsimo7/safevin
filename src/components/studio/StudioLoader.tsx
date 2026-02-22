import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const StudioLoader = ({ message }: { message: string }) => {
  return (
    <Card className="border-border/50 animate-fade-in">
      <CardContent className="py-16 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-semibold">{message}</p>
          <p className="text-sm text-muted-foreground">
            L'intelligenza artificiale sta lavorando per te.
          </p>
        </div>
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

export default StudioLoader;
