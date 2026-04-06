import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { Card, CardContent } from "@/components/ui/card";
import { masterService } from "@/services/masterService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, type FC } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import {
  GraduationCap,
  Loader2,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
// import { Badge } from "@/components/ui/badge";

type SlotType = "d1d2" | "non_d1d2" | "all";

type Props = {
  kondisiButaWarna: string;
  index: number;
  control: Control<any>;
  remove: (index: number) => void;
  perguruanTinggiOptions: {
    value: string;
    label: string;
    has_d1_d2?: boolean;
  }[];
  setValue: UseFormSetValue<any>;
  isPopulating?: boolean;
  isEmpty?: boolean;
  slotType?: SlotType; // <-- BARU
  disabledPtIds?: Set<string>; // PT yang tidak boleh dipilih di slot ini
  lockedPtValue?: string; // PT yang di-lock untuk slot non_d1d2
};

// Jenjang D1/D2 dan non-D1/D2
const D1D2_JENJANG = ["D1", "D2"];
const NON_D1D2_JENJANG = ["D3", "D4", "S1"];

export const PerguruanTinggiItem: FC<Props> = ({
  kondisiButaWarna,
  index,
  control,
  perguruanTinggiOptions,
  setValue,
  isPopulating = false,
  isEmpty = false,
  slotType = "all",
  disabledPtIds = new Set(),
  lockedPtValue,
}) => {
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
  // const namaPt = selectedPT?.split("#")[1] ?? "";

  // ── Refs ─────────────────────────────────────────────────────
  const isProdiLoadedRef = useRef(false);
  // Ganti dua useEffect ref yang lama dengan ini
  const prevIdPtRef = useRef<string | undefined>(undefined);

  // Di body komponen langsung (bukan dalam useEffect)
  if (prevIdPtRef.current !== idPt) {
    prevIdPtRef.current = idPt;
    // Reset prodi saat user ganti PT
    if (prevIdPtRef.current !== undefined) {
      setValue(`pilihan_program_studi.${index}.program_studi`, "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  // ── Fetch Prodi ───────────────────────────────────────────────
  const { data: responseProdi, isFetching: isFetchingProdi } = useQuery({
    queryKey: ["program-studi", idPt, kondisiButaWarna, selectedJurusanSekolah],
    queryFn: () =>
      masterService.getProgramStudiByJurusanSekolahDanPT(
        selectedJurusanSekolah,
        idPt,
      ),
    enabled: !!idPt && !!selectedJurusanSekolah,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ── Filter Prodi berdasarkan slotType + buta warna ───────────
  const filteredProdiOptions = useMemo(() => {
    if (!responseProdi?.data) return [];

    let list = responseProdi.data;

    // Filter buta warna
    if (kondisiButaWarna === "Y") {
      list = list.filter((ps) => ps.boleh_buta_warna === "Y");
    }

    // Filter jenjang berdasarkan slot
    if (slotType === "d1d2") {
      list = list.filter((ps) => D1D2_JENJANG.includes(ps.jenjang));
    } else if (slotType === "non_d1d2") {
      list = list.filter((ps) => NON_D1D2_JENJANG.includes(ps.jenjang));
    }
    // slotType === "all" → tidak filter jenjang

    return list.map((ps) => ({
      value: `${ps.id_prodi}#${ps.nama_prodi}`,
      label: `${ps.nama_prodi} (${ps.jenjang})`,
      kuota: ps.kuota,
    }));
  }, [responseProdi, kondisiButaWarna, slotType]);

  // Build filtered PT options untuk slot ini
  const filteredPtOptions = useMemo(() => {
    return perguruanTinggiOptions
      .filter((pt) => {
        // Filter berdasarkan slotType
        if (slotType === "d1d2") return pt.has_d1_d2 === true;
        if (slotType === "non_d1d2") return pt.has_d1_d2 === true; // pasangan D1/D2 juga PT yang sama
        return true;
      })
      .map((pt) => ({
        ...pt,
        // Disable PT yang sudah dipakai slot lain
        isDisabled: disabledPtIds.has(pt.value.split("#")[0]),
      }));
  }, [perguruanTinggiOptions, slotType, disabledPtIds]);

  useEffect(() => {
    if (!isFetchingProdi && filteredProdiOptions.length > 0) {
      isProdiLoadedRef.current = true;
    }
  }, [isFetchingProdi, filteredProdiOptions]);

  const selectedProdi = useMemo(() => {
    if (!filteredProdiOptions.length || !selectedProdiValue) return null;
    return filteredProdiOptions.find((p) => p.value === selectedProdiValue);
  }, [filteredProdiOptions, selectedProdiValue]);

  useEffect(() => {
    if (!lockedPtValue) return;
    if (selectedPT === lockedPtValue) return; // sudah benar, skip
    setValue(`pilihan_program_studi.${index}.perguruan_tinggi`, lockedPtValue, {
      shouldDirty: true,
    });
  }, [lockedPtValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset prodi jika tidak valid ──────────────────────────────
  useEffect(() => {
    if (isFetchingProdi) return;
    if (!isProdiLoadedRef.current) return;
    if (isPopulating) return;
    if (!selectedProdiValue) return;

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

  // ── Reset handler ─────────────────────────────────────────────
  const handleReset = () => {
    setValue(`pilihan_program_studi.${index}.program_studi`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ── Label slot ────────────────────────────────────────────────
  const slotLabel =
    slotType === "d1d2"
      ? "Pilihan D1/D2"
      : slotType === "non_d1d2"
        ? "Pilihan D3/D4/S1"
        : `Pilihan ${index + 1}`;

  const slotBadgeColor =
    slotType === "d1d2"
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : slotType === "non_d1d2"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-700 border-gray-200";

  // ── Render ────────────────────────────────────────────────────
  return (
    <Card
      className={`relative overflow-hidden shadow-none ${
        slotType === "d1d2"
          ? "border-purple-200"
          : slotType === "non_d1d2"
            ? "border-blue-200"
            : ""
      }`}>
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              slotType === "d1d2"
                ? "bg-purple-100 text-purple-700"
                : slotType === "non_d1d2"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
            }`}>
            <GraduationCap className="w-4 h-4" />
          </div>

          {/* Nama PT (read-only, sudah fixed dari populate) */}
          {/* <h3 className="font-semibold text-base">{namaPt}</h3> */}

          {/* Badge slot type */}
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${slotBadgeColor}`}>
            <BookOpen className="w-3 h-3" />
            {slotLabel}
          </span>
        </div>

        {/* Badge wajib diisi */}
        {isEmpty && !isPopulating && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 mb-3">
            <AlertCircle className="w-3 h-3" />
            Wajib diisi
          </span>
        )}

        {/* Tombol reset program studi */}
        {selectedProdiValue && !isPopulating && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset program studi"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-muted-foreground border-muted hover:text-destructive hover:border-destructive hover:bg-destructive/5 transition-colors duration-150 mb-3">
            <RotateCcw className="w-3 h-3" />
            Reset Program Studi
          </button>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* PT sudah fixed, tampilkan sebagai read-only info */}
          {/* <div className="p-3 rounded-md bg-muted/40 border text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{namaPt}</span>
            {slotType !== "all" && (
              <span className="ml-2 text-xs">
                · Jenjang: {slotType === "d1d2" ? "D1 / D2" : "D3 / D4 / S1"}
              </span>
            )}
          </div> */}
          <CustSearchableSelect
            name={`pilihan_program_studi.${index}.perguruan_tinggi`}
            control={control}
            label="Perguruan Tinggi"
            options={filteredPtOptions}
            placeholder="Pilih perguruan tinggi"
            isRequired
            // Slot non_d1d2 PT-nya otomatis mengikuti pasangan D1/D2 → read-only
            disabled={slotType === "non_d1d2" && !!lockedPtValue} // ← bukan isDisabled
          />
          {/* <CustSearchableSelect
            name={`pilihan_program_studi.${index}.perguruan_tinggi`}
            control={control}
            label="Perguruan Tinggi"
            options={perguruanTinggiOptions.filter((pt) => {
              if (slotType === "d1d2") return pt.has_d1_d2 === true;
              if (slotType === "non_d1d2") return true;
              return true;
            })}
            placeholder="Pilih perguruan tinggi"
            isRequired
          /> */}
          {/* Program Studi */}
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
                  filteredProdiOptions.length === 0 && idPt
                    ? `Tidak ada prodi ${slotType === "d1d2" ? "D1/D2" : slotType === "non_d1d2" ? "D3/D4/S1" : ""} tersedia`
                    : "Pilih program studi"
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
