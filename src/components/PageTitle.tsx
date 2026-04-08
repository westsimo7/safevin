import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageTitleProps {
  title: string | React.ReactNode;
  backTo?: string | (() => void);
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
}

const PageTitle = ({ title, backTo, subtitle, badge, className = "" }: PageTitleProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (!backTo) return;
    if (typeof backTo === "function") {
      backTo();
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className={`mb-4 md:mb-6 ${className}`}>
      {badge && <div className="flex justify-center mb-2 md:mb-3">{badge}</div>}
      <div className="flex items-center gap-1">
        {backTo && (
          <button
            onClick={handleBack}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors -ml-2"
            aria-label="Torna indietro"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5 ml-7">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;
