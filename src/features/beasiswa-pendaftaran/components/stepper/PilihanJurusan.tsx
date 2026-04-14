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
  const prevPtSnapshotRef = useRef<string>("");

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
      has_d1_d2: Boolean(pt.has_d1_d2),
    }));
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
      const ptProdiMap = new Map<string, string[]>();
      rawExisting.forEach((item: any) => {
        if (!item.perguruan_tinggi) return;
        if (!ptProdiMap.has(item.perguruan_tinggi)) {
          ptProdiMap.set(item.perguruan_tinggi, []);
        }
        ptProdiMap.get(item.perguruan_tinggi)!.push(item.program_studi ?? "");
      });

      const baseRows: any[] = [];

      ptProdiMap.forEach((prodiList, ptValue) => {
        baseRows.push({
          perguruan_tinggi: ptValue,
          program_studi: prodiList[0] ?? "",
          slot_type: "all", // dikoreksi efek dinamis
          _prodi_non_d1d2: prodiList[1] ?? "",
        });
      });

      const emptyCount = perguruanTinggiOptions.length - ptProdiMap.size;
      for (let i = 0; i < emptyCount; i++) {
        baseRows.push({
          perguruan_tinggi: "",
          program_studi: "",
          slot_type: "all",
          _prodi_non_d1d2: "",
        });
      }

      replace(baseRows);
    } else {
      // New mode: semua slot kosong dan polos ("all"), jumlah = jumlah PT
      replace(
        perguruanTinggiOptions.map(() => ({
          perguruan_tinggi: "",
          program_studi: "",
          slot_type: "all",
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
    prevPtSnapshotRef.current = "";
  }, [selectedIdJurusanSekolah, selectedKondisiButaWarna]);

  // ── Efek dinamis: deteksi perubahan PT ──────────────────────
  // Ketika user memilih/mengganti PT, rebuild array dengan menyisipkan
  // atau menghapus row non_d1d2 sesuai kebutuhan.
  // Slot yang PT-nya kosong selalu slot_type "all" (polos).
  useEffect(() => {
    if (isPopulating) return;
    if (!allPilihan || allPilihan.length === 0) return;

    const currentSnapshot = JSON.stringify(
      (allPilihan as any[]).map((p) => ({
        pt: p?.perguruan_tinggi ?? "",
        st: p?.slot_type ?? "all",
      })),
    );

    if (prevPtSnapshotRef.current === currentSnapshot) return;
    prevPtSnapshotRef.current = currentSnapshot;

    const current = allPilihan as any[];

    // Hanya proses base rows (non non_d1d2)
    const baseRows = current.filter((r) => r?.slot_type !== "non_d1d2");
    const rebuilt: any[] = [];

    baseRows.forEach((row) => {
      const ptId = row?.perguruan_tinggi?.split("#")[0];
      const ptOption = perguruanTinggiOptions.find(
        (o) => o.value.split("#")[0] === ptId,
      );
      const hasD1D2 = ptOption?.has_d1_d2 ?? false;
      const ptIsEmpty = !ptId || ptId === "";

      // PT kosong → slot polos "all". PT dipilih → tentukan dari hasD1D2.
      rebuilt.push({
        ...row,
        slot_type: ptIsEmpty ? "all" : hasD1D2 ? "d1d2" : "all",
      });

      // Sisipkan slot non_d1d2 hanya jika PT dipilih dan hasD1D2
      if (!ptIsEmpty && hasD1D2) {
        const existingPair = current.find(
          (r) =>
            r?.slot_type === "non_d1d2" &&
            r?.perguruan_tinggi === row.perguruan_tinggi,
        );
        rebuilt.push({
          perguruan_tinggi: row.perguruan_tinggi,
          program_studi:
            existingPair?.program_studi ?? row._prodi_non_d1d2 ?? "",
          slot_type: "non_d1d2",
        });
      }
    });

    const rebuiltSnapshot = JSON.stringify(
      rebuilt.map((r) => ({ pt: r.perguruan_tinggi, st: r.slot_type })),
    );

    if (rebuiltSnapshot !== currentSnapshot) {
      replace(rebuilt);
    }
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(
      ((allPilihan as any[]) ?? []).map((p) => ({
        pt: p?.perguruan_tinggi ?? "",
        st: p?.slot_type ?? "all",
      })),
    ),
    perguruanTinggiOptions,
    isPopulating,
  ]);

  // ── Handler reset slot d1d2 ──────────────────────────────────
  // Langsung replace array: hapus slot non_d1d2 pasangan, kembalikan
  // slot d1d2 ke "all" (polos) dengan PT + prodi kosong.
  const handleResetSlot = (index: number) => {
    const current = (allPilihan as any[]) ?? [];

    // Rebuild: buang slot non_d1d2 pasangan, reset slot target ke "all"
    const rebuilt = current
      .filter((row) => {
        // Buang slot non_d1d2 yang PT-nya sama dengan slot yang di-reset
        if (row?.slot_type === "non_d1d2") {
          const pairedPt = current[index]?.perguruan_tinggi;
          return row?.perguruan_tinggi !== pairedPt;
        }
        return true;
      })
      .map((row, i) => {
        // Reset slot yang diklik menjadi polos
        if (i === index) {
          return {
            ...row,
            perguruan_tinggi: "",
            program_studi: "",
            slot_type: "all",
            _prodi_non_d1d2: "",
          };
        }
        return row;
      });

    // Update snapshot agar efek dinamis tidak salah deteksi
    prevPtSnapshotRef.current = JSON.stringify(
      rebuilt.map((r: any) => ({
        pt: r?.perguruan_tinggi ?? "",
        st: r?.slot_type ?? "all",
      })),
    );

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
                  Jika perguruan tinggi yang Anda pilih memiliki program D1/D2,
                  slot tambahan untuk jenjang D3/D4/S1 akan otomatis muncul
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

                  {fields.map((field, index) => {
                    const currentRow = (allPilihan as any[])?.[index];
                    const slotType = (field as any).slot_type ?? "all";

                    // PT yang sudah dipakai slot lain (kecuali slot ini sendiri)
                    const disabledForThisSlot = new Set(
                      ((allPilihan as any[]) ?? [])
                        .filter(
                          (p, i) =>
                            i !== index &&
                            p?.slot_type !== "non_d1d2" &&
                            p?.perguruan_tinggi,
                        )
                        .map((p) => p.perguruan_tinggi.split("#")[0]),
                    );

                    // Slot non_d1d2: PT di-lock dari pasangan d1d2 di atasnya
                    let lockedPtValue: string | undefined;
                    if (slotType === "non_d1d2") {
                      const pairedPilihan = (allPilihan as any[])?.[index - 1];
                      if (
                        (fields[index - 1] as any)?.slot_type === "d1d2" &&
                        pairedPilihan?.perguruan_tinggi
                      ) {
                        lockedPtValue = pairedPilihan.perguruan_tinggi;
                      }
                    }

                    return (
                      <PerguruanTinggiItem
                        key={field.id}
                        index={index}
                        control={control}
                        remove={() => {}}
                        kondisiButaWarna={selectedKondisiButaWarna}
                        perguruanTinggiOptions={perguruanTinggiOptions}
                        setValue={setValue}
                        isPopulating={isPopulating}
                        isEmpty={
                          !!currentRow?.perguruan_tinggi &&
                          !currentRow?.program_studi
                        }
                        slotType={slotType}
                        disabledPtIds={disabledForThisSlot}
                        lockedPtValue={lockedPtValue}
                        onResetSlot={
                          slotType === "d1d2"
                            ? () => handleResetSlot(index)
                            : undefined
                        }
                      />
                    );
                  })}

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
