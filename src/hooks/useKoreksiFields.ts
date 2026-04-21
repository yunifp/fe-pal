import { useQuery } from "@tanstack/react-query";
import { beasiswaService } from "@/services/beasiswaService";
import { STALE_TIME } from "@/constants/reactQuery";
import { useMemo } from "react";

export const useKoreksiFields = (
  idTrxBeasiswa: number,
  enabled: boolean = true,
) => {
  const { data } = useQuery({
    queryKey: ["koreksi-pendaftar", idTrxBeasiswa],
    queryFn: () => beasiswaService.getKoreksiPendaftar(idTrxBeasiswa),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Set field names yang perlu dikoreksi
  const koreksiFieldSet = useMemo(() => {
    const list = (data?.data ?? []).filter((k) => k.is_resolved === "N");
    return new Set(list.map((k) => k.kategori));
  }, [data]);

  // Map field → catatan
  const koreksiCatatanMap = useMemo(() => {
    const list = (data?.data ?? []).filter((k) => k.is_resolved === "N");
    return new Map(list.map((k) => [k.kategori, k.catatan]));
  }, [data]);

  // Helper: apakah field perlu dikoreksi
  const needsKoreksi = (fieldName: string) => koreksiFieldSet.has(fieldName);

  // Helper: apakah field harus disabled (ada data koreksi tapi field ini tidak masuk)
  // Hanya berlaku jika mode perlu perbaikan (ada koreksi aktif)
  const isDisabled = (fieldName: string) => {
    if (koreksiFieldSet.size === 0) return false; // tidak ada koreksi, semua bebas
    return !koreksiFieldSet.has(fieldName); // tidak masuk daftar koreksi → disabled
  };

  const getCatatan = (fieldName: string) =>
    koreksiCatatanMap.get(fieldName) ?? null;

  return { needsKoreksi, isDisabled, getCatatan, koreksiFieldSet };
};
