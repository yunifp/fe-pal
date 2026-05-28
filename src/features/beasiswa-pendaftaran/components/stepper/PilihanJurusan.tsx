/* eslint-disable @typescript-eslint/no-unused-vars */
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

export type ProdiCacheItem = { jenjang: string; boleh_buta_warna?: string };

// ── Konstanta jenjang ────────────────────────────────────────────────────────
const D1D2_JENJANG = new Set(["D1", "D2"]);
const NON_D1D2_JENJANG = new Set(["D3", "D4", "S1"]);

export const isJenjangD1D2 = (jenjang: string): boolean =>
  D1D2_JENJANG.has(jenjang?.trim().toUpperCase());

export const isJenjangNonD1D2 = (jenjang: string): boolean =>
  NON_D1D2_JENJANG.has(jenjang?.trim().toUpperCase());

export const extractIdPT = (ptValue: string): string =>
  ptValue?.split("#")[0] ?? "";

export const parseHasD1D2 = (
  raw: string | number | null | undefined,
): boolean => {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim().toUpperCase();
  return s === "Y" || s === "1";
};

export const extractJenjangFromProdiValue = (value: string): string => {
  if (!value) return "";
  const parts = value.split("#");
  if (parts.length >= 3) return parts[2].trim();
  const match = value.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : "";
};

export const buildSlotCount = (
  ptList: Array<{
    id_pt: number;
    has_d1_d2?: string | number | null;
  }>,
  ptProdiMap: Map<string, ProdiCacheItem[]>,
  kondisiButaWarna: string = ""
): number => {
  let total = 0;
  ptList.forEach((pt) => {
    const idPT = String(pt.id_pt);
    const rawProdiList = ptProdiMap.get(idPT);
    if (!rawProdiList || rawProdiList.length === 0) return;

    // Filter by buta warna
    const prodiList = kondisiButaWarna === "Y" 
      ? rawProdiList.filter(p => p.boleh_buta_warna === "Y") 
      : rawProdiList;

    if (prodiList.length === 0) return; // skip this PT if no valid prodi left

    total += 1;

    const hasD1D2Prodi = prodiList.some((j) => isJenjangD1D2(j.jenjang));
    const hasNonD1D2Prodi = prodiList.some((j) => isJenjangNonD1D2(j.jenjang));
    if (hasD1D2Prodi && hasNonD1D2Prodi) {
      total += 1;
    }
  });
  return total;
};

export const validatePilihan = (
  pilihan: Array<{
    perguruan_tinggi?: string;
    program_studi?: string;
  }>,
  ptProdiMap: Map<string, any[]>,
  kondisiButaWarna: string = ""
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

    const rawProdiList = ptProdiMap.get(idPT) ?? [];
    const prodiList = kondisiButaWarna === "Y" 
      ? rawProdiList.filter(p => p.boleh_buta_warna === "Y") 
      : rawProdiList;

    const ptHasD1D2 = prodiList.some((j) => isJenjangD1D2(j.jenjang || j));
    const ptHasNonD1D2 = prodiList.some((j) => isJenjangNonD1D2(j.jenjang || j));

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
  const [ptProdiMap, setPtProdiMap] = useState<Map<string, ProdiCacheItem[]>>(
    new Map(),
  );
  const [isFetchingAllProdi, setIsFetchingAllProdi] = useState(false);

  const hasPopulatedRef = useRef(false);
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
              (ps: any) => ({
                jenjang: ps.jenjang,
                boleh_buta_warna: ps.boleh_buta_warna,
              }),
            ),
          })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const map = new Map<string, ProdiCacheItem[]>();
      results.forEach((r) => {
        if (r.status === "fulfilled") {
          map.set(r.value.idPT, r.value.jenjangList);
        }
      });
      setPtProdiMap(map);
      setIsFetchingAllProdi(false);
      hasPopulatedRef.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [responsePerguruanTinggi, selectedIdJurusanSekolah]);

  const perguruanTinggiOptions = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return [];
    return responsePerguruanTinggi.data
      .filter((pt) => {
        const prodiList = ptProdiMap.get(String(pt.id_pt));
        if (!prodiList || prodiList.length === 0) return false;

        // 🔥 HIDE PT jika pendaftar buta warna & tidak ada prodi yang mengizinkan
        if (selectedKondisiButaWarna === "Y") {
          const hasValidProdi = prodiList.some((p) => p.boleh_buta_warna === "Y");
          if (!hasValidProdi) return false;
        }

        return true;
      })
      .map((pt) => ({
        value: String(pt.id_pt + "#" + pt.nama_pt),
        label: pt.nama_pt,
        has_d1_d2: parseHasD1D2(pt.has_d1_d2),
      }));
  }, [responsePerguruanTinggi, ptProdiMap, selectedKondisiButaWarna]);

  const hasPerguruanTinggi = perguruanTinggiOptions.length > 0;

  const totalSlot = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return 0;
    if (ptProdiMap.size === 0) return 0;
    return buildSlotCount(responsePerguruanTinggi.data, ptProdiMap, selectedKondisiButaWarna);
  }, [responsePerguruanTinggi, ptProdiMap, selectedKondisiButaWarna]);

  const extraSlotCount = useMemo(() => {
    if (!responsePerguruanTinggi?.data) return 0;
    return responsePerguruanTinggi.data.filter((pt) => {
      const rawProdiList = ptProdiMap.get(String(pt.id_pt)) ?? [];
      const prodiList = selectedKondisiButaWarna === "Y" 
        ? rawProdiList.filter(p => p.boleh_buta_warna === "Y")
        : rawProdiList;

      return (
        prodiList.some((j) => isJenjangD1D2(j.jenjang)) &&
        prodiList.some((j) => isJenjangNonD1D2(j.jenjang))
      );
    }).length;
  }, [responsePerguruanTinggi, ptProdiMap, selectedKondisiButaWarna]);

  useEffect(() => {
    if (!selectedKondisiButaWarna) return;
    if (!hasPerguruanTinggi) return;
    if (isLoadingPTAny) return;
    if (isFetchingAllProdi) return;
    if (idTrxBeasiswa && isLoadingExisting) return;
    if (totalSlot === 0) return;

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

    setIsPopulating(false);
  }, [
    selectedKondisiButaWarna,
    hasPerguruanTinggi,
    isLoadingPTAny,
    isFetchingAllProdi,
    isLoadingExisting,
    totalSlot,
  ]);
  
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
  
  useEffect(() => {
    hasPopulatedRef.current = false;
    lastTotalSlotRef.current = 0;
    setPtProdiMap(new Map());
    setReadySet(new Set()); 
  }, [selectedIdJurusanSekolah]);

  useEffect(() => {
    hasPopulatedRef.current = false;
    lastTotalSlotRef.current = 0;
    setReadySet(new Set()); 
  }, [selectedKondisiButaWarna]);

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
                      onProdiReady={handleProdiReady} 
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