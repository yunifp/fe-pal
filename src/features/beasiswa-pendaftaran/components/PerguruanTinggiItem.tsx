import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { Card, CardContent } from "@/components/ui/card";
import { masterService } from "@/services/masterService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, type FC } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { GraduationCap, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  kondisiButaWarna: string;
  index: number;
  control: Control<any>;
  remove: (index: number) => void;
  perguruanTinggiOptions: { value: string; label: string }[];
  setValue: UseFormSetValue<any>;
  /**
   * True saat parent sedang melakukan populate data existing (load edit mode).
   * Selama ini, jangan reset program_studi meski options belum tersedia.
   */
  isPopulating?: boolean;
  isEmpty?: boolean;
};

export const PerguruanTinggiItem: FC<Props> = ({
  kondisiButaWarna,
  index,
  control,
  perguruanTinggiOptions,
  setValue,
  isPopulating = false,
  isEmpty = false,
}) => {
  // ============================
  // WATCH
  // ============================

  const selectedPT = useWatch({
    control,
    name: `pilihan_program_studi.${index}.perguruan_tinggi`,
  });

  const selectedProdiValue = useWatch({
    control,
    name: `pilihan_program_studi.${index}.program_studi`,
  });

  const selectedJurusanSekolahRaw = useWatch({
    control,
    name: "jurusan_sekolah",
  });

  const selectedJurusanSekolah = selectedJurusanSekolahRaw?.split("#")[0];
  const idPt = selectedPT?.split("#")[0];

  // ============================
  // REFS — track state tanpa trigger re-render
  // ============================

  /**
   * Apakah filteredProdiOptions sudah pernah berhasil di-load
   * untuk idPt yang sedang aktif.
   * Direset setiap kali idPt berubah.
   */
  const isProdiLoadedRef = useRef(false);
  const prevIdPtRef = useRef<string | undefined>(undefined);

  // Reset flag saat PT berubah
  useEffect(() => {
    if (prevIdPtRef.current !== idPt) {
      isProdiLoadedRef.current = false;
      prevIdPtRef.current = idPt;
    }
  }, [idPt]);

  // ============================
  // FETCH PRODI
  // ============================

  const { data: responseProdi, isFetching: isFetchingProdi } = useQuery({
    queryKey: ["program-studi", idPt, kondisiButaWarna],
    queryFn: () =>
      masterService.getProgramStudiByJurusanSekolahDanPT(
        selectedJurusanSekolah,
        idPt,
      ),
    enabled: !!idPt && !!selectedJurusanSekolah,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ============================
  // PRODI OPTIONS
  // ============================

  const filteredProdiOptions = useMemo(() => {
    if (!responseProdi?.data) return [];

    let list = responseProdi.data;

    if (kondisiButaWarna === "Y") {
      list = list.filter((ps) => ps.boleh_buta_warna === "Y");
    }

    return list.map((ps) => ({
      value: `${ps.id_prodi}#${ps.nama_prodi}`,
      label: ps.nama_prodi,
      kuota: ps.kuota,
    }));
  }, [responseProdi, kondisiButaWarna]);

  // Mark prodi sebagai "sudah loaded" setelah fetch selesai dan ada data
  useEffect(() => {
    if (!isFetchingProdi && filteredProdiOptions.length > 0) {
      isProdiLoadedRef.current = true;
    }
  }, [isFetchingProdi, filteredProdiOptions]);

  // ============================
  // SELECTED PRODI DETAIL
  // ============================

  const selectedProdi = useMemo(() => {
    if (!filteredProdiOptions.length || !selectedProdiValue) return null;
    return filteredProdiOptions.find((p) => p.value === selectedProdiValue);
  }, [filteredProdiOptions, selectedProdiValue]);

  // ============================
  // RESET PRODI — hanya jika PT berubah & prodi tidak valid
  // Guard berlapis agar tidak reset saat:
  //   1. Masih fetching
  //   2. Prodi belum pernah di-load untuk PT ini (initial populate)
  //   3. Parent sedang populating data existing
  //   4. Nilai prodi sudah kosong (tidak perlu reset ulang)
  // ============================

  useEffect(() => {
    if (isFetchingProdi) return;
    if (!isProdiLoadedRef.current) return; // belum selesai load pertama kali
    if (isPopulating) return; // parent sedang populate, jangan sentuh
    if (!selectedProdiValue) return; // sudah kosong, tidak perlu reset

    const stillValid = filteredProdiOptions.some(
      (opt) => opt.value === selectedProdiValue,
    );

    if (!stillValid) {
      setValue(`pilihan_program_studi.${index}.program_studi`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [
    filteredProdiOptions,
    selectedProdiValue,
    isFetchingProdi,
    isPopulating,
    index,
    setValue,
  ]);

  // ============================
  // HANDLER RESET
  // ============================

  const handleReset = () => {
    setValue(`pilihan_program_studi.${index}.perguruan_tinggi`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`pilihan_program_studi.${index}.program_studi`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Row dianggap terisi jika minimal PT sudah dipilih
  const isFilled = !!selectedPT;

  // ============================
  // UI
  // ============================

  return (
    <Card className="relative overflow-hidden shadow-none">
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base">Pilihan {index + 1}</h3>
        </div>

        {/* Badge wajib diisi */}
        {isEmpty && !isPopulating && (
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium
            px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Wajib diisi
          </span>
        )}

        {/* Tombol reset — hanya muncul jika PT sudah dipilih dan tidak sedang populating */}
        {isFilled && !isPopulating && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset pilihan ini"
            className="inline-flex items-center gap-1.5 text-xs font-medium
                px-2.5 py-1 rounded-full border
                text-muted-foreground border-muted hover:text-destructive
                hover:border-destructive hover:bg-destructive/5
                transition-colors duration-150">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Perguruan Tinggi */}
          <CustSearchableSelect
            name={`pilihan_program_studi.${index}.perguruan_tinggi`}
            control={control}
            label="Perguruan Tinggi"
            options={perguruanTinggiOptions}
            placeholder="Pilih perguruan tinggi"
            isRequired
          />

          {/* Kolom Program Studi dengan loading state */}
          <div className="space-y-2">
            {(isFetchingProdi || isPopulating) && idPt ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">Program Studi</span>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/40">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Memuat program studi...
                </p>
              </>
            ) : (
              <CustSearchableSelect
                name={`pilihan_program_studi.${index}.program_studi`}
                control={control}
                label="Program Studi"
                options={filteredProdiOptions}
                placeholder={
                  idPt
                    ? "Pilih program studi"
                    : "Pilih Perguruan Tinggi terlebih dahulu"
                }
                isRequired
              />
            )}
          </div>
        </div>

        {/* Kuota info */}
        {selectedProdi && !isFetchingProdi && !isPopulating && (
          <p className="text-sm text-muted-foreground mt-2">
            Total kuota:{" "}
            <span className="font-medium text-foreground">
              {selectedProdi.kuota}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
