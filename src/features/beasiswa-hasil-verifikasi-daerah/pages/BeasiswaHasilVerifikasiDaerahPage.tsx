import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { beasiswaService } from "@/services/beasiswaService";
import type { ITrxBeasiswa } from "@/types/beasiswa";
import BeasiswaAktifAksi from "../components/BeasiswaAktifAksi";
import WilayahFilter from "../components/WilayahFilter";

const BeasiswaHasilVerifikasiDaerahPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("");
  const [selectedKabKot, setSelectedKabKot] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  // Setup untuk mendapatkan beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Setup untuk fetch data berdasarkan wilayah
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "trx-beasiswa-verifikasi-daerah",
      beasiswaAktif?.id,
      page,
      debouncedSearch,
      selectedProvinsi,
      selectedKabKot,
    ],
    retry: false,
    enabled: !!beasiswaAktif?.id && !!selectedKabKot,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return beasiswaService.getTransaksiBeasiswaByPaginationSeleksiAdministrasiDaerah(
        beasiswaAktif?.id ?? 0,
        page,
        debouncedSearch,
        selectedProvinsi,
        selectedKabKot,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // Reset page saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [selectedProvinsi, selectedKabKot, debouncedSearch]);

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <CustBreadcrumb items={[{ name: "Hasil Verifikasi Daerah" }]} />

      <p className="text-xl font-semibold mt-4">Hasil Verifikasi Daerah</p>

      <div className="mt-3">
        <div className="mb-6">
          <BeasiswaAktifAksi beasiswa={beasiswaAktif} />
        </div>

        {beasiswaAktif && (
          <>
            <WilayahFilter
              selectedProvinsi={selectedProvinsi}
              selectedKabKot={selectedKabKot}
              onProvinsiChange={setSelectedProvinsi}
              onKabKotChange={setSelectedKabKot}
            />

            {selectedKabKot ? (
              <DataTable
                isLoading={isLoading}
                columns={columns}
                data={data}
                pageCount={totalPages}
                pageIndex={page - 1}
                onPageChange={(newPage) => setPage(newPage + 1)}
                searchValue={search}
                onSearchChange={(value) => setSearch(value)}
              />
            ) : (
              <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
                {selectedProvinsi
                  ? "Silakan pilih Kabupaten/Kota untuk melihat data pendaftar"
                  : "Silakan pilih Provinsi dan Kabupaten/Kota untuk melihat data pendaftar"}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BeasiswaHasilVerifikasiDaerahPage;
