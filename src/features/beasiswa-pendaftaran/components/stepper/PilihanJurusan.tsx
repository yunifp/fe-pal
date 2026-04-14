import type { BeasiswaFormData } from "@/types/beasiswa";
import {
  type Control,
  type FieldErrors,
  useFieldArray,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { PerguruanTinggiItem } from "../PerguruanTinggiItem";
import { useQuery } from "@tanstack/react-query";
import { masterService } from "@/services/masterService";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useEffect, useMemo, useRef, useState } from "react";
import { TesButaWarna } from "../TesButaWarna";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { CustSelect } from "@/components/ui/CustSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PilihanJurusanProps {
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
  idTrxBeasiswa?: number;
}

// ── Helper: cek apakah program studi termasuk D1/D2 ────────────────────────────
// Asumsi: nilai program_studi mengandung prefix jenjang, contoh "D1#123#Teknik Sipil"
// atau nama program studi mengandung kata "D1"/"D2". Sesuaikan logika ini
// dengan struktur data aktual di proyek Anda.
const isD1OrD2ProgramStudi = (programStudiValue: string): boolean => {
  if (!programStudiValue) return false;
  const upper = programStudiValue.toUpperCase();
  // Cek apakah nilai mengandung jenjang D1 atau D2
  return (
    upper.includes("D1") ||
    upper.includes("D2") ||
    upper.startsWith("D1") ||
    upper.startsWith("D2")
  );
};

// ── Helper: ekstrak id PT dari value "idPt#namaPt" ─────────────────────────────
const extractIdPT = (ptValue: string): string => {
  if (!ptValue) return "";
  return ptValue.split("#")[0];
};

/**
 * Menghitung berapa kali sebuah PT sudah dipilih di semua slot,
 * beserta apakah ada pilihan D1/D2 dan non-D1/D2 untuk PT tersebut.
 *
 * Aturan:
 * - PT yang memiliki setidaknya satu program studi D1/D2 → bisa dipilih 2x
 *   (1 slot dengan prodi D1/D2, 1 slot dengan prodi non-D1/D2)
 * - PT yang TIDAK memiliki prodi D1/D2 → hanya bisa dipilih 1x
 *
 * Fungsi ini mengembalikan Map<idPT, { hasD1D2InOptions, countSelected, hasD1D2Selected, hasNonD1D2Selected }>
 */
const buildPTTrackingMap = (
  allPilihan: Array<{ perguruan_tinggi?: string; program_studi?: string }>,
  perguruanTinggiOptions: Array<{ value: string; label: string }>,
  // Map dari idPT ke apakah PT tersebut punya program studi D1/D2
  ptHasD1D2Map: Map<string, boolean>,
) => {
  const trackingMap = new Map<
    string,
    {
      countSelected: number;
      hasD1D2Selected: boolean;
      hasNonD1D2Selected: boolean;
      hasD1D2InOptions: boolean;
    }
  >();

  // Inisialisasi semua PT dari opsi
  perguruanTinggiOptions.forEach((opt) => {
    const idPT = extractIdPT(opt.value);
    trackingMap.set(idPT, {
      countSelected: 0,
      hasD1D2Selected: false,
      hasNonD1D2Selected: false,
      hasD1D2InOptions: ptHasD1D2Map.get(idPT) ?? false,
    });
  });

  // Hitung slot yang sudah terisi
  (allPilihan ?? []).forEach((pilihan) => {
    const idPT = extractIdPT(pilihan?.perguruan_tinggi ?? "");
    if (!idPT) return;

    const existing = trackingMap.get(idPT);
    if (!existing) return;

    const isD1D2 = isD1OrD2ProgramStudi(pilihan?.program_studi ?? "");

    trackingMap.set(idPT, {
      ...existing,
      countSelected: existing.countSelected + 1,
      hasD1D2Selected: existing.hasD1D2Selected || isD1D2,
      hasNonD1D2Selected: existing.hasNonD1D2Selected || !isD1D2,
    });
  });

  return trackingMap;
};

/**
 * Menentukan apakah sebuah PT boleh dipilih di slot tertentu.
 *
 * @param idPT           - ID perguruan tinggi yang akan dicek
 * @param currentSlotIndex - Index slot yang sedang dirender
 * @param allPilihan     - Semua nilai pilihan saat ini
 * @param trackingMap    - Map tracking dari buildPTTrackingMap
 * @returns true jika PT TIDAK boleh dipilih (harus di-disable)
 */
const isPTDisabled = (
  idPT: string,
  currentSlotIndex: number,
  allPilihan: Array<{ perguruan_tinggi?: string; program_studi?: string }>,
  trackingMap: ReturnType<typeof buildPTTrackingMap>,
): boolean => {
  const tracking = trackingMap.get(idPT);
  if (!tracking) return false;

  // Hitung berapa kali PT ini dipilih di slot SELAIN slot saat ini
  const countInOtherSlots = (allPilihan ?? []).reduce((acc, pilihan, idx) => {
    if (idx === currentSlotIndex) return acc;
    if (extractIdPT(pilihan?.perguruan_tinggi ?? "") === idPT) return acc + 1;
    return acc;
  }, 0);

  if (!tracking.hasD1D2InOptions) {
    // PT tanpa D1/D2: hanya boleh dipilih 1x total
    return countInOtherSlots >= 1;
  }

  // PT dengan D1/D2: boleh dipilih 2x TAPI dengan kombinasi D1/D2 + non-D1/D2
  if (countInOtherSlots >= 2) return true; // sudah 2x di slot lain → tidak bisa lagi

  if (countInOtherSlots === 1) {
    // Cek apa jenis prodi yang sudah dipilih di slot lain
    const otherSlotPilihan = (allPilihan ?? []).find(
      (pilihan, idx) =>
        idx !== currentSlotIndex &&
        extractIdPT(pilihan?.perguruan_tinggi ?? "") === idPT,
    );
    if (!otherSlotPilihan?.program_studi) {
      // Slot lain belum isi prodi → belum bisa tentukan kombinasi → izinkan dulu
      return false;
    }
    const otherIsD1D2 = isD1OrD2ProgramStudi(otherSlotPilihan.program_studi);
    const currentProdi = allPilihan?.[currentSlotIndex]?.program_studi ?? "";

    if (!currentProdi) {
      // Slot ini belum pilih prodi → izinkan pilih PT dulu, validasi prodi nanti
      return false;
    }

    const currentIsD1D2 = isD1OrD2ProgramStudi(currentProdi);

    // Harus kombinasi berbeda: satu D1/D2, satu non-D1/D2
    if (otherIsD1D2 && currentIsD1D2) return true; // keduanya D1/D2 → tidak boleh
    if (!otherIsD1D2 && !currentIsD1D2) return true; // keduanya non-D1/D2 → tidak boleh
  }

  return false;
};

const PilihanJurusan = ({
  control,
  errors,
  setValue,
  idTrxBeasiswa,
}: PilihanJurusanProps) => {
  const butaWarnaOptions = [
    { value: "Y", label: "Ya" },
    { value: "N", label: "Tidak" },
  ];

  const [isPopulating, setIsPopulating] = useState(false);
  const hasPopulatedRef = useRef(false);

  // Map: idPT → apakah memiliki program studi D1/D2
  // Diisi dari data master setelah PT & prodi di-fetch
  const [ptHasD1D2Map, setPtHasD1D2Map] = useState<Map<string, boolean>>(
    new Map(),
  );

  const { fields, replace } = useFieldArray({
    control,
    name: "pilihan_program_studi",
  });

  const allPilihan = useWatch({ control, name: "pilihan_program_studi" });
  const selectedKondisiButaWarna = useWatch({
    control,
    name: "kondisi_buta_warna",
  });
  const selectedIdJurusanSekolahRaw = useWatch({
    control,
    name: "jurusan_sekolah",
  });

  const selectedIdJurusanSekolah = useMemo(() => {
    const id = selectedIdJurusanSekolahRaw?.split("#")[0];
    return id && id !== "" ? id : undefined;
  }, [selectedIdJurusanSekolahRaw]);

  // ── Fetch PT ─────────────────────────────────────────────────
  const {
    data: responsePerguruanTinggi,
    isLoading: isLoadingPT,
    isFetching: isFetchingPT,
  } = useQuery({
    queryKey: ["opsi-perguruan-tinggi", selectedIdJurusanSekolah],
    queryFn: () =>
      masterService.getPerguruanTinggiByJurusanSekolah(
        selectedIdJurusanSekolah!,
      ),
    enabled: !!selectedIdJurusanSekolah,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const perguruanTinggiOptions = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return [];
    return responsePerguruanTinggi.data.map((pt) => ({
      value: String(pt.id_pt + "#" + pt.nama_pt),
      label: pt.nama_pt,
    }));
  }, [responsePerguruanTinggi]);

  // ── Bangun ptHasD1D2Map dari data PT ─────────────────────────
  // Asumsi: responsePerguruanTinggi.data tiap PT memiliki field `program_studi`
  // berupa array, atau field `has_d1_d2` boolean.
  // Sesuaikan dengan struktur data API Anda.
  useEffect(() => {
    if (!responsePerguruanTinggi?.data) return;

    const newMap = new Map<string, boolean>();
    responsePerguruanTinggi.data.forEach((pt) => {
      const idPT = String(pt.id_pt);

      // Opsi A: jika API mengembalikan field has_d1_d2
      if ("has_d1_d2" in pt) {
        newMap.set(idPT, Boolean((pt as any).has_d1_d2));
        return;
      }

      // Opsi B: jika API mengembalikan array program_studi per PT
      if (Array.isArray((pt as any).program_studi)) {
        const hasD1D2 = (pt as any).program_studi.some((ps: string) =>
          isD1OrD2ProgramStudi(ps),
        );
        newMap.set(idPT, hasD1D2);
        return;
      }

      // Fallback: tidak diketahui → anggap tidak punya D1/D2
      newMap.set(idPT, false);
    });

    setPtHasD1D2Map(newMap);
  }, [responsePerguruanTinggi]);

  // ── Fetch existing pilihan (edit mode) ───────────────────────
  const { data: responseExistingPilihan, isLoading: isLoadingExisting } =
    useQuery({
      queryKey: ["pilihan-program-studi-existing", idTrxBeasiswa],
      queryFn: () =>
        beasiswaService.getPilihanProgramStudiForForm(idTrxBeasiswa!),
      enabled: !!idTrxBeasiswa,
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME,
    });

  const isLoadingPTAny = isLoadingPT || isFetchingPT;
  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;

  // ── Tracking Map (di-memo agar tidak re-compute tiap render) ──
  const ptTrackingMap = useMemo(
    () =>
      buildPTTrackingMap(
        (allPilihan as any[]) ?? [],
        perguruanTinggiOptions,
        ptHasD1D2Map,
      ),
    [allPilihan, perguruanTinggiOptions, ptHasD1D2Map],
  );

  // ── Filter opsi PT per slot (exclude PT yang sudah tidak bisa dipilih) ──
  const getFilteredPTOptionsForSlot = (slotIndex: number) => {
    return perguruanTinggiOptions.filter((opt) => {
      const idPT = extractIdPT(opt.value);
      return !isPTDisabled(
        idPT,
        slotIndex,
        (allPilihan as any[]) ?? [],
        ptTrackingMap,
      );
    });
  };

  // ── Inisialisasi awal ────────────────────────────────────────
  useEffect(() => {
    if (!selectedKondisiButaWarna) return;
    if (!hasPerguruanTinggi) return;
    if (isLoadingPTAny) return;
    if (idTrxBeasiswa && isLoadingExisting) return;
    if (hasPopulatedRef.current) return;

    hasPopulatedRef.current = true;
    setIsPopulating(true);

    const rawExisting = responseExistingPilihan?.data ?? [];

    if (rawExisting.length > 0) {
      const slots = perguruanTinggiOptions.map((_, i) => ({
        perguruan_tinggi: rawExisting[i]?.perguruan_tinggi ?? "",
        program_studi: rawExisting[i]?.program_studi ?? "",
      }));
      replace(slots);
    } else {
      replace(
        perguruanTinggiOptions.map(() => ({
          perguruan_tinggi: "",
          program_studi: "",
        })),
      );
    }

    setTimeout(() => setIsPopulating(false), 600);
  }, [
    selectedKondisiButaWarna,
    hasPerguruanTinggi,
    isLoadingPTAny,
    isLoadingExisting,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset flag saat jurusan/buta warna berubah
  useEffect(() => {
    hasPopulatedRef.current = false;
  }, [selectedIdJurusanSekolah, selectedKondisiButaWarna]);

  // ── Handler reset slot ───────────────────────────────────────
  const handleResetSlot = (index: number) => {
    const current = (allPilihan as any[]) ?? [];
    const rebuilt = current.map((row, i) => {
      if (i !== index) return row;
      return { ...row, perguruan_tinggi: "", program_studi: "" };
    });
    replace(rebuilt);
  };

  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const emptyCount = ((allPilihan as any[]) ?? []).filter(
    (p) => p?.perguruan_tinggi && !p?.program_studi,
  ).length;
  const hasEmptyRows = !isPopulating && fields.length > 0 && emptyCount > 0;

  const showSkeleton =
    (isLoadingPTAny &&
      !!selectedIdJurusanSekolah &&
      !!selectedKondisiButaWarna) ||
    (!!idTrxBeasiswa && isLoadingExisting && !!selectedKondisiButaWarna) ||
    isPopulating;

  const PilihanSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Memuat pilihan program studi...
        </span>
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="shadow-none">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="shadow-none border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">Informasi Penting:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Pilihan perguruan tinggi akan muncul setelah jurusan sekolah
                  dipilih
                </li>
                <li>
                  Lakukan tes buta warna untuk melihat program studi yang sesuai
                </li>
                <li>
                  Perguruan tinggi yang memiliki program D1/D2 dapat dipilih di
                  dua slot berbeda, dengan syarat satu slot memilih prodi D1/D2
                  dan slot lainnya memilih prodi non-D1/D2
                </li>
                <li>
                  Perguruan tinggi tanpa program D1/D2 hanya dapat dipilih satu
                  kali
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedIdJurusanSekolah && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Silakan pilih jurusan sekolah terlebih dahulu di step "Asal
            Sekolah".
          </AlertDescription>
        </Alert>
      )}

      {isLoadingPTAny && selectedIdJurusanSekolah && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Memuat daftar perguruan tinggi...</AlertDescription>
        </Alert>
      )}

      {selectedIdJurusanSekolah && !isLoadingPTAny && !hasPerguruanTinggi && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">
              Tidak ada perguruan tinggi untuk jurusan ini.
            </p>
            <p className="text-sm">
              Silakan hubungi administrator atau pilih jurusan lain.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {hasPerguruanTinggi && (
        <>
          {!selectedKondisiButaWarna && (
            <TesButaWarna onResult={handleResult} />
          )}

          {selectedKondisiButaWarna && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                selectedKondisiButaWarna === "N"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
              <div className="flex-shrink-0 mt-0.5">
                {selectedKondisiButaWarna === "N" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    selectedKondisiButaWarna === "N"
                      ? "text-green-900"
                      : "text-red-900"
                  }`}>
                  {selectedKondisiButaWarna === "N"
                    ? "Penglihatan Normal"
                    : "Terdeteksi Buta Warna"}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    selectedKondisiButaWarna === "N"
                      ? "text-green-700"
                      : "text-red-700"
                  }`}>
                  {selectedKondisiButaWarna === "N"
                    ? "Hasil tes menunjukkan tidak ada indikasi buta warna."
                    : "Hasil tes menunjukkan adanya indikasi buta warna."}
                </p>
              </div>
            </div>
          )}

          {selectedKondisiButaWarna && (
            <div className="grid grid-cols-1 gap-4">
              <CustSelect
                name="kondisi_buta_warna"
                control={control}
                label="Apakah Anda Buta Warna?"
                options={butaWarnaOptions}
                placeholder="Pilih kondisi buta warna"
                isRequired={true}
                error={errors.kondisi_buta_warna}
              />
            </div>
          )}

          {selectedKondisiButaWarna && (
            <>
              {showSkeleton ? (
                <PilihanSkeleton />
              ) : fields.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tidak ada pilihan yang dapat ditampilkan.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      Pilihan Perguruan Tinggi & Program Studi
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {fields.length} slot tersedia
                    </p>
                  </div>

                  {fields.map((field, index) => (
                    <PerguruanTinggiItem
                      key={field.id}
                      index={index}
                      control={control}
                      remove={() => {}}
                      kondisiButaWarna={selectedKondisiButaWarna}
                      // ── Gunakan opsi PT yang sudah difilter per slot ──
                      perguruanTinggiOptions={getFilteredPTOptionsForSlot(
                        index,
                      )}
                      setValue={setValue}
                      isPopulating={isPopulating}
                      isEmpty={
                        !!(allPilihan as any[])?.[index]?.perguruan_tinggi &&
                        !(allPilihan as any[])?.[index]?.program_studi
                      }
                      onResetSlot={() => handleResetSlot(index)}
                    />
                  ))}

                  {hasEmptyRows && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">
                          {emptyCount} pilihan
                        </span>{" "}
                        belum dilengkapi. Semua program studi wajib diisi.
                      </p>
                    </div>
                  )}

                  {errors.pilihan_program_studi && (
                    <p className="text-sm text-red-500">
                      {errors.pilihan_program_studi.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PilihanJurusan;
