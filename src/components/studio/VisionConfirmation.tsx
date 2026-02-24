import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit3, Eye } from "lucide-react";

interface VisionConfirmationProps {
  visionReport: string;
  onConfirm: (confirmedProduct: string) => void;
}

const VisionConfirmation = ({ visionReport, onConfirm }: VisionConfirmationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState("");

  let productType = "Prodotto non identificato";
  let categoryGuess = "";
  try {
    const jsonMatch = visionReport.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      productType = parsed.productType || productType;
      categoryGuess = parsed.vintedCategoryGuess || "";
    }
  } catch {}

  const handleConfirm = () => {
    onConfirm(isEditing ? editedProduct : productType);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Prodotto identificato</h2>
        <p className="text-muted-foreground text-sm">
          Verifica che l'identificazione sia corretta prima di proseguire.
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <Eye className="w-10 h-10 text-primary mx-auto" />
          <div>
            <p className="text-lg font-bold">{productType}</p>
            {categoryGuess && (
              <p className="text-sm text-muted-foreground mt-1">{categoryGuess}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Inserisci il prodotto corretto:</p>
          <Input
            value={editedProduct}
            onChange={(e) => setEditedProduct(e.target.value)}
            placeholder="Es. Felpa con cappuccio Nike"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          variant="neon"
          size="lg"
          className="w-full"
          onClick={handleConfirm}
          disabled={isEditing && !editedProduct.trim()}
        >
          <Check className="w-4 h-4 mr-2" />
          {isEditing ? "Conferma correzione" : "Confermo, è corretto"}
        </Button>
        {!isEditing && (
          <Button
            variant="glass"
            className="w-full"
            onClick={() => {
              setIsEditing(true);
              setEditedProduct(productType);
            }}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Correggi categoria
          </Button>
        )}
      </div>
    </div>
  );
};

export default VisionConfirmation;
