import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "scarpe", label: "Scarpe", emoji: "👟" },
  { id: "maglie", label: "Maglie e T-shirt", emoji: "👕" },
  { id: "felpe", label: "Felpe e Hoodie", emoji: "🧥" },
  { id: "giacche", label: "Giacche e Cappotti", emoji: "🧥" },
  { id: "pantaloni", label: "Pantaloni e Jeans", emoji: "👖" },
  { id: "camicie", label: "Camicie", emoji: "👔" },
  { id: "vestiti", label: "Vestiti e Abiti", emoji: "👗" },
  { id: "gonne", label: "Gonne", emoji: "🩱" },
  { id: "intimo", label: "Intimo e Pigiama", emoji: "🩲" },
  { id: "costumi", label: "Costumi da bagno", emoji: "👙" },
  { id: "borse", label: "Borse e Zaini", emoji: "👜" },
  { id: "portafogli", label: "Portafogli", emoji: "👛" },
  { id: "accessori", label: "Accessori (cinture, sciarpe...)", emoji: "🧣" },
  { id: "orologi", label: "Orologi", emoji: "⌚" },
  { id: "gioielli", label: "Gioielli e Bigiotteria", emoji: "💍" },
  { id: "occhiali", label: "Occhiali da sole", emoji: "🕶️" },
  { id: "cappelli", label: "Cappelli e Berretti", emoji: "🧢" },
  { id: "elettronica", label: "Elettronica", emoji: "📱" },
  { id: "videogiochi", label: "Videogiochi e Console", emoji: "🎮" },
  { id: "libri", label: "Libri", emoji: "📚" },
  { id: "beauty", label: "Beauty e Cura personale", emoji: "💄" },
  { id: "casa", label: "Casa e Decorazione", emoji: "🏠" },
  { id: "bambini", label: "Bambini", emoji: "👶" },
  { id: "sport", label: "Sport e Tempo libero", emoji: "⚽" },
  { id: "animali", label: "Animali", emoji: "🐾" },
  { id: "altro", label: "Altro", emoji: "📦" },
];

interface CategorySelectorProps {
  onSelect: (category: string) => void;
  selected: string;
}

const CategorySelector = ({ onSelect, selected }: CategorySelectorProps) => {
  const [search, setSearch] = useState("");

  const filtered = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in overflow-hidden">
      <div className="flex-shrink-0 space-y-4 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          Cosa stai vendendo?
        </h2>
        <p className="text-muted-foreground text-sm">
          Seleziona la categoria per personalizzare l'intera esperienza.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map((cat) => (
            <Card
              key={cat.id}
              className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md active:scale-[0.98] ${
                selected === cat.id ? "border-primary shadow-md" : "border-border/50"
              }`}
              onClick={() => onSelect(cat.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-medium text-sm">{cat.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
