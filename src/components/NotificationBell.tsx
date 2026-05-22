import { useState } from "react";
import { Bell, Megaphone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}g`;
}

const sourceIcon = (n: AppNotification) =>
  n.type === "announcement" ? Megaphone : MessageSquare;

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();

  const handleClick = async (n: AppNotification) => {
    if (!n.read_at) await markRead(n.id);
    setOpen(false);
    if (n.link) {
      if (n.link.startsWith("http")) window.location.href = n.link;
      else navigate(n.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifiche"
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <p className="text-sm font-bold">Notifiche</p>
          {unreadCount > 0 && (
            <button
              className="text-[11px] text-primary hover:underline"
              onClick={markAllRead}
            >
              Segna tutte lette
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-muted-foreground">
              Nessuna notifica
            </div>
          ) : (
            items.map((n) => {
              const Icon = sourceIcon(n);
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex gap-3 text-left px-4 py-3 border-b border-border/30 last:border-0 transition-colors ${
                    n.read_at ? "hover:bg-muted/40" : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${n.read_at ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${n.read_at ? "text-foreground/70" : "font-semibold"}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                  </div>
                  {!n.read_at && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
