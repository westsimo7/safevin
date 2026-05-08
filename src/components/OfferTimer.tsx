import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const DURATION_MS = 10 * 60 * 1000;

const format = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface Props {
  className?: string;
  compact?: boolean;
}

const OfferTimer = ({ className = "", compact = false }: Props) => {
  const [endsAt] = useState(() => Date.now() + DURATION_MS);
  const [remaining, setRemaining] = useState(DURATION_MS);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-400 ${compact ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-xs"} font-semibold ${className}`}
    >
      <Flame className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="uppercase tracking-wider">Sconto limitato</span>
      <span className="font-mono font-bold text-orange-300 tabular-nums">{format(remaining)}</span>
    </div>
  );
};

export default OfferTimer;
