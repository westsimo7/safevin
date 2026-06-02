import { Shield } from "lucide-react";
import PageTitle from "@/components/PageTitle";
import LandingNavbar from "@/components/LandingNavbar";

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

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <div className="container mx-auto px-5 sm:px-6 max-w-3xl py-6 sm:py-10 space-y-6">
        <PageTitle title="Privacy Policy" backTo="/" />
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-poppins">
              Privacy Policy – SAFEViN
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Ultimo aggiornamento: 23 Aprile 2026</p>
          </div>
        </div>

        <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
          SafeVin rispetta la tua privacy e si impegna a proteggere i tuoi dati personali. Questa
          informativa descrive come vengono raccolti, utilizzati e protetti i dati degli utenti che
          utilizzano il servizio.
        </p>

        <Section title="1. Titolare del trattamento">
          <p>Il titolare del trattamento dei dati è:</p>
          <p>
            <strong className="text-foreground">SafeVin</strong>
            <br />
            Email di contatto: <a href="mailto:safevinengine@gmail.com" className="text-primary hover:underline">safevinengine@gmail.com</a>
          </p>
        </Section>

        <Section title="2. Dati raccolti">
          <p>Durante l'utilizzo del servizio possiamo raccogliere:</p>
          <ul className="space-y-1.5">
            <Bullet>Dati di registrazione (email, username, password)</Bullet>
            <Bullet>Dati forniti volontariamente (immagini caricate, descrizioni prodotti, input testuali)</Bullet>
            <Bullet>Dati tecnici (indirizzo IP, dispositivo, browser, log di utilizzo)</Bullet>
            <Bullet>Dati relativi all'utilizzo del servizio (analisi, risultati generati, storico attività)</Bullet>
          </ul>
        </Section>

        <Section title="3. Finalità del trattamento">
          <p>I dati vengono utilizzati per:</p>
          <ul className="space-y-1.5">
            <Bullet>Fornire e migliorare il servizio SafeVin</Bullet>
            <Bullet>Generare analisi e contenuti tramite intelligenza artificiale</Bullet>
            <Bullet>Gestire account e accessi</Bullet>
            <Bullet>Garantire sicurezza e prevenire abusi</Bullet>
            <Bullet>Comunicazioni di servizio (non spam)</Bullet>
          </ul>
        </Section>

        <Section title="4. Base giuridica">
          <p>Il trattamento dei dati si basa su:</p>
          <ul className="space-y-1.5">
            <Bullet>Esecuzione del servizio richiesto dall'utente</Bullet>
            <Bullet>Consenso dell'utente</Bullet>
            <Bullet>Legittimo interesse (miglioramento e sicurezza della piattaforma)</Bullet>
          </ul>
        </Section>

        <Section title="5. Utilizzo dell'intelligenza artificiale">
          <p>
            SafeVin utilizza sistemi di intelligenza artificiale per analizzare immagini e testi e
            generare contenuti ottimizzati.
          </p>
          <p>
            I dati inseriti possono essere elaborati da servizi AI di terze parti esclusivamente per
            fornire il servizio richiesto.
          </p>
        </Section>

        <Section title="6. Conservazione dei dati">
          <p>I dati vengono conservati:</p>
          <ul className="space-y-1.5">
            <Bullet>Finché l'account è attivo</Bullet>
            <Bullet>Per il tempo necessario a fornire il servizio</Bullet>
            <Bullet>Fino a richiesta di cancellazione da parte dell'utente</Bullet>
          </ul>
        </Section>

        <Section title="7. Condivisione dei dati">
          <p>I dati non vengono venduti.</p>
          <p>Possono essere condivisi con le seguenti categorie di destinatari:</p>
          <ul className="space-y-1.5">
            <Bullet>
              <strong className="text-foreground">Stripe Payments Europe, Ltd.</strong> — processore dei pagamenti per la gestione di abbonamenti, transazioni una tantum, fatturazione, conformità fiscale e gestione rimborsi. Stripe può trattare i dati come autonomo titolare per finalità di prevenzione frodi e adempimenti fiscali.
            </Bullet>
            <Bullet>Fornitori tecnici di hosting, infrastruttura cloud e servizi di intelligenza artificiale (sub-responsabili del trattamento)</Bullet>
            <Bullet>Consulenti professionali (legali, fiscali, contabili) ove necessario</Bullet>
            <Bullet>Autorità competenti, ove richiesto dalla legge</Bullet>
          </ul>
        </Section>

        <Section title="8. Sicurezza">
          <p>
            Adottiamo misure tecniche e organizzative per proteggere i dati da accessi non
            autorizzati, perdita o uso improprio.
          </p>
        </Section>

        <Section title="9. Diritti dell'utente">
          <p>L'utente può in qualsiasi momento:</p>
          <ul className="space-y-1.5">
            <Bullet>Richiedere accesso ai propri dati</Bullet>
            <Bullet>Chiedere modifica o cancellazione</Bullet>
            <Bullet>Opporsi al trattamento</Bullet>
            <Bullet>Richiedere la portabilità dei dati</Bullet>
          </ul>
          <p>
            Per esercitare i diritti:{" "}
            <a href="mailto:safevinengine@gmail.com" className="text-primary hover:underline">
              safevinengine@gmail.com
            </a>
          </p>
        </Section>

        <Section title="10. Cookie">
          <p>
            SafeVin utilizza cookie tecnici e, se presenti, cookie analitici per migliorare
            l'esperienza utente.
          </p>
          <p>Per maggiori dettagli consulta la Cookie Policy.</p>
        </Section>

        <Section title="11. Modifiche">
          <p>
            SafeVin si riserva il diritto di modificare questa informativa. Le modifiche verranno
            pubblicate su questa pagina.
          </p>
        </Section>
      </div>
    </main>
  );
};

export default Privacy;
