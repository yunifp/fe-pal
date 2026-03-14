import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type IshiharaPlate = {
  id: number;
  image: string;
  answer: string;
};

export const ISHIHARA_PLATES: IshiharaPlate[] = [
  { id: 1, image: "/images/ishihara/ishihara-1.jpeg", answer: "15" },
  { id: 2, image: "/images/ishihara/ishihara-2.jpeg", answer: "2" },
  { id: 3, image: "/images/ishihara/ishihara-3.jpeg", answer: "42" },
  { id: 4, image: "/images/ishihara/ishihara-4.jpeg", answer: "97" },
  { id: 5, image: "/images/ishihara/ishihara-5.jpeg", answer: "16" },
];

type TesButaWarnaProps = {
  onResult: (result: "Y" | "N") => void;
};

export function TesButaWarna({ onResult }: TesButaWarnaProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const plate = ISHIHARA_PLATES[index];

  const handleNext = () => {
    if (index < ISHIHARA_PLATES.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      evaluateResult();
    }
  };

  const evaluateResult = () => {
    let correct = 0;

    ISHIHARA_PLATES.forEach((p, i) => {
      if (answers[i]?.trim() === p.answer) {
        correct++;
      }
    });

    // aturan hasil
    const result: "Y" | "N" = correct >= 4 ? "N" : "Y";
    onResult(result);
  };

  return (
    <div className="max-w-md mx-auto">
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 text-center">
          Tes Buta Warna ({index + 1} / {ISHIHARA_PLATES.length})
        </p>

        <img
          src={plate.image}
          alt="Tes Buta Warna"
          className="mx-auto w-56 h-56 object-contain"
          loading="lazy"
        />

        <Input
          placeholder="Angka yang kamu lihat"
          value={answers[index] || ""}
          onChange={(e) => {
            const copy = [...answers];
            copy[index] = e.target.value;
            setAnswers(copy);
          }}
        />

        <Button className="w-full" onClick={handleNext}>
          {index === ISHIHARA_PLATES.length - 1 ? "Selesai" : "Lanjut"}
        </Button>
      </CardContent>
    </div>
  );
}
