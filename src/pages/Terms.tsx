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
            SafeVin è una piattaforma digitale che utilizza intelligenza artificiale per supportare la creazione, analisi e ottimizzazione di annunci online.
          </p>
          <p>
            <strong className="text-foreground">Contatti</strong>
            <br />
            Email:{" "}
            <a href="mailto:info@safevin.com" className="text-primary hover:underline">
              info@safevin.com
            </a>
          </p>
          <p className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-foreground">
            <strong>Processore dei pagamenti:</strong> i pagamenti sono gestiti tramite <strong>Stripe</strong>, fornitore certificato per la gestione sicura delle transazioni. SafeVin gestisce direttamente l'assistenza relativa ad abbonamenti, acquisti e rimborsi secondo le condizioni descritte di seguito.
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
          <p>
            SafeVin offre piani gratuiti, piani in abbonamento e acquisti una tantum (es. pacchetti di annunci aggiuntivi). I pagamenti sono processati in modo sicuro tramite <strong className="text-foreground">Stripe</strong>.
          </p>
          <ul className="space-y-1.5">
            <Bullet>I prezzi sono indicati sulla piattaforma in Euro (€)</Bullet>
            <Bullet>Il pagamento è anticipato</Bullet>
            <Bullet>Gli abbonamenti sono ricorrenti e si rinnovano automaticamente alla scadenza del periodo</Bullet>
            <Bullet>Tasse e imposte sono applicate in base alla giurisdizione dell'utente</Bullet>
          </ul>
          <p>
            L'utente può cancellare l'abbonamento in qualsiasi momento dalla sezione "Abbonamento" del proprio account o contattando il supporto all'indirizzo{" "}
            <a href="mailto:info@safevin.com" className="text-primary hover:underline">
              info@safevin.com
            </a>.
          </p>
        </Section>

        <Section title="6. Politica di rimborso">
          <p>
            <strong className="text-foreground">Abbonamenti.</strong> Offriamo una garanzia di rimborso di <strong className="text-foreground">7 giorni</strong> dalla data dell'ordine (o del rinnovo) a condizione che <strong className="text-foreground">almeno il 90% dei benefit del piano non sia stato utilizzato</strong>. Per "benefit" si intendono, a titolo esemplificativo, gli annunci generati dallo Studio, le creazioni delegate all'Artist Director e le altre risorse incluse nel piano. Se l'utilizzo supera il 10% del totale, il rimborso non potrà essere concesso.
          </p>
          <p>
            <strong className="text-foreground">Acquisti una tantum (pacchetti annunci).</strong> Il rimborso può essere richiesto entro 14 giorni dall'acquisto <strong className="text-foreground">solo se nessuno degli annunci inclusi nel pacchetto è stato utilizzato</strong>. Una volta generato anche un solo annuncio del pacchetto, il pagamento non è più rimborsabile.
          </p>
          <p>
            <strong className="text-foreground">Come richiedere un rimborso:</strong> invia una richiesta a{" "}
            <a href="mailto:info@safevin.com" className="text-primary hover:underline">
              info@safevin.com
            </a>{" "}
            indicando l'email dell'account e il riferimento dell'ordine. Verificheremo i requisiti di utilizzo e, se idonei, processeremo il rimborso tramite Stripe entro pochi giorni lavorativi sul metodo di pagamento originale.
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
