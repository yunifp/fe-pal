/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { TesButaWarna } from "../TesButaWarna";
import { AlertCircle, Info, Loader2 } from "lucide-react";
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

// ── Konstanta jenjang ────────────────────────────────────────────────────────
const D1D2_JENJANG = new Set(["D1", "D2"]);
const NON_D1D2_JENJANG = new Set(["D3", "D4", "S1"]);

export const isJenjangD1D2 = (jenjang: string): boolean =>
  D1D2_JENJANG.has(jenjang?.trim().toUpperCase());

export const isJenjangNonD1D2 = (jenjang: string): boolean =>
  NON_D1D2_JENJANG.has(jenjang?.trim().toUpperCase());

export const extractIdPT = (ptValue: string): string =>
  ptValue?.split("#")[0] ?? "";

/**
 * Parse field has_d1_d2 dari API.
 * API bisa mengembalikan "Y", "1", 1, atau null/undefined.
 */
export const parseHasD1D2 = (
  raw: string | number | null | undefined,
): boolean => {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim().toUpperCase();
  return s === "Y" || s === "1";
};

/**
 * Ekstrak jenjang dari nilai program_studi yang disimpan di form.
 * Format: "idProdi#namaProdi#jenjang"  → ambil bagian ke-3
 * Fallback: cari dalam kurung di akhir string → "(D1)"
 */
export const extractJenjangFromProdiValue = (value: string): string => {
  if (!value) return "";
  const parts = value.split("#");
  if (parts.length >= 3) return parts[2].trim();
  const match = value.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : "";
};

/**
 * Hitung total slot yang harus ditampilkan.
 *
 * Total = jumlah PT yang punya prodi
 * + jumlah PT yang punya prodi D1/D2 (slot ekstra)
 *
 * "Punya prodi" artinya ada di ptProdiMap (sudah di-fetch dan tidak kosong).
 * PT yang tidak punya prodi sama sekali → tidak ditampilkan, tidak diberi slot.
 *
 * @param ptList          - daftar PT dari API
 * @param ptProdiMap      - Map idPT → array prodi yang tersedia (sudah filter buta warna)
 * @param kondisiButaWarna - "Y" | "N" | ""
 */
export const buildSlotCount = (
  ptList: Array<{
    id_pt: number;
    has_d1_d2?: string | number | null;
  }>,
  ptProdiMap: Map<string, string[]>,
): number => {
  let total = 0;
  ptList.forEach((pt) => {
    const idPT = String(pt.id_pt);
    const prodiList = ptProdiMap.get(idPT);
    if (!prodiList || prodiList.length === 0) return; // PT tanpa prodi → skip

    total += 1; // slot biasa

    // Slot ekstra hanya jika PT punya KEDUANYA: prodi D1/D2 dan non-D1/D2
    const hasD1D2Prodi = prodiList.some((j) => isJenjangD1D2(j));
    const hasNonD1D2Prodi = prodiList.some((j) => isJenjangNonD1D2(j));
    if (hasD1D2Prodi && hasNonD1D2Prodi) {
      total += 1;
    }
  });
  return total;
};

/**
 * Validasi semua pilihan sebelum lanjut ke step berikutnya.
 *
 * Aturan:
 * 1. Setiap slot wajib diisi (PT + prodi).
 * 2. Jika PT yang sama dipilih di 2 slot:
 * a. PT tersebut wajib memiliki prodi D1/D2 dan non-D1/D2 di ptProdiMap.
 * b. Satu slot harus prodi D1/D2, satu slot harus prodi non-D1/D2.
 * 3. PT tanpa D1/D2 tidak boleh dipilih lebih dari 1×.
 * 4. Tidak ada PT yang dipilih lebih dari 2×.
 */
export const validatePilihan = (
  pilihan: Array<{
    perguruan_tinggi?: string;
    program_studi?: string;
  }>,
  ptProdiMap: Map<string, string[]>,
): string[] => {
  const errs: string[] = [];

  pilihan.forEach((p, i) => {
    if (!p?.perguruan_tinggi) {
      errs.push(`Pilihan ${i + 1}: Perguruan tinggi belum dipilih.`);
    } else if (!p?.program_studi) {
      errs.push(`Pilihan ${i + 1}: Program studi belum dipilih.`);
    }
  });

  if (errs.length > 0) return errs;

  const byPT = new Map<string, Array<{ rowIndex: number; jenjang: string }>>();

  pilihan.forEach((p, i) => {
    const idPT = extractIdPT(p.perguruan_tinggi ?? "");
    if (!idPT) return;
    const jenjang = extractJenjangFromProdiValue(p.program_studi ?? "");
    if (!byPT.has(idPT)) byPT.set(idPT, []);
    byPT.get(idPT)!.push({ rowIndex: i, jenjang });
  });

  byPT.forEach((rows, idPT) => {
    if (rows.length === 1) return;

    if (rows.length > 2) {
      errs.push(
        `Perguruan tinggi pada pilihan ${rows
          .map((r) => r.rowIndex + 1)
          .join(", ")} dipilih lebih dari dua kali, yang tidak diperbolehkan.`,
      );
      return;
    }

    // Tepat 2×
    const prodiList = ptProdiMap.get(idPT) ?? [];
    const ptHasD1D2 = prodiList.some((j) => isJenjangD1D2(j));
    const ptHasNonD1D2 = prodiList.some((j) => isJenjangNonD1D2(j));

    if (!ptHasD1D2 || !ptHasNonD1D2) {
      // errs.push(
      //   `Perguruan tinggi pada pilihan ${rows
      //     .map((r) => r.rowIndex + 1)
      //     .join(
      //       " dan ",
      //     )} tidak memiliki program D1/D2 dan non-D1/D2 sekaligus, sehingga tidak dapat dipilih dua kali.`,
      // );
      // return;
    }

    const jenjangList = rows.map((r) => r.jenjang.trim().toUpperCase());
    const hasD1D2Slot = jenjangList.some((j) => D1D2_JENJANG.has(j));
    const hasNonD1D2Slot = jenjangList.some((j) => NON_D1D2_JENJANG.has(j));

    if (!hasD1D2Slot || !hasNonD1D2Slot) {
      errs.push(
        `Pilihan ${rows
          .map((r) => r.rowIndex + 1)
          .join(
            " dan ",
          )}: Perguruan tinggi yang sama dipilih dua kali harus memiliki kombinasi satu prodi D1/D2 dan satu prodi D3/D4/S1.`,
      );
    }
  });

  return errs;
};

// ── Komponen ─────────────────────────────────────────────────────────────────

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

  /**
   * Map idPT → array jenjang prodi yang tersedia untuk jurusan sekolah ini.
   * Diisi dari batch-fetch prodi semua PT setelah daftar PT ter-load.
   * Digunakan untuk:
   * 1. Menentukan totalSlot (PT tanpa prodi → tidak masuk slot)
   * 2. Menentukan apakah PT layak mendapat slot ekstra (harus punya D1/D2 + non-D1/D2)
   * 3. Validasi saat handleNext
   * 4. Filter PT yang ditampilkan ke user (hanya PT dengan prodi)
   */
  const [ptProdiMap, setPtProdiMap] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [isFetchingAllProdi, setIsFetchingAllProdi] = useState(false);

  // Ref untuk mencegah double-populate
  const hasPopulatedRef = useRef(false);
  // Ref menyimpan totalSlot terakhir yang digunakan untuk replace()
  // Bila totalSlot berubah (mis. karena buta warna berubah → prodi berubah),
  // kita perlu populate ulang.
  const lastTotalSlotRef = useRef(0);

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

  // ── Fetch daftar PT ──────────────────────────────────────────
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

  // ── Fetch pilihan yang sudah tersimpan (edit mode) ────────────
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

  /**
   * Batch-fetch semua prodi untuk setiap PT setelah daftar PT ter-load
   * dan jurusan sekolah tersedia.
   *
   * Menggunakan Promise.allSettled agar satu PT yang gagal tidak menghentikan lainnya.
   * Hasil disimpan di ptProdiMap sebagai Map<idPT, jenjang[]>.
   *
   * Re-fetch dilakukan ketika:
   * - jurusan sekolah berubah
   * - daftar PT berubah (responsePerguruanTinggi berubah)
   */
  useEffect(() => {
    if (!responsePerguruanTinggi?.data?.length) return;
    if (!selectedIdJurusanSekolah) return;

    let cancelled = false;
    setIsFetchingAllProdi(true);

    const ptList = responsePerguruanTinggi.data;

    Promise.allSettled(
      ptList.map((pt) =>
        masterService
          .getProgramStudiByJurusanSekolahDanPT(
            selectedIdJurusanSekolah,
            String(pt.id_pt),
          )
          .then((res) => ({
            idPT: String(pt.id_pt),
            jenjangList: (res?.data ?? []).map(
              (ps: { jenjang: string }) => ps.jenjang,
            ),
          })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map = new Map<string, string[]>();
      results.forEach((r) => {
        if (r.status === "fulfilled") {
          map.set(r.value.idPT, r.value.jenjangList);
        }
      });
      setPtProdiMap(map);
      setIsFetchingAllProdi(false);
      // Reset populate flag agar slot di-rebuild dengan data baru
      hasPopulatedRef.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [responsePerguruanTinggi, selectedIdJurusanSekolah]);

  /**
   * PT yang ditampilkan ke user = hanya PT yang punya prodi di ptProdiMap.
   * PT tanpa prodi tidak ditampilkan di select dan tidak diberi slot.
   */
  const perguruanTinggiOptions = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return [];
    return responsePerguruanTinggi.data
      .filter((pt) => {
        const prodiList = ptProdiMap.get(String(pt.id_pt));
        return prodiList && prodiList.length > 0;
      })
      .map((pt) => ({
        value: String(pt.id_pt + "#" + pt.nama_pt),
        label: pt.nama_pt,
        has_d1_d2: parseHasD1D2(pt.has_d1_d2),
      }));
  }, [responsePerguruanTinggi, ptProdiMap]);

  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;

  /**
   * Total slot dihitung ulang setiap kali ptProdiMap berubah
   * (setelah batch-fetch prodi selesai).
   *
   * Logika slot ekstra: PT mendapat slot ekstra HANYA jika punya prodi D1/D2
   * dan prodi non-D1/D2 sekaligus → user bisa pilih PT yang sama dua kali
   * dengan kombinasi berbeda.
   */
  const totalSlot = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return 0;
    if (ptProdiMap.size === 0) return 0;
    return buildSlotCount(responsePerguruanTinggi.data, ptProdiMap);
  }, [responsePerguruanTinggi, ptProdiMap]);

  const extraSlotCount = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return 0;
    return responsePerguruanTinggi.data.filter((pt) => {
      const prodiList = ptProdiMap.get(String(pt.id_pt)) ?? [];
      return (
        prodiList.some((j) => isJenjangD1D2(j)) &&
        prodiList.some((j) => isJenjangNonD1D2(j))
      );
    }).length;
  }, [responsePerguruanTinggi, ptProdiMap]);

  // ── Inisialisasi / populate slot ─────────────────────────────
  // Dipicu ulang setiap kali totalSlot berubah (lastTotalSlotRef berbeda)
  // agar slot di-rebuild ketika prodi selesai di-fetch.
  useEffect(() => {
    if (!selectedKondisiButaWarna) return;
    if (!hasPerguruanTinggi) return;
    if (isLoadingPTAny) return;
    if (isFetchingAllProdi) return;
    if (idTrxBeasiswa && isLoadingExisting) return;
    if (totalSlot === 0) return;

    // Jika totalSlot sama dengan sebelumnya dan sudah populate → skip
    if (hasPopulatedRef.current && lastTotalSlotRef.current === totalSlot)
      return;

    hasPopulatedRef.current = true;
    lastTotalSlotRef.current = totalSlot;
    setIsPopulating(true);
    setReadySet(new Set());

    const rawExisting = responseExistingPilihan?.data ?? [];

    if (rawExisting.length > 0) {
      const slots = Array.from({ length: totalSlot }, (_, i) => ({
        perguruan_tinggi: rawExisting[i]?.perguruan_tinggi ?? "",
        program_studi: rawExisting[i]?.program_studi ?? "",
      }));
      replace(slots);
    } else {
      replace(
        Array.from({ length: totalSlot }, () => ({
          perguruan_tinggi: "",
          program_studi: "",
        })),
      );
    }

    // setTimeout(() => setIsPopulating(false), 600);
    setIsPopulating(false); // langsung, tanpa delay
  }, [
    selectedKondisiButaWarna,
    hasPerguruanTinggi,
    isLoadingPTAny,
    isFetchingAllProdi,
    isLoadingExisting,
    totalSlot,
  ]);
  
  // ── BARU: track slot mana yang prodinya sudah siap ──────────
  const [readySet, setReadySet] = useState<Set<number>>(new Set());

  const handleProdiReady = useCallback((index: number) => {
    setReadySet((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const allProdiReady = fields.length === 0 || readySet.size >= fields.length;
  
  // ── FIX BUG: Pemisahan reset flag saat jurusan / buta warna berubah ──────────
  
  // 1. Reset SEMUA (termasuk cache prodi) HANYA ketika Jurusan Sekolah berubah
  useEffect(() => {
    hasPopulatedRef.current = false;
    lastTotalSlotRef.current = 0;
    setPtProdiMap(new Map());
    setReadySet(new Set()); 
  }, [selectedIdJurusanSekolah]);

  // 2. Reset flag populasi saja ketika Kondisi Buta Warna berubah (TIDAK menghapus data prodi)
  useEffect(() => {
    hasPopulatedRef.current = false;
    lastTotalSlotRef.current = 0;
    setReadySet(new Set()); 
  }, [selectedKondisiButaWarna]);

  // ── Reset satu slot ──────────────────────────────────────────
  const handleResetSlot = (index: number) => {
    const current = (allPilihan as any[]) ?? [];
    replace(
      current.map((row: any, i: number) =>
        i !== index ? row : { perguruan_tinggi: "", program_studi: "" },
      ),
    );
  };

  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ── Status kelengkapan ───────────────────────────────────────
  const emptyProdiCount = ((allPilihan as any[]) ?? []).filter(
    (p) => p?.perguruan_tinggi && !p?.program_studi,
  ).length;
  const emptyPTCount = ((allPilihan as any[]) ?? []).filter(
    (p) => !p?.perguruan_tinggi,
  ).length;
  const totalIncomplete = emptyProdiCount + emptyPTCount;
  const hasEmptyRows =
    !isPopulating && fields.length > 0 && totalIncomplete > 0;

  const showSkeleton =
    (isLoadingPTAny &&
      !!selectedIdJurusanSekolah &&
      !!selectedKondisiButaWarna) ||
    (!!idTrxBeasiswa && isLoadingExisting && !!selectedKondisiButaWarna) ||
    (isFetchingAllProdi && !!selectedKondisiButaWarna) ||
    isPopulating ||
    (fields.length > 0 && !allProdiReady && !!selectedKondisiButaWarna);

  useEffect(() => {
    if (allProdiReady) return;
    if (fields.length === 0) return;

    // Fallback: paksa selesai setelah 5 detik
    const timer = setTimeout(() => {
      setReadySet(new Set(Array.from({ length: fields.length }, (_, i) => i)));
    }, 5000);

    return () => clearTimeout(timer);
  }, [allProdiReady, fields.length]);

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
      {/* <Card className="shadow-none border-blue-200 bg-blue-50">
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
                  Perguruan tinggi yang memiliki program D1/D2{" "}
                  <strong>dan</strong> D3/D4/S1 sekaligus mendapat{" "}
                  <strong>slot tambahan</strong> — Anda dapat memilih PT yang
                  sama dua kali: satu slot pilih prodi D1/D2, satu slot pilih
                  prodi D3/D4/S1
                </li>
                <li>
                  Perguruan tinggi yang hanya memiliki satu jenis jenjang hanya
                  dapat dipilih satu kali
                </li>
                <li>
                  <strong>Semua slot wajib diisi</strong> sebelum dapat
                  melanjutkan ke tahap berikutnya
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {!selectedIdJurusanSekolah && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Silakan pilih jurusan sekolah terlebih dahulu di step "Asal
            Sekolah".
          </AlertDescription>
        </Alert>
      )}

      {(isLoadingPTAny || isFetchingAllProdi) && selectedIdJurusanSekolah && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Memuat daftar perguruan tinggi dan program studi...
          </AlertDescription>
        </Alert>
      )}

      {selectedIdJurusanSekolah &&
        !isLoadingPTAny &&
        !isFetchingAllProdi &&
        !hasPerguruanTinggi && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">
                Tidak ada perguruan tinggi dengan program studi tersedia untuk
                jurusan ini.
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

          {/* {selectedKondisiButaWarna && (
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
          )} */}

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
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-lg font-semibold">
                      Pilihan Perguruan Tinggi &amp; Program Studi
                    </h3>
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="text-sm text-muted-foreground">
                        {fields.length} slot tersedia
                      </p>
                      {extraSlotCount > 0 && (
                        <p className="text-xs text-blue-600">
                          termasuk {extraSlotCount} slot ekstra dari PT
                          ber-program D1/D2 + D3/D4/S1
                        </p>
                      )}
                    </div>
                  </div>

                  {fields.map((field, index) => (
                    <PerguruanTinggiItem
                      key={field.id}
                      index={index}
                      control={control}
                      remove={() => {}}
                      kondisiButaWarna={selectedKondisiButaWarna}
                      perguruanTinggiOptions={perguruanTinggiOptions}
                      ptProdiMap={ptProdiMap}
                      allPilihan={(allPilihan as any[]) ?? []}
                      setValue={setValue}
                      isPopulating={isPopulating}
                      isEmpty={
                        !!(allPilihan as any[])?.[index]?.perguruan_tinggi &&
                        !(allPilihan as any[])?.[index]?.program_studi
                      }
                      onResetSlot={() => handleResetSlot(index)}
                      onProdiReady={handleProdiReady} // ← tambahkan
                    />
                  ))}

                  {hasEmptyRows && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">
                          {totalIncomplete} slot
                        </span>{" "}
                        belum dilengkapi. Semua perguruan tinggi dan program
                        studi wajib diisi.
                      </p>
                    </div>
                  )}

                  {errors.pilihan_program_studi && (
                    <p className="text-sm text-red-500">
                      {(errors.pilihan_program_studi as any).message}
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