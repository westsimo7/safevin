import { useEffect, useMemo, useState, useCallback } from "react";
import AppNavbar from "@/components/AppNavbar";
import PageTitle from "@/components/PageTitle";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingBag,
  Mail,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminListing {
  id: string;
  user_id: string;
  email: string;
  nome: string;
  cognome: string;
  titolo_generato: string | null;
  categoria: string;
  first_image_url: string | null;
  status: string;
  origin: string;
  created_at: string;
  plan: string;
}

const PER_PAGE = 20;

const AdminListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSwipeBack("/admin");
  const [items, setItems] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.ceil(total / PER_PAGE), [total]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    const searchTerm = search.trim() || null;

    try {
      const [{ data: rows, error: rowsErr }, { data: countData, error: countErr }] =
        await Promise.all([
          supabase.rpc("get_all_studio_creations_admin", {
            p_limit: PER_PAGE,
            p_offset: offset,
            p_search: searchTerm,
          }),
          supabase.rpc("count_all_studio_creations_admin", {
            p_search: searchTerm,
          }),
        ]);

      if (rowsErr || countErr) {
        console.error(rowsErr, countErr);
        setAuthorized(false);
      } else {
        setAuthorized(true);
        setItems((rows as AdminListing[]) || []);
        setTotal(countData || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [user, page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page 1 quando cambia la ricerca
  useEffect(() => {
    setPage(1);
  }, [search]);

  const formatDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  if (loading && items.length === 0) {
    return (
      <div className="h-full flex flex-col bg-background">
        <AppNavbar />
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          Caricamento…
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="h-full flex flex-col bg-background">
        <AppNavbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Accesso riservato al Founder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        <PageTitle title="Annunci utenti" backTo="/admin" />

        <div className="flex items-center justify-between mb-4 mt-2">
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-600 bg-amber-500/5"
          >
            <ShoppingBag className="w-3 h-3 mr-1" /> {total} annunci
          </Badge>
          {totalPages > 1 && (
            <span className="text-xs text-muted-foreground">
              Pagina {page} di {totalPages}
            </span>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per titolo, email, utente o categoria…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Nessun annuncio trovato.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/storico/studio/${item.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-card/80 text-left transition-all"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                    {item.first_image_url ? (
                      <img
                        src={item.first_image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate text-foreground">
                      {item.titolo_generato || "Senza titolo"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.email || "—"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      {(item.nome || item.cognome)
                        ? `${item.nome} ${item.cognome}`.trim() + " · "
                        : ""}
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {item.categoria || "—"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase tracking-wider ${
                        item.plan === "free"
                          ? "border-muted-foreground/30 text-muted-foreground"
                          : "border-primary/40 text-primary"
                      }`}
                    >
                      {item.plan}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-border/50 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "border border-border/50 hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-border/50 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminListings;

