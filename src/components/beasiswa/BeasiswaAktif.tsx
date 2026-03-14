import { Card, CardContent } from "@/components/ui/card";
import type { IBeasiswa } from "@/types/beasiswa";
import { GraduationCap } from "lucide-react";
import { useState } from "react";

interface BeasiswaAktifProps {
  beasiswa: IBeasiswa | null;
}

const BeasiswaAktif = ({ beasiswa }: BeasiswaAktifProps) => {
  const [showMore, setShowMore] = useState<boolean>(false);

  if (!beasiswa) {
    return (
      <Card className="w-full shadow-none transition-all duration-300 border-t-4 border-t-primary">
        <CardContent className="px-8 py-6">
          <p className="text-center text-slate-600 font-medium">
            Tidak ada beasiswa yang sedang aktif
          </p>
        </CardContent>
      </Card>
    );
  }

  const MAX_LENGTH = 400;
  const isLongText = beasiswa.informasi.length > MAX_LENGTH;
  const displayedText = showMore
    ? beasiswa.informasi
    : beasiswa.informasi.slice(0, MAX_LENGTH) + (isLongText ? "..." : "");

  return (
    <Card className="w-full shadow-none transition-all duration-300 border-t-4 border-t-primary">
      <CardContent className="px-8 py-4">
        {/* Judul dengan Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary p-3 rounded-xl shadow-md">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {beasiswa.nama_beasiswa}
            </h2>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary mb-6" />

        {/* Informasi */}
        <div className="prose prose-slate max-w-none mb-3">
          <p className="text-slate-700 text-md leading-relaxed whitespace-pre-line">
            {displayedText}
            {isLongText && (
              <span
                className="text-primary px-0 hover:cursor-pointer"
                onClick={() => setShowMore(!showMore)}
              >
                {" "}
                {showMore ? "Sembunyikan" : "Lihat Selengkapnya"}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeasiswaAktif;
