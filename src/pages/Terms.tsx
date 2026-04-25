import { FileText } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import LandingNavbar from "@/components/LandingNavbar";
import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-base sm:text-lg font-semibold text-foreground font-poppins">{title}</h2>
    <div className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed space-y-2">
      {children}
    </div>
  </section>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2">
    <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const Terms = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <div className="container mx-auto px-5 sm:px-6 max-w-3xl py-6 sm:py-10 space-y-6">
        <PageTitle title="Termini e Condizioni" backTo="/" />

        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-poppins">
              Termini e Condizioni – SAFEViN
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Ultimo aggiornamento: 17 Aprile 2026</p>
          </div>
        </div>

        <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
          L'accesso e l'utilizzo del servizio SafeVin implicano l'accettazione dei presenti Termini
          e Condizioni.
        </p>

        <Section title="1. Informazioni generali">
          <p>
            SafeVin è una piattaforma digitale gestita da <strong className="text-foreground">Simone Piscitelli</strong> che utilizza intelligenza artificiale per supportare la creazione, analisi e ottimizzazione di annunci online.
          </p>
          <p>
            <strong className="text-foreground">Contatti</strong>
            <br />
            Titolare: Simone Piscitelli
            <br />
            Email:{" "}
            <a href="mailto:info@safevin.com" className="text-primary hover:underline">
              info@safevin.com
            </a>
          </p>
          <p className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-foreground">
            <strong>Merchant of Record:</strong> Il nostro processo di acquisto è gestito dal nostro rivenditore online <strong>Paddle.com</strong>. Paddle.com è il Merchant of Record (rivenditore ufficiale) per tutti i nostri ordini. Paddle gestisce tutte le richieste di assistenza relative ai pagamenti e gestisce i rimborsi.
          </p>
        </Section>

        <Section title="2. Oggetto del servizio">
          <p>SafeVin offre strumenti per:</p>
          <ul className="space-y-1.5">
            <Bullet>Analisi di annunci</Bullet>
            <Bullet>Generazione di titoli, descrizioni e contenuti</Bullet>
            <Bullet>Ottimizzazione delle performance di vendita</Bullet>
          </ul>
          <p>
            Il servizio è fornito "così com'è" e può essere aggiornato o modificato in qualsiasi
            momento.
          </p>
        </Section>

        <Section title="3. Account utente">
          <p>Per utilizzare il servizio è necessario creare un account.</p>
          <p>L'utente si impegna a:</p>
          <ul className="space-y-1.5">
            <Bullet>Fornire dati veritieri</Bullet>
            <Bullet>Mantenere riservate le credenziali</Bullet>
            <Bullet>Non utilizzare il servizio per attività illecite</Bullet>
          </ul>
        </Section>

        <Section title="4. Utilizzo del servizio">
          <p>L'utente accetta di:</p>
          <ul className="space-y-1.5">
            <Bullet>Utilizzare SafeVin in modo conforme alla legge</Bullet>
            <Bullet>Non abusare del sistema (spam, scraping, uso improprio)</Bullet>
            <Bullet>Non tentare di compromettere la sicurezza della piattaforma</Bullet>
          </ul>
          <p>
            SafeVin si riserva il diritto di sospendere o chiudere account in caso di violazioni.
          </p>
        </Section>

        <Section title="5. Abbonamenti e pagamenti">
          <p>SafeVin può offrire piani gratuiti e a pagamento.</p>
          <ul className="space-y-1.5">
            <Bullet>I prezzi sono indicati sulla piattaforma</Bullet>
            <Bullet>Il pagamento è anticipato</Bullet>
            <Bullet>Gli abbonamenti possono essere ricorrenti</Bullet>
          </ul>
          <p>L'utente può cancellare l'abbonamento in qualsiasi momento.</p>
        </Section>

        <Section title="6. Politica di rimborso">
          <p>
            Gli abbonamenti sono rimborsabili entro i primi <strong className="text-foreground">7 giorni</strong> dall'acquisto, a condizione che:
          </p>
          <ul className="space-y-1.5">
            <Bullet>
              Non sia stato utilizzato più del <strong className="text-foreground">20%</strong> del limite totale di annunci generabili previsto dal piano acquistato
            </Bullet>
          </ul>
          <p>Se tale soglia viene superata, il rimborso non sarà più disponibile.</p>
          <p>
            SafeVin si riserva il diritto di verificare l'utilizzo effettivo del servizio prima di
            approvare il rimborso.
          </p>
        </Section>

        <Section title="7. Limitazione di responsabilità">
          <p>SafeVin non garantisce risultati economici o vendite.</p>
          <p>L'utente è responsabile di:</p>
          <ul className="space-y-1.5">
            <Bullet>Prezzi applicati</Bullet>
            <Bullet>Contenuti pubblicati</Bullet>
            <Bullet>Performance degli annunci</Bullet>
          </ul>
          <p>SafeVin non è responsabile per:</p>
          <ul className="space-y-1.5">
            <Bullet>Perdite economiche</Bullet>
            <Bullet>Mancate vendite</Bullet>
            <Bullet>Decisioni basate sui contenuti generati</Bullet>
          </ul>
        </Section>

        <Section title="8. Proprietà intellettuale">
          <p>
            Tutti i contenuti della piattaforma (software, design, branding) sono di proprietà di
            SafeVin.
          </p>
          <p>
            L'utente mantiene i diritti sui contenuti caricati, ma concede a SafeVin il diritto di
            elaborarli per fornire il servizio.
          </p>
        </Section>

        <Section title="9. Interruzione del servizio">
          <p>SafeVin può:</p>
          <ul className="space-y-1.5">
            <Bullet>Modificare o sospendere il servizio</Bullet>
            <Bullet>Interrompere temporaneamente la piattaforma per manutenzione</Bullet>
          </ul>
        </Section>

        <Section title="10. Privacy">
          <p>
            Il trattamento dei dati è regolato dalla{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            disponibile sulla piattaforma.
          </p>
        </Section>

        <Section title="11. Modifiche ai termini">
          <p>
            SafeVin può aggiornare i presenti Termini in qualsiasi momento. Le modifiche saranno
            pubblicate su questa pagina.
          </p>
        </Section>

        <Section title="12. Legge applicabile">
          <p>I presenti Termini sono regolati dalla legge italiana.</p>
        </Section>
      </div>
    </main>
  );
};

export default Terms;
