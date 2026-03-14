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
// import { validateExistingPilihan } from "@/utils/validationHelper";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PilihanJurusanProps {
  control: Control<BeasiswaFormData>;
  errors: FieldErrors<BeasiswaFormData>;
  setValue: UseFormSetValue<BeasiswaFormData>;
  idTrxBeasiswa?: number;
}

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

  // ============================================================
  // REFS & STATE
  // ============================================================

  /**
   * hasPopulatedRef: sudah populate untuk kondisi saat ini.
   * Hanya direset ketika:
   *   - idTrxBeasiswa berubah (buka data berbeda)
   *   - kondisi_buta_warna berubah oleh user
   * TIDAK direset karena perubahan async data (re-fetch PT, dll).
   */
  const hasPopulatedRef = useRef(false);
  const prevButaWarnaRef = useRef<string | undefined>(undefined);
  const prevIdTrxRef = useRef<number | undefined>(undefined);

  /**
   * isPopulating: kirim ke child agar child tidak menghapus
   * nilai program_studi selama proses inject data berlangsung.
   */
  const [isPopulating, setIsPopulating] = useState(false);

  const { fields, remove, replace } = useFieldArray({
    control,
    name: "pilihan_program_studi",
  });

  // ============================================================
  // WATCHES
  // ============================================================

  const allPilihan = useWatch({ control, name: "pilihan_program_studi" });
  const selectedKondisiButaWarna = useWatch({
    control,
    name: "kondisi_buta_warna",
  });
  const selectedIdJurusanSekolahRaw = useWatch({
    control,
    name: "jurusan_sekolah",
  });
  const selectedIdJurusanSekolah = selectedIdJurusanSekolahRaw?.split("#")[0];

  // ============================================================
  // FETCH: daftar perguruan tinggi
  // ============================================================

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

  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;
  const isLoadingPTAny = isLoadingPT || isFetchingPT;

  // ============================================================
  // FETCH: data pilihan existing — pakai useQuery, bukan fetch manual
  //
  // Keuntungan vs fetch di useEffect:
  //   - React Query otomatis cache: refresh halaman → data langsung
  //     tersedia dari cache tanpa fetch ulang jika masih fresh
  //   - Tidak ada race condition dari multiple useEffect triggers
  //   - isLoading/data tersedia sebagai nilai reaktif biasa
  // ============================================================

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

  // Ref untuk baca allPilihan tanpa jadi dependency trigger
  const allPilihanRef = useRef(allPilihan);
  useEffect(() => {
    allPilihanRef.current = allPilihan;
  }, [allPilihan]);

  // Ref untuk detect perubahan jurusan sekolah
  const prevJurusanSekolahRef = useRef<string | undefined>(undefined);

  // ============================================================
  // POPULATE FIELDS — satu useEffect terpusat
  //
  // Triggered ketika SEMUA kondisi siap:
  //   1. PT selesai di-fetch
  //   2. Kondisi buta warna sudah dipilih
  //   3. (Edit mode) data existing selesai di-fetch
  //   4. Belum populate untuk kondisi saat ini
  // ============================================================

  // useEffect(() => {
  //   if (isLoadingPTAny) return;
  //   if (!hasPerguruanTinggi) return;
  //   if (!selectedKondisiButaWarna) return;
  //   if (idTrxBeasiswa && isLoadingExisting) return; // tunggu existing data

  //   // Reset flag jika pindah ke data berbeda
  //   if (prevIdTrxRef.current !== idTrxBeasiswa) {
  //     hasPopulatedRef.current = false;
  //     prevIdTrxRef.current = idTrxBeasiswa;
  //   }

  //   if (hasPopulatedRef.current) return;
  //   hasPopulatedRef.current = true;

  //   // Bangun template: satu row kosong per PT yang tersedia
  //   const template: { perguruan_tinggi: string; program_studi: string }[] =
  //     perguruanTinggiOptions.map(() => ({
  //       perguruan_tinggi: "",
  //       program_studi: "",
  //     }));

  //   // Edit mode: isi template dengan data existing yang valid
  //   const rawExisting = responseExistingPilihan?.data ?? [];
  //   if (
  //     idTrxBeasiswa &&
  //     responseExistingPilihan?.success &&
  //     rawExisting.length
  //   ) {
  //     // 1. Dedupe: API kadang mengembalikan data duplikat.
  //     //    Ambil hanya satu entry per perguruan_tinggi (yang pertama ditemukan).
  //     const seen = new Set<string>();
  //     const existingData = rawExisting.filter((item: any) => {
  //       const key = item.perguruan_tinggi;
  //       if (!key || seen.has(key)) return false;
  //       seen.add(key);
  //       return true;
  //     });

  //     // 2. Buat map: PT value → program_studi, untuk lookup O(1)
  //     const existingMap = new Map<string, string>(
  //       existingData.map((item: any) => [
  //         item.perguruan_tinggi as string,
  //         (item.program_studi ?? "") as string,
  //       ]),
  //     );

  //     // 3. Isi template berdasarkan urutan perguruanTinggiOptions (bukan urutan API)
  //     //    sehingga setiap row pasti cocok dengan PT yang ada di options
  //     let hasInvalidData = false;
  //     perguruanTinggiOptions.forEach((pt, i) => {
  //       if (existingMap.has(pt.value)) {
  //         template[i] = {
  //           perguruan_tinggi: pt.value,
  //           program_studi: existingMap.get(pt.value) ?? "",
  //         };
  //       } else if (existingMap.size > 0) {
  //         // PT dari API tidak ditemukan di options saat ini
  //         // (mungkin PT sudah dihapus dari master) — biarkan kosong
  //         hasInvalidData = true;
  //       }
  //     });

  //     if (hasInvalidData) {
  //       toast.warning(
  //         "Beberapa pilihan perguruan tinggi tidak valid dan telah direset",
  //       );
  //     }
  //   }

  //   // Set isPopulating sebelum replace agar child sudah tahu dari awal
  //   setIsPopulating(true);
  //   replace(template);

  //   // Angkat flag setelah child punya cukup waktu fetch prodi & render
  //   const timer = setTimeout(() => setIsPopulating(false), 1500);
  //   return () => clearTimeout(timer);
  // }, [
  //   isLoadingPTAny,
  //   hasPerguruanTinggi,
  //   selectedKondisiButaWarna,
  //   idTrxBeasiswa,
  //   isLoadingExisting,
  //   perguruanTinggiOptions,
  //   responseExistingPilihan,
  //   replace,
  // ]);

  useEffect(() => {
    if (isLoadingPTAny) return;
    if (!hasPerguruanTinggi) return;
    if (!selectedKondisiButaWarna) return;
    if (idTrxBeasiswa && isLoadingExisting) return;

    if (prevIdTrxRef.current !== idTrxBeasiswa) {
      hasPopulatedRef.current = false;
      prevIdTrxRef.current = idTrxBeasiswa;
    }

    if (hasPopulatedRef.current) return;
    hasPopulatedRef.current = true;

    const validPtValues = new Set(perguruanTinggiOptions.map((pt) => pt.value));

    // ─────────────────────────────────────────────────────────
    // Tentukan sumber data:
    //   - Jika form state sudah punya data (user pernah isi) → pakai form state
    //   - Jika belum (first load / edit mode) → pakai data API
    // ─────────────────────────────────────────────────────────
    const currentFormPilihan = allPilihanRef.current ?? [];
    const hasFormData = currentFormPilihan.some(
      (p) => p?.perguruan_tinggi != null && p?.perguruan_tinggi !== "",
    );

    let existingValidRows: {
      perguruan_tinggi: string;
      program_studi: string;
    }[] = [];

    if (hasFormData) {
      // Pertahankan semua row yang PT-nya masih ada di options baru
      existingValidRows = currentFormPilihan.filter(
        (p): p is { perguruan_tinggi: string; program_studi: string } =>
          p?.perguruan_tinggi != null &&
          p.perguruan_tinggi !== "" &&
          validPtValues.has(p.perguruan_tinggi),
      );

      const removedCount =
        currentFormPilihan.filter(
          (p) => p?.perguruan_tinggi !== "" && p?.perguruan_tinggi != null,
        ).length - existingValidRows.length;

      if (removedCount > 0) {
        toast.warning(
          `${removedCount} pilihan perguruan tinggi tidak tersedia untuk jurusan ini dan telah dihapus`,
        );
      }
    } else {
      // Edit mode / first load — ambil dari API
      const rawExisting = responseExistingPilihan?.data ?? [];
      if (
        idTrxBeasiswa &&
        responseExistingPilihan?.success &&
        rawExisting.length
      ) {
        const seen = new Set<string>();
        existingValidRows = rawExisting
          .filter((item: any) => {
            const key = item.perguruan_tinggi;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .filter((item: any) => validPtValues.has(item.perguruan_tinggi))
          .map((item: any) => ({
            perguruan_tinggi: item.perguruan_tinggi as string,
            program_studi: (item.program_studi ?? "") as string,
          }));
      }
    }

    // ─────────────────────────────────────────────────────────
    // Bangun array final:
    //   1. Semua row yang sudah valid (urut sesuai options)
    //   2. Tambah row kosong untuk PT baru yang belum dipilih
    //
    // Urutan mengikuti perguruanTinggiOptions agar konsisten
    // ─────────────────────────────────────────────────────────
    const filledPtValues = new Set(
      existingValidRows.map((r) => r.perguruan_tinggi),
    );

    // Susun ulang existingValidRows sesuai urutan options
    const orderedRows: { perguruan_tinggi: string; program_studi: string }[] =
      [];

    perguruanTinggiOptions.forEach((pt) => {
      if (filledPtValues.has(pt.value)) {
        // Pertahankan data yang sudah ada
        const existing = existingValidRows.find(
          (r) => r.perguruan_tinggi === pt.value,
        );
        if (existing) orderedRows.push(existing);
      } else {
        // PT baru yang belum ada di form state → tambah row kosong
        orderedRows.push({ perguruan_tinggi: "", program_studi: "" });
      }
    });

    setIsPopulating(true);
    replace(orderedRows);

    const timer = setTimeout(() => setIsPopulating(false), 1500);
    return () => clearTimeout(timer);
  }, [
    isLoadingPTAny,
    hasPerguruanTinggi,
    selectedKondisiButaWarna,
    idTrxBeasiswa,
    isLoadingExisting,
    perguruanTinggiOptions,
    responseExistingPilihan,
    replace,
    // allPilihan sengaja tidak di sini — dibaca via ref
  ]);

  // ============================================================
  // RESET SAAT USER MENGUBAH KONDISI BUTA WARNA
  // Deteksi perubahan dari nilai sebelumnya, skip initial render
  // ============================================================

  useEffect(() => {
    if (prevJurusanSekolahRef.current === undefined) {
      prevJurusanSekolahRef.current = selectedIdJurusanSekolah;
      return;
    }
    if (prevJurusanSekolahRef.current === selectedIdJurusanSekolah) return;

    prevJurusanSekolahRef.current = selectedIdJurusanSekolah;

    // Izinkan populate ulang dengan options baru
    // Data form state akan di-preserve oleh logic merge di atas
    hasPopulatedRef.current = false;
  }, [selectedIdJurusanSekolah]);

  useEffect(() => {
    if (prevButaWarnaRef.current === undefined) {
      prevButaWarnaRef.current = selectedKondisiButaWarna;
      return;
    }
    if (prevButaWarnaRef.current === selectedKondisiButaWarna) return;

    prevButaWarnaRef.current = selectedKondisiButaWarna;
    hasPopulatedRef.current = false; // izinkan populate ulang

    replace(
      fields.length > 0
        ? fields.map(() => ({ perguruan_tinggi: "", program_studi: "" }))
        : [{ perguruan_tinggi: "", program_studi: "" }],
    );
  }, [selectedKondisiButaWarna]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Skeleton tampil saat: PT masih loading ATAU existing data masih loading
  const showSkeleton =
    (isLoadingPTAny &&
      !!selectedIdJurusanSekolah &&
      !!selectedKondisiButaWarna) ||
    (!!idTrxBeasiswa && isLoadingExisting && !!selectedKondisiButaWarna);

  // ============================================================
  // UI
  // ============================================================

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  // Hitung jumlah row yang masih kosong untuk summary alert
  const emptyCount = (allPilihan ?? []).filter(
    (p) => !p?.perguruan_tinggi || !p?.program_studi,
  ).length;

  const hasEmptyRows =
    !isPopulating && !showSkeleton && fields.length > 0 && emptyCount > 0;
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
                  Pilihan perguruan tinggi akan muncul setelah Anda memilih
                  jurusan sekolah di step sebelumnya
                </li>
                <li>
                  Lakukan tes buta warna atau pilih kondisi buta warna Anda
                  untuk melihat program studi yang sesuai
                </li>
                <li>
                  Jika Anda buta warna, hanya program studi yang mengizinkan
                  buta warna yang akan ditampilkan
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert jika jurusan sekolah belum dipilih */}
      {!selectedIdJurusanSekolah && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Silakan pilih jurusan sekolah terlebih dahulu di step "Asal Sekolah"
            untuk melihat daftar perguruan tinggi yang tersedia.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state saat fetch PT */}
      {isLoadingPTAny && selectedIdJurusanSekolah && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Memuat daftar perguruan tinggi untuk jurusan yang Anda pilih...
          </AlertDescription>
        </Alert>
      )}

      {/* Alert jika tidak ada perguruan tinggi */}
      {selectedIdJurusanSekolah && !isLoadingPTAny && !hasPerguruanTinggi && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                Tidak ada perguruan tinggi yang tersedia untuk jurusan sekolah
                yang Anda pilih.
              </p>
              <p className="text-sm">
                Silakan hubungi administrator untuk informasi lebih lanjut atau
                pilih jurusan sekolah yang lain di step sebelumnya.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form hanya muncul jika ada PT */}
      {hasPerguruanTinggi && (
        <>
          {/* Tes Buta Warna */}
          {!selectedKondisiButaWarna && (
            <TesButaWarna onResult={handleResult} />
          )}

          {/* Hasil Tes Buta Warna */}
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
                    : "Hasil tes menunjukkan adanya indikasi buta warna. Disarankan untuk konsultasi lebih lanjut."}
                </p>
              </div>
            </div>
          )}

          {/* Dropdown Manual Kondisi Buta Warna */}
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

          {/* Pilihan Program Studi */}
          {selectedKondisiButaWarna && (
            <>
              {showSkeleton ? (
                <PilihanSkeleton />
              ) : fields.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tidak ada pilihan perguruan tinggi yang dapat ditampilkan.
                    Pastikan data perguruan tinggi tersedia.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      Pilihan Perguruan Tinggi & Program Studi
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {fields.length} perguruan tinggi tersedia
                    </p>
                  </div>

                  {fields.map((field, index) => {
                    const ptSudahDipilih = (allPilihan ?? [])
                      .filter((_, i) => i !== index)
                      .map((item) => item?.perguruan_tinggi)
                      .filter(Boolean);

                    const filteredPerguruanTinggiOptions =
                      perguruanTinggiOptions.filter(
                        (opt) => !ptSudahDipilih.includes(opt.value),
                      );

                    // Row kosong = PT belum dipilih ATAU prodi belum dipilih
                    const currentRow = allPilihan?.[index];
                    const isEmpty =
                      !currentRow?.perguruan_tinggi ||
                      !currentRow?.program_studi;

                    return (
                      <PerguruanTinggiItem
                        key={field.id}
                        index={index}
                        control={control}
                        remove={remove}
                        kondisiButaWarna={selectedKondisiButaWarna}
                        perguruanTinggiOptions={filteredPerguruanTinggiOptions}
                        setValue={setValue}
                        isPopulating={isPopulating}
                        isEmpty={isEmpty} // ← tambah ini
                      />
                    );
                  })}

                  {/* Summary alert jika ada row yang belum diisi */}
                  {hasEmptyRows && (
                    <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">
                          {emptyCount} pilihan
                        </span>{" "}
                        belum dilengkapi. Semua pilihan perguruan tinggi dan
                        program studi wajib diisi sebelum melanjutkan.
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
