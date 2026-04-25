import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage?.startsWith("en") ? "en" : "it";

  const change = (code: "it" | "en") => {
    i18n.changeLanguage(code);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={t("lang.label")}
          className="h-9 px-2.5 rounded-full bg-muted/50 border border-border/50 flex items-center gap-1.5 hover:bg-muted transition-colors"
        >
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase text-foreground">{current}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="end">
        {LANGS.map((l) => {
          const active = current === l.code;
          return (
            <button
              key={l.code}
              onClick={() => change(l.code as "it" | "en")}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm transition-colors",
                active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"
              )}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1 text-left">{l.label}</span>
              {active && <Check className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
