import { Cookie } from "lucide-react";
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

const SubBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4 space-y-2">
    <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const handleOpenCookieBanner = () => {
  localStorage.removeItem("safevin-cookie-consent");
  window.dispatchEvent(new Event("safevin-cookie-reset"));
};

const Cookies = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <LandingNavbar />
      <div className="container mx-auto px-5 sm:px-6 max-w-3xl py-6 sm:py-10 space-y-6">
        <PageTitle title="Cookie Policy" backTo="/" />

        <div className="flex items-center gap-2.5">
          <Cookie className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground font-poppins">
              Cookie Policy – SAFEViN
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Ultimo aggiornamento: 17 Aprile 2026</p>
          </div>
        </div>

        <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
          Questa Cookie Policy spiega cosa sono i cookie e come vengono utilizzati su SafeVin.
        </p>

        <Section title="1. Cosa sono i cookie">
          <p>
            I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente
            per migliorare l'esperienza di navigazione.
          </p>
        </Section>

        <Section title="2. Tipi di cookie utilizzati">
          <p>SafeVin utilizza le seguenti tipologie di cookie:</p>

          <SubBlock title="🔹 Cookie tecnici (necessari)">
            <p>Essenziali per il funzionamento della piattaforma.</p>
            <p className="text-foreground/80">Esempi:</p>
            <ul className="space-y-1.5">
              <Bullet>Accesso e autenticazione</Bullet>
              <Bullet>Salvataggio sessione utente</Bullet>
              <Bullet>Sicurezza del servizio</Bullet>
            </ul>
            <p className="text-xs text-foreground/70">👉 Questi cookie non richiedono consenso.</p>
          </SubBlock>

          <SubBlock title="🔹 Cookie analitici (eventuali)">
            <p>
              Utilizzati per raccogliere informazioni in forma aggregata su come viene utilizzato
              il sito.
            </p>
            <p className="text-foreground/80">Esempi:</p>
            <ul className="space-y-1.5">
              <Bullet>Pagine visitate</Bullet>
              <Bullet>Tempo di permanenza</Bullet>
              <Bullet>Interazioni con il servizio</Bullet>
            </ul>
            <p className="text-xs text-foreground/70">👉 Possono essere anonimizzati.</p>
          </SubBlock>

          <SubBlock title="🔹 Cookie di terze parti (se presenti)">
            <p>Alcuni servizi esterni possono installare cookie.</p>
            <p className="text-foreground/80">Possibili fornitori:</p>
            <ul className="space-y-1.5">
              <Bullet>Servizi di pagamento (es. Stripe)</Bullet>
              <Bullet>Servizi di analisi</Bullet>
              <Bullet>Servizi di intelligenza artificiale</Bullet>
            </ul>
          </SubBlock>
        </Section>

        <Section title="3. Finalità dei cookie">
          <p>I cookie vengono utilizzati per:</p>
          <ul className="space-y-1.5">
            <Bullet>Garantire il corretto funzionamento del sito</Bullet>
            <Bullet>Migliorare l'esperienza utente</Bullet>
            <Bullet>Analizzare l'utilizzo della piattaforma</Bullet>
            <Bullet>Ottimizzare le performance del servizio</Bullet>
          </ul>
        </Section>

        <Section title="4. Gestione del consenso">
          <p>
            Al primo accesso, l'utente può accettare o rifiutare i cookie non necessari tramite il
            banner.
          </p>
          <p>L'utente può modificare le preferenze in qualsiasi momento.</p>
          <button
            onClick={handleOpenCookieBanner}
            className="mt-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Cookie className="w-4 h-4" />
            Modifica preferenze cookie
          </button>
        </Section>

        <Section title="5. Disabilitazione dei cookie">
          <p>È possibile gestire o disabilitare i cookie direttamente dal browser:</p>
          <ul className="space-y-1.5">
            <Bullet>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Chrome</a>
            </Bullet>
            <Bullet>
              <a href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie" target="_blank" rel="noreferrer" className="text-primary hover:underline">Mozilla Firefox</a>
            </Bullet>
            <Bullet>
              <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-primary hover:underline">Safari</a>
            </Bullet>
            <Bullet>
              <a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noreferrer" className="text-primary hover:underline">Microsoft Edge</a>
            </Bullet>
          </ul>
          <p className="text-xs text-foreground/70">
            La disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento del sito.
          </p>
        </Section>

        <Section title="6. Conservazione dei cookie">
          <p>I cookie possono essere:</p>
          <ul className="space-y-1.5">
            <Bullet><strong className="text-foreground">Sessione</strong> → cancellati alla chiusura del browser</Bullet>
            <Bullet><strong className="text-foreground">Persistenti</strong> → rimangono per un periodo definito</Bullet>
          </ul>
        </Section>

        <Section title="7. Modifiche alla Cookie Policy">
          <p>
            SafeVin si riserva il diritto di aggiornare questa policy in qualsiasi momento. Le
            modifiche saranno pubblicate su questa pagina.
          </p>
        </Section>
      </div>
    </main>
  );
};

export default Cookies;
