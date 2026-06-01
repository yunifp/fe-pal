import { useMemo, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, BookOpen, BarChart2 } from "lucide-react";
import { beasiswaService } from "@/services/beasiswaService";

type PilihanItem = {
  perguruan_tinggi?: string;
  program_studi?: string;
};

type Props = {
  allPilihan: PilihanItem[];
};

const RANK_STYLE = [
  { circle: "bg-purple-100 text-purple-800", bar: "bg-purple-400" },
  { circle: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
  { circle: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
];

const PilihanSummaryCard: FC<Props> = ({ allPilihan }) => {
  const selectedPtIds = useMemo(() => {
    const ids = new Set<number>();
    allPilihan.forEach((p) => {
      const ptId = Number((p.perguruan_tinggi ?? "").split("#")[0]);
      const prodiId = Number((p.program_studi ?? "").split("#")[0]);
      if (ptId && prodiId) ids.add(ptId);
    });
    // ✅ Batasi maksimal 3 — sesuai jumlah yang akan ditampilkan
    return [...ids].slice(0, 3);
  }, [allPilihan]);

  const selectedProdiIds = useMemo(() => {
    const ids = new Set<number>();
    allPilihan.forEach((p) => {
      const ptId = Number((p.perguruan_tinggi ?? "").split("#")[0]);
      const prodiId = Number((p.program_studi ?? "").split("#")[0]);
      if (ptId && prodiId) ids.add(prodiId);
    });
    // ✅ Batasi maksimal 3
    return [...ids].slice(0, 3);
  }, [allPilihan]);

  const hasSelection = selectedPtIds.length > 0 || selectedProdiIds.length > 0;

  const { data, isLoading } = useQuery({
    queryKey: ["count-pt-prodi", selectedPtIds, selectedProdiIds],
    queryFn: () =>
      beasiswaService.getCountPtAndProdi({
        id_pt: selectedPtIds,
        id_prodi: selectedProdiIds,
      }),
    enabled: hasSelection,
    staleTime: 60 * 1000, // 1 menit — cukup fresh tanpa terlalu sering hit server
    refetchOnWindowFocus: false,
  });

  if (!hasSelection) return null;

  const topPT = data?.data?.top_pt ?? [];
  const topProdi = data?.data?.top_prodi ?? [];
  const maxPT = Number(topPT[0]?.jumlah ?? 1);
  const maxProdi = Number(topProdi[0]?.jumlah ?? 1);

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <BarChart2 className="w-4 h-4" />
        <span className="text-xs">
          Jumlah peminat dari seluruh peserta berdasarkan pilihan Anda
        </span>
      </div>

      {/* Top PT */}
      <Card className="shadow-none">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Perguruan tinggi dipilih
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[
                ...Array(selectedPtIds.length > 3 ? 3 : selectedPtIds.length),
              ].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : topPT.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada data.</p>
          ) : (
            <div className="divide-y divide-border">
              {topPT.map((pt, i) => {
                const pct = Math.round((Number(pt.jumlah) / maxPT) * 100);
                return (
                  <div
                    key={pt.id_pt}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${RANK_STYLE[i].circle}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm truncate">{pt.nama_pt}</p>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${RANK_STYLE[i].bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums flex-shrink-0">
                      {Number(pt.jumlah).toLocaleString("id-ID")} peserta
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Prodi */}
      <Card className="shadow-none">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Program studi dipilih</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[
                ...Array(
                  selectedProdiIds.length > 3 ? 3 : selectedProdiIds.length,
                ),
              ].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : topProdi.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada data.</p>
          ) : (
            <div className="divide-y divide-border">
              {topProdi.map((prodi, i) => {
                const pct = Math.round((Number(prodi.jumlah) / maxProdi) * 100);
                return (
                  <div
                    key={`${prodi.id_prodi}-${prodi.id_pt}`}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${RANK_STYLE[i].circle}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm truncate">{prodi.nama_prodi}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {prodi.nama_pt}
                      </p>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${RANK_STYLE[i].bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium tabular-nums flex-shrink-0">
                      {Number(prodi.jumlah).toLocaleString("id-ID")} peserta
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { PilihanSummaryCard };
