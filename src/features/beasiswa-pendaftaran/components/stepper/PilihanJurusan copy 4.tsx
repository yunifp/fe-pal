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
// import { toast } from "sonner";
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

  // ── State & Refs ────────────────────────────────────────────
  const [isPopulating, setIsPopulating] = useState(false);

  // Track kondisi populate terakhir agar tidak double-run
  const lastPopulateKeyRef = useRef<string>("");

  const { fields, remove, replace } = useFieldArray({
    control,
    name: "pilihan_program_studi",
  });

  // ── Watches ─────────────────────────────────────────────────
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

  // ── Fetch: Perguruan Tinggi ──────────────────────────────────
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

  // ── Fetch: Existing Pilihan ──────────────────────────────────
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

  // ── Populate Logic ───────────────────────────────────────────
  // Key unik yang merepresentasikan kondisi populate saat ini.
  // Populate HANYA jalan jika key berubah dari sebelumnya.
  const populateKey = useMemo(() => {
    if (!selectedIdJurusanSekolah) return "";
    if (!selectedKondisiButaWarna) return "";
    if (isLoadingPTAny) return "";
    if (isFetchingPT) return "";
    if (!hasPerguruanTinggi) return "";
    if (idTrxBeasiswa && isLoadingExisting) return "";
    return `${selectedIdJurusanSekolah}__${selectedKondisiButaWarna}__${perguruanTinggiOptions.length}__${idTrxBeasiswa ?? "new"}`;
  }, [
    selectedIdJurusanSekolah,
    selectedKondisiButaWarna,
    isLoadingPTAny,
    isFetchingPT,
    hasPerguruanTinggi,
    perguruanTinggiOptions.length,
    idTrxBeasiswa,
    isLoadingExisting,
  ]);

  useEffect(() => {
    // Tidak ada yang perlu dilakukan jika key kosong atau sama
    if (!populateKey) return;
    if (lastPopulateKeyRef.current === populateKey) return;
    lastPopulateKeyRef.current = populateKey;

    const validPtValues = new Set(perguruanTinggiOptions.map((pt) => pt.value));

    // Ambil data existing dari API (edit mode)
    let existingMap = new Map<string, string>();
    const rawExisting = responseExistingPilihan?.data ?? [];
    if (
      idTrxBeasiswa &&
      responseExistingPilihan?.success &&
      rawExisting.length
    ) {
      const seen = new Set<string>();
      rawExisting
        .filter((item: any) => {
          const key = item.perguruan_tinggi;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .filter((item: any) => validPtValues.has(item.perguruan_tinggi))
        .forEach((item: any) => {
          existingMap.set(item.perguruan_tinggi, item.program_studi ?? "");
        });
    }

    // Bangun rows: satu per PT, isi dengan existing jika ada
    const orderedRows = perguruanTinggiOptions.map((pt) => ({
      perguruan_tinggi: existingMap.has(pt.value) ? pt.value : "",
      program_studi: existingMap.get(pt.value) ?? "",
    }));

    setIsPopulating(true);
    replace(orderedRows);

    const timer = setTimeout(() => setIsPopulating(false), 1500);
    return () => clearTimeout(timer);
  }, [populateKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────
  const handleResult = (result: "Y" | "N") => {
    setValue("kondisi_buta_warna", result, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ── Derived UI state ─────────────────────────────────────────
  const showSkeleton =
    (isLoadingPTAny &&
      !!selectedIdJurusanSekolah &&
      !!selectedKondisiButaWarna) ||
    (!!idTrxBeasiswa && isLoadingExisting && !!selectedKondisiButaWarna) ||
    (isPopulating && fields.length === 0);

  const emptyCount = (allPilihan ?? []).filter(
    (p) => !p?.perguruan_tinggi || !p?.program_studi,
  ).length;

  const hasEmptyRows =
    !isPopulating && !showSkeleton && fields.length > 0 && emptyCount > 0;

  // ── Skeleton Component ───────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────
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
                Silakan hubungi administrator atau pilih jurusan sekolah yang
                lain.
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
                        isEmpty={isEmpty}
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
