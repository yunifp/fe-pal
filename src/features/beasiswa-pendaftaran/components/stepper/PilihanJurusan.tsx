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

  // ── Fetch: Perguruan Tinggi (sekarang include has_d1_d2) ─────
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

  // ── Build perguruanTinggiOptions tetap sama (untuk dropdown) ─
  const perguruanTinggiOptions = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return [];
    return responsePerguruanTinggi.data.map((pt) => ({
      value: String(pt.id_pt + "#" + pt.nama_pt),
      label: pt.nama_pt,
      has_d1_d2: Boolean(pt.has_d1_d2), // cast eksplisit, handles "1", 1, true, false
    }));
  }, [responsePerguruanTinggi]);

  // Tambah di PilihanJurusan.tsx setelah allPilihan watch

  // Kumpulkan semua PT yang sudah dipilih beserta paired-nya
  // const usedPtValues = useMemo(() => {
  //   const used = new Set<string>();
  //   (allPilihan ?? []).forEach((p, idx) => {
  //     if (!p?.perguruan_tinggi) return;
  //     const ptValue = p.perguruan_tinggi;
  //     const ptId = ptValue.split("#")[0];

  //     // Cek apakah PT ini punya D1/D2
  //     // const ptOption = perguruanTinggiOptions.find(
  //     //   (opt) => opt.value === ptValue,
  //     // );

  //     // Tandai PT ini sebagai used di semua slot kecuali slot sendiri
  //     // Kita pass index agar slot sendiri tidak ter-exclude
  //     used.add(`${ptId}__${idx}`); // format: ptId__ownIndex (dikecualikan nanti)
  //   });
  //   return used;
  // }, [allPilihan, perguruanTinggiOptions]);

  // Set berisi ptId yang sudah fully picked (D1/D2 + non-D1/D2 keduanya terisi)
  // const fullyPickedPtIds = useMemo(() => {
  //   const picked = new Set<string>();

  //   // Group pilihan by ptId
  //   const grouped = new Map<string, typeof allPilihan>();
  //   (allPilihan ?? []).forEach((p) => {
  //     if (!p?.perguruan_tinggi) return;
  //     const ptId = p.perguruan_tinggi.split("#")[0];
  //     if (!grouped.has(ptId)) grouped.set(ptId, []);
  //     grouped.get(ptId)!.push(p);
  //   });

  //   grouped.forEach((rows, ptId) => {
  //     const ptOption = perguruanTinggiOptions.find(
  //       (opt) => opt.value.split("#")[0] === ptId,
  //     );
  //     if (ptOption?.has_d1_d2) {
  //       // PT dengan D1/D2 — fully picked hanya jika KEDUA slot sudah ada PT-nya
  //       if (rows.length >= 2 && rows.every((r) => r?.perguruan_tinggi)) {
  //         picked.add(ptId);
  //       }
  //     } else {
  //       // PT tanpa D1/D2 — fully picked jika slot-nya sudah ada PT-nya
  //       if (rows.some((r) => r?.perguruan_tinggi)) {
  //         picked.add(ptId);
  //       }
  //     }
  //   });

  //   return picked;
  // }, [allPilihan, perguruanTinggiOptions]);
  const fullyPickedPtIds = useMemo(() => {
    const picked = new Set<string>();

    const grouped = new Map<
      string,
      { perguruan_tinggi: string; program_studi: string }[]
    >();
    (allPilihan ?? []).forEach((p) => {
      if (!p?.perguruan_tinggi) return;
      const ptId = p.perguruan_tinggi.split("#")[0];
      if (!grouped.has(ptId)) grouped.set(ptId, []);
      grouped.get(ptId)!.push(p);
    });

    grouped.forEach((rows, ptId) => {
      if (!rows) return; // ← fix: guard rows undefined

      const ptOption = perguruanTinggiOptions.find(
        (opt) => opt.value.split("#")[0] === ptId,
      );

      if (ptOption?.has_d1_d2) {
        if (rows.length >= 2 && rows.every((r) => !!r?.perguruan_tinggi)) {
          picked.add(ptId);
        }
      } else {
        if (rows.some((r) => !!r?.perguruan_tinggi)) {
          picked.add(ptId);
        }
      }
    });

    return picked;
  }, [allPilihan, perguruanTinggiOptions]);

  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;
  const isLoadingPTAny = isLoadingPT || isFetchingPT;

  type SlotRow = {
    perguruan_tinggi: string;
    program_studi: string;
    slot_type: "d1d2" | "non_d1d2" | "all";
  };

  const rowTemplates = useMemo(() => {
    return perguruanTinggiOptions.flatMap((pt): SlotRow[] => {
      if (pt.has_d1_d2) {
        return [
          { perguruan_tinggi: pt.value, program_studi: "", slot_type: "d1d2" },
          {
            perguruan_tinggi: pt.value,
            program_studi: "",
            slot_type: "non_d1d2",
          },
        ];
      }
      return [
        { perguruan_tinggi: pt.value, program_studi: "", slot_type: "all" },
      ];
    });
  }, [perguruanTinggiOptions]);

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

  // ── Populate Key ─────────────────────────────────────────────
  const populateKey = useMemo(() => {
    if (!selectedIdJurusanSekolah) return "";
    if (!selectedKondisiButaWarna) return "";
    if (isLoadingPTAny) return "";
    if (isFetchingPT) return "";
    if (!hasPerguruanTinggi) return "";
    if (idTrxBeasiswa && isLoadingExisting) return "";
    return `${selectedIdJurusanSekolah}__${selectedKondisiButaWarna}__${rowTemplates.length}__${idTrxBeasiswa ?? "new"}`;
  }, [
    selectedIdJurusanSekolah,
    selectedKondisiButaWarna,
    isLoadingPTAny,
    isFetchingPT,
    hasPerguruanTinggi,
    rowTemplates.length,
    idTrxBeasiswa,
    isLoadingExisting,
  ]);

  // ── Populate Effect ──────────────────────────────────────────
  useEffect(() => {
    if (!populateKey) return;
    if (lastPopulateKeyRef.current === populateKey) return;
    lastPopulateKeyRef.current = populateKey;

    // Build existing map: key = "id_pt#nama_pt__slot_type", value = program_studi
    // Untuk edit mode: match berdasarkan perguruan_tinggi + slot_type
    let existingMap = new Map<string, string>();
    const rawExisting = responseExistingPilihan?.data ?? [];

    if (
      idTrxBeasiswa &&
      responseExistingPilihan?.success &&
      rawExisting.length
    ) {
      // Group existing by perguruan_tinggi, urutkan berdasarkan jenjang
      const groupedByPt = new Map<string, string[]>();
      rawExisting.forEach((item: any) => {
        const ptKey = item.perguruan_tinggi;
        if (!ptKey) return;
        if (!groupedByPt.has(ptKey)) groupedByPt.set(ptKey, []);
        groupedByPt.get(ptKey)!.push(item.program_studi ?? "");
      });

      // Map ke slot_type berdasarkan urutan (d1d2 duluan, lalu non_d1d2)
      // Asumsi data existing sudah tersimpan dengan urutan yang benar
      rowTemplates.forEach((row) => {
        const ptKey = row.perguruan_tinggi;
        const prodiList = groupedByPt.get(ptKey) ?? [];
        const mapKey = `${ptKey}__${row.slot_type}`;

        if (row.slot_type === "d1d2") {
          existingMap.set(mapKey, prodiList[0] ?? "");
        } else if (row.slot_type === "non_d1d2") {
          existingMap.set(mapKey, prodiList[1] ?? "");
        } else {
          existingMap.set(mapKey, prodiList[0] ?? "");
        }
      });
    }

    // Build rows dari template, isi dengan existing jika ada
    // const orderedRows = rowTemplates.map((row) => {
    //   const mapKey = `${row.perguruan_tinggi}__${row.slot_type}`;
    //   return {
    //     perguruan_tinggi: row.perguruan_tinggi,
    //     program_studi: existingMap.get(mapKey) ?? "",
    //     slot_type: row.slot_type,
    //   };
    // });

    const orderedRows = rowTemplates.map((row) => {
      const mapKey = `${row.perguruan_tinggi}__${row.slot_type}`;
      const existingProdi = existingMap.get(mapKey) ?? "";
      return {
        // Kalau edit mode & ada existing data → isi PT, kalau tidak → biarkan kosong
        perguruan_tinggi: existingProdi ? row.perguruan_tinggi : "",
        program_studi: existingProdi,
        slot_type: row.slot_type,
      };
    });

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

  const emptyCount = (allPilihan ?? []).filter((p) => !p?.program_studi).length;
  const hasEmptyRows =
    !isPopulating && !showSkeleton && fields.length > 0 && emptyCount > 0;

  // ── Skeleton ─────────────────────────────────────────────────
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
                  jurusan sekolah
                </li>
                <li>
                  Lakukan tes buta warna untuk melihat program studi yang sesuai
                </li>
                <li>
                  Perguruan tinggi yang memiliki program D1/D2 akan muncul dua
                  kali — satu slot untuk D1/D2 dan satu slot untuk jenjang
                  lainnya
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
                  className={`font-medium ${selectedKondisiButaWarna === "N" ? "text-green-900" : "text-red-900"}`}>
                  {selectedKondisiButaWarna === "N"
                    ? "Penglihatan Normal"
                    : "Terdeteksi Buta Warna"}
                </h4>
                <p
                  className={`text-sm mt-1 ${selectedKondisiButaWarna === "N" ? "text-green-700" : "text-red-700"}`}>
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
                    // Di dalam fields.map(...)
                    const currentRow = allPilihan?.[index];
                    const slotType = (field as any).slot_type ?? "all";
                    const currentPtId =
                      currentRow?.perguruan_tinggi?.split("#")[0];

                    // PT yang tidak boleh dipilih di slot ini:
                    // semua PT yang sudah fully picked, kecuali PT milik slot ini sendiri
                    const disabledPtIds = new Set(
                      [...fullyPickedPtIds].filter(
                        (ptId) => ptId !== currentPtId,
                      ),
                    );

                    // Untuk slot non_d1d2: PT-nya di-lock mengikuti slot d1d2 pasangannya
                    // Cari paired slot (slot d1d2 dengan index terdekat sebelum slot ini)
                    let lockedPtValue: string | undefined = undefined;
                    if (slotType === "non_d1d2") {
                      // Cari slot d1d2 yang punya PT sama (pasangan)
                      // const pairedSlot = (allPilihan ?? []).find(
                      //   (p, i) =>
                      //     i < index &&
                      //     (field as any).slot_type !==
                      //       (fields[i] as any)?.slot_type &&
                      //     p?.perguruan_tinggi,
                      // );
                      // Cara lebih reliable: cari di fields berdasarkan posisi
                      // Slot non_d1d2 selalu tepat setelah slot d1d2 untuk PT yang sama
                      const pairedField = fields[index - 1];
                      const pairedPilihan = allPilihan?.[index - 1];
                      if (
                        pairedField &&
                        (pairedField as any).slot_type === "d1d2" &&
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
                        remove={remove}
                        kondisiButaWarna={selectedKondisiButaWarna}
                        perguruanTinggiOptions={perguruanTinggiOptions}
                        setValue={setValue}
                        isPopulating={isPopulating}
                        isEmpty={!currentRow?.program_studi}
                        slotType={slotType}
                        disabledPtIds={disabledPtIds} // ← baru
                        lockedPtValue={lockedPtValue} // ← baru: untuk slot non_d1d2
                      />
                    );
                    // const currentRow = allPilihan?.[index];
                    // const isEmpty = !currentRow?.program_studi;
                    // // slot_type tersimpan di field array
                    // const slotType = (field as any).slot_type ?? "all";

                    // return (
                    //   <PerguruanTinggiItem
                    //     key={field.id}
                    //     index={index}
                    //     control={control}
                    //     remove={remove}
                    //     kondisiButaWarna={selectedKondisiButaWarna}
                    //     perguruanTinggiOptions={perguruanTinggiOptions}
                    //     setValue={setValue}
                    //     isPopulating={isPopulating}
                    //     isEmpty={isEmpty}
                    //     slotType={slotType} // <-- BARU
                    //   />
                    // );
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
