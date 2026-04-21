import { CustSearchableSelect } from "@/components/CustSearchableSelect";
import { Card, CardContent } from "@/components/ui/card";
import { masterService } from "@/services/masterService";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, type FC } from "react";
import { useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { GraduationCap, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  extractIdPT,
  extractJenjangFromProdiValue,
  isJenjangD1D2,
  isJenjangNonD1D2,
} from "./stepper/PilihanJurusan";

type Props = {
  kondisiButaWarna: string;
  index: number;
  control: Control<any>;
  remove: (index: number) => void;
  onProdiReady?: (index: number) => void; // ← tambahkan
  /**
   * Hanya berisi PT yang punya prodi (sudah difilter di PilihanJurusan).
   */
  perguruanTinggiOptions: Array<{
    value: string;
    label: string;
    has_d1_d2?: boolean;
  }>;
  /**
   * Map idPT → array jenjang prodi yang tersedia.
   * Digunakan untuk:
   *   - menentukan apakah PT bisa dipilih 2× (harus punya D1/D2 dan non-D1/D2)
   *   - memfilter prodi yang ditampilkan berdasarkan sibling slot
   */
  ptProdiMap: Map<string, string[]>;
  /**
   * Semua nilai pilihan saat ini, untuk menghitung sibling dan disable PT.
   */
  allPilihan: Array<{
    perguruan_tinggi?: string;
    program_studi?: string;
  }>;
  setValue: UseFormSetValue<any>;
  isPopulating?: boolean;
  isEmpty?: boolean;
  onResetSlot?: () => void;
};

const PerguruanTinggiItem: FC<Props> = ({
  kondisiButaWarna,
  index,
  control,
  perguruanTinggiOptions,
  ptProdiMap,
  allPilihan,
  setValue,
  isPopulating = false,
  isEmpty = false,
  onResetSlot,
  onProdiReady,
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

  // ── Refs ─────────────────────────────────────────────────────
  const isProdiLoadedRef = useRef(false);
  const prevIdPtRef = useRef<string | undefined>(undefined);
  const pendingProdiValueRef = useRef<string | undefined>(undefined);

  // Reset prodi saat user mengganti PT
  useEffect(() => {
    if (prevIdPtRef.current === undefined) {
      // Mount pertama kali — simpan nilai existing, jangan reset
      prevIdPtRef.current = idPt;
      return;
    }
    if (prevIdPtRef.current === idPt) return;

    // User mengganti PT secara aktif → reset prodi
    prevIdPtRef.current = idPt;
    isProdiLoadedRef.current = false;
    pendingProdiValueRef.current = undefined; // ← bersihkan pending juga
    setValue(`pilihan_program_studi.${index}.program_studi`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [idPt]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch prodi untuk PT yang dipilih ─────────────────────────
  // Data ini sudah di-cache oleh React Query dari batch-fetch di PilihanJurusan,
  // sehingga request ini hampir selalu gratis (tidak ada network trip baru).
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

  /**
   * Filter prodi yang ditampilkan:
   *  1. Buta warna → hanya boleh_buta_warna = "Y"
   *  2. Sibling slot memilih PT yang sama:
   *       - Sibling sudah pilih D1/D2 → slot ini hanya tampilkan non-D1/D2
   *       - Sibling sudah pilih non-D1/D2 → slot ini hanya tampilkan D1/D2
   *
   * Value prodi disimpan sebagai "idProdi#namaProdi#jenjang" agar parent
   * bisa ekstrak jenjang tanpa fetch ulang.
   */
  const filteredProdiOptions = useMemo(() => {
    if (!responseProdi?.data) return [];

    let list = responseProdi.data;

    // Filter buta warna
    if (kondisiButaWarna === "Y") {
      list = list.filter((ps) => ps.boleh_buta_warna === "Y");
    }

    // Filter berdasarkan sibling
    if (idPt) {
      const sibling = allPilihan.find((p, i) => {
        if (i === index) return false;
        return extractIdPT(p?.perguruan_tinggi ?? "") === idPt;
      });

      if (sibling?.program_studi) {
        const siblingJenjang = extractJenjangFromProdiValue(
          sibling.program_studi,
        );
        if (isJenjangD1D2(siblingJenjang)) {
          list = list.filter((ps) => isJenjangNonD1D2(ps.jenjang));
        } else if (isJenjangNonD1D2(siblingJenjang)) {
          list = list.filter((ps) => isJenjangD1D2(ps.jenjang));
        }
      }
    }

    return list.map((ps) => ({
      value: `${ps.id_prodi}#${ps.nama_prodi}#${ps.jenjang}`,
      label: `${ps.nama_prodi} (${ps.jenjang})`,
      kuota: ps.kuota,
    }));
  }, [responseProdi, kondisiButaWarna, idPt, allPilihan, index]);

  /**
   * Disable PT yang tidak bisa dipilih di slot ini.
   *
   * PT di-disable jika:
   *  a. PT biasa (tidak punya D1/D2 dan non-D1/D2 sekaligus) sudah dipilih
   *     di slot lain.
   *  b. PT yang layak 2× sudah dipilih 2× di slot lain.
   *  c. PT yang layak 2× sudah dipilih 1× di slot lain dengan prodi D1/D2,
   *     dan PT ini tidak punya prodi non-D1/D2 (atau sebaliknya) → tidak ada
   *     kombinasi valid tersisa. Kondisi ini tercermin dari filteredProdiOptions
   *     yang akan kosong, jadi kita tidak perlu disable di sini (user bisa pilih
   *     PT, lalu lihat pesan "tidak ada prodi").
   */
  const disabledPtIdSet = useMemo(() => {
    const disabled = new Set<string>();

    perguruanTinggiOptions.forEach((opt) => {
      const optIdPT = extractIdPT(opt.value);
      if (optIdPT === idPt) return; // jangan disable PT yang sudah dipilih di slot ini

      const countInOtherSlots = allPilihan.filter((p, i) => {
        if (i === index) return false;
        return extractIdPT(p?.perguruan_tinggi ?? "") === optIdPT;
      }).length;

      if (countInOtherSlots === 0) return;

      // Cek apakah PT layak dipilih 2×
      const prodiList = ptProdiMap.get(optIdPT) ?? [];
      const ptCanDouble =
        prodiList.some((j) => isJenjangD1D2(j)) &&
        prodiList.some((j) => isJenjangNonD1D2(j));

      if (!ptCanDouble) {
        // PT biasa: sudah dipilih 1× → disable
        disabled.add(optIdPT);
        return;
      }

      if (countInOtherSlots >= 2) {
        // PT dengan D1/D2 sudah dipilih 2× → disable
        disabled.add(optIdPT);
      }
    });

    return disabled;
  }, [perguruanTinggiOptions, allPilihan, index, idPt, ptProdiMap]);

  const filteredPtOptions = useMemo(
    () =>
      perguruanTinggiOptions.map((opt) => ({
        ...opt,
        isDisabled: disabledPtIdSet.has(extractIdPT(opt.value)),
      })),
    [perguruanTinggiOptions, disabledPtIdSet],
  );

  // Mark prodi sudah ter-load
  useEffect(() => {
    if (!idPt) {
      onProdiReady?.(index);
      return;
    }
    if (isFetchingProdi) return; // ← tunggu benar-benar selesai

    isProdiLoadedRef.current = true;
    onProdiReady?.(index);
  }, [idPt, isFetchingProdi]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedProdi = useMemo(
    () =>
      filteredProdiOptions.find((p) => p.value === selectedProdiValue) ?? null,
    [filteredProdiOptions, selectedProdiValue],
  );

  // Reset prodi jika tidak lagi valid setelah filter berubah
  useEffect(() => {
    if (isFetchingProdi) return;
    if (!isProdiLoadedRef.current) return;
    if (isPopulating) return;
    if (!selectedProdiValue) return;
    if (filteredProdiOptions.length === 0 && !!idPt) return;

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

  // BARU: setelah prodi ter-load, cek apakah nilai existing perlu di-restore
  useEffect(() => {
    if (!isProdiLoadedRef.current) return;
    if (isFetchingProdi) return;
    if (isPopulating) return;
    if (!selectedProdiValue) return;
    if (filteredProdiOptions.length === 0) return;

    // Nilai sudah ada di options → tidak perlu apa-apa
    const alreadyValid = filteredProdiOptions.some(
      (opt) => opt.value === selectedProdiValue,
    );

    // Jika tidak valid DAN ada di options dengan id yang sama (format berbeda) → coba exact match by id
    if (!alreadyValid) {
      const selectedId = selectedProdiValue.split("#")[0];
      const match = filteredProdiOptions.find(
        (opt) => opt.value.split("#")[0] === selectedId,
      );
      if (match) {
        setValue(`pilihan_program_studi.${index}.program_studi`, match.value, {
          shouldDirty: false,
        });
      }
    }
  }, [
    isProdiLoadedRef.current,
    isFetchingProdi,
    isPopulating,
    filteredProdiOptions,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResetProdi = () => {
    setValue(`pilihan_program_studi.${index}.program_studi`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ── Label slot dinamis ────────────────────────────────────────
  const slotLabel = useMemo(() => {
    if (!idPt) return `Pilihan ${index + 1}`;
    const hasSibling = allPilihan.some((p, i) => {
      if (i === index) return false;
      return extractIdPT(p?.perguruan_tinggi ?? "") === idPt;
    });
    if (!hasSibling) return `Pilihan ${index + 1}`;

    const currentJenjang = extractJenjangFromProdiValue(
      selectedProdiValue ?? "",
    );
    if (isJenjangD1D2(currentJenjang)) return `Pilihan ${index + 1} (D1/D2)`;
    if (isJenjangNonD1D2(currentJenjang))
      return `Pilihan ${index + 1} (D3/D4/S1)`;
    return `Pilihan ${index + 1} (pasangan)`;
  }, [idPt, index, allPilihan, selectedProdiValue]);

  return (
    <Card className="relative overflow-hidden shadow-none">
      <CardContent className="pt-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {slotLabel}
          </span>
        </div>

        {isEmpty && !isPopulating && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 mb-3">
            <AlertCircle className="w-3 h-3" />
            Program studi belum dipilih
          </span>
        )}

        {selectedPT && !isPopulating && (
          <button
            type="button"
            onClick={onResetSlot}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-muted-foreground border-muted hover:text-destructive hover:border-destructive hover:bg-destructive/5 transition-colors duration-150 mb-3 mr-2">
            <RotateCcw className="w-3 h-3" />
            Reset Pilihan
          </button>
        )}

        {selectedProdiValue && !isPopulating && (
          <button
            type="button"
            onClick={handleResetProdi}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-muted-foreground border-muted hover:text-destructive hover:border-destructive hover:bg-destructive/5 transition-colors duration-150 mb-3">
            <RotateCcw className="w-3 h-3" />
            Reset Program Studi
          </button>
        )}

        <div className="grid grid-cols-1 gap-4">
          <CustSearchableSelect
            name={`pilihan_program_studi.${index}.perguruan_tinggi`}
            control={control}
            label="Perguruan Tinggi"
            options={filteredPtOptions}
            placeholder="Pilih perguruan tinggi"
            isRequired
          />

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
                    ? "Tidak ada program studi tersedia"
                    : "Pilih program studi"
                }
                isRequired
              />
            )}
          </div>
        </div>

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

export { PerguruanTinggiItem };
