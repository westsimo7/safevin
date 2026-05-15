import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Sparkles } from "lucide-react";

type Review = {
  name: string;
  avatar: string;
  location: string;
  rating: number;
  date: string;
  items: string;
  text: string;
  highlight: string;
};

const reviews: Review[] = [
  {
    name: "Chiara M.",
    avatar: "CM",
    location: "Milano",
    rating: 5,
    date: "2 giorni fa",
    items: "127 articoli venduti",
    text: "Finalmente qualcosa che funziona davvero. Prima ci mettevo tipo 10 minuti per ogni annuncio, ora in mezz'ora ne pubblico 15. La differenza è enorme.",
    highlight: "15 annunci in mezz'ora",
  },
  {
    name: "Giulia R.",
    avatar: "GR",
    location: "Roma",
    rating: 5,
    date: "5 giorni fa",
    items: "84 articoli venduti",
    text: "Ero scettica all'inizio perché avevo già provato altre cose simili e facevano schifo. Con SAFEViN ho già venduto 8 articoli in due settimane, prima ne vendevo 2-3 al mese.",
    highlight: "+40% di visite agli annunci",
  },
  {
    name: "Sara T.",
    avatar: "ST",
    location: "Torino",
    rating: 5,
    date: "1 settimana fa",
    items: "203 articoli venduti",
    text: "Vendo su Vinted da 3 anni e questa è la cosa più utile che ho trovato. Ho oltre 300 articoli e aggiornare le descrizioni era un incubo, ora uso SAFEViN per tutto.",
    highlight: "Titoli ottimizzati per la ricerca",
  },
  {
    name: "Francesca B.",
    avatar: "FB",
    location: "Napoli",
    rating: 4,
    date: "10 giorni fa",
    items: "56 articoli venduti",
    text: "Uso SAFEViN da due settimane e mi ha cambiato il modo di pubblicare. Risparmio davvero un sacco di tempo e gli annunci sembrano molto più professionali.",
    highlight: "Risparmio reale di tempo",
  },
  {
    name: "Valentina C.",
    avatar: "VC",
    location: "Firenze",
    rating: 5,
    date: "2 settimane fa",
    items: "341 articoli venduti",
    text: "Se vendi tanto su Vinted questo strumento è indispensabile. Ho oltre 300 articoli e da quando uso SAFEViN i messaggi delle clienti sono aumentati notevolmente.",
    highlight: "Indispensabile per chi vende tanto",
  },
  {
    name: "Laura P.",
    avatar: "LP",
    location: "Bologna",
    rating: 5,
    date: "3 settimane fa",
    items: "91 articoli venduti",
    text: "Ho iniziato a vendere da poco e non ero brava con le descrizioni. Con SAFEViN mi sento molto più sicura, so che l'annuncio è scritto bene. Già 8 articoli venduti in due settimane.",
    highlight: "Perfetto anche per i principianti",
  },
  {
    name: "Alessia N.",
    avatar: "AN",
    location: "Palermo",
    rating: 5,
    date: "1 mese fa",
    items: "178 articoli venduti",
    text: "Uso SAFEViN ogni volta che pubblico qualcosa di nuovo. La qualità delle descrizioni è altissima e capisce perfettamente il tono giusto per Vinted. Soddisfattissima.",
    highlight: "Tono perfetto per Vinted",
  },
  {
    name: "Martina L.",
    avatar: "ML",
    location: "Venezia",
    rating: 4,
    date: "1 mese fa",
    items: "62 articoli venduti",
    text: "Strumento molto utile e veloce. Mi piace che genera anche gli hashtag giusti, è una delle cose su cui perdevo più tempo. Interfaccia semplice e intuitiva.",
    highlight: "Hashtag generati automaticamente",
  },
  {
    name: "Elisa D.",
    avatar: "ED",
    location: "Genova",
    rating: 5,
    date: "6 settimane fa",
    items: "115 articoli venduti",
    text: "Ho convinto anche mia sorella a usarlo. Lei vende abbigliamento bambini, io capi vintage: le descrizioni vengono super professionali. Abbonamento che vale ogni centesimo.",
    highlight: "Ottimo per il vintage",
  },
  {
    name: "Monica F.",
    avatar: "MF",
    location: "Brescia",
    rating: 5,
    date: "2 mesi fa",
    items: "267 articoli venduti",
    text: "Prima di SAFEViN impiegavo 15-20 minuti per ogni annuncio e spesso rimandavo perché era noioso. Ora in 1 minuto ho tutto pronto. Ho pubblicato il doppio degli articoli questo mese.",
    highlight: "Da 20 min a 1 min per annuncio",
  },
];

const ReviewCard = ({ review, index }: { review: Review; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > 160;
  const displayText = isLong && !expanded ? review.text.slice(0, 155) + "…" : review.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      className="surface-soft rounded-2xl p-5 border border-border/40 hover:border-primary/40 transition-all duration-300 flex flex-col gap-3 text-left"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0 bg-gradient-to-br from-primary to-primary/70">
          {review.avatar}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-sm text-foreground truncate">{review.name}</span>
          <span className="text-[11px] text-muted-foreground">{review.location} · {review.date}</span>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-3.5 h-3.5"
              fill={i < review.rating ? "hsl(38 92% 50%)" : "transparent"}
              stroke="hsl(38 92% 50%)"
              strokeWidth={2}
            />
          ))}
        </div>
      </div>

      {/* Highlight */}
      <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[11px] font-semibold text-primary">{review.highlight}</span>
      </div>

      {/* Text */}
      <p className="text-sm text-foreground/85 leading-relaxed">
        "{displayText}"
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-primary font-semibold text-xs hover:underline"
          >
            {expanded ? "meno" : "leggi tutto"}
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs text-muted-foreground">{review.items}</span>
      </div>
    </motion.div>
  );
};

const ReviewsSection = () => {
  const avgRating = (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1);

  const stats = [
    { value: `${avgRating}/5`, label: "Valutazione media" },
    { value: "10+", label: "Recensioni verificate" },
    { value: "1.500+", label: "Articoli venduti" },
    { value: "98%", label: "Utenti soddisfatti" },
  ];

  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Recensioni verificate</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-black tracking-tight mb-3 leading-tight"
        >
          Cosa dicono i nostri <span className="text-primary">venditori</span>
        </motion.h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Persone reali che usano SAFEViN ogni giorno per vendere più velocemente su Vinted.
        </p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="surface-soft rounded-2xl border border-border/40 px-4 py-5 text-center"
          >
            <div className="text-2xl sm:text-3xl font-black text-primary mb-1">{stat.value}</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {reviews.map((review, i) => (
          <ReviewCard key={review.name} review={review} index={i} />
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
