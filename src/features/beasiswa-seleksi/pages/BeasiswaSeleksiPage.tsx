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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import BeasiswaAktifAksi from "../components/BeasiswaAktifAksi";

const BeasiswaSeleksiPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [filterIdFlow, setFilterIdFlow] = useState<string>("all");
  const [filterIdJalur, setFilterIdJalur] = useState<string>("all");

  const debouncedSearch = useDebounce(search, 500);

  // Fetch beasiswa aktif
  const { data: responseBeasiswaAktif } = useQuery({
    queryKey: ["beasiswa-aktif"],
    queryFn: () => beasiswaService.getBeasiswaAktif(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const beasiswaAktif = responseBeasiswaAktif?.data ?? null;

  // Fetch opsi flow/status
  const { data: responseFlow } = useQuery({
    queryKey: ["flow-beasiswa"],
    queryFn: () => beasiswaService.getFlowBeasiswa(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Fetch opsi jalur
  const { data: responseJalur } = useQuery({
    queryKey: ["jalur"],
    queryFn: () => beasiswaService.getJalur(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  // Fetch data tabel
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["trx-beasiswa", beasiswaAktif?.id, page, debouncedSearch],
    retry: false,
    enabled: !!beasiswaAktif?.id,
    refetchOnWindowFocus: false,
    queryFn: () =>
      beasiswaService.getTransaksiBeasiswaByPaginationSeleksiAdministrasi(
        beasiswaAktif?.id ?? 0,
        page,
        debouncedSearch,
      ),
    staleTime: STALE_TIME,
  });

  const allData: ITrxBeasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // Filter client-side berdasarkan flow dan jalur
  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      const flowMatch =
        filterIdFlow === "all" ? true : row.id_flow === Number(filterIdFlow);

      const jalurMatch =
        filterIdJalur === "all" ? true : row.id_jalur === Number(filterIdJalur);

      return flowMatch && jalurMatch;
    });
  }, [allData, filterIdFlow, filterIdJalur]);

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  useEffect(() => {
    setPage(1);
  }, [filterIdFlow, filterIdJalur, debouncedSearch]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <CustBreadcrumb items={[{ name: "Seleksi Administratif" }]} />

      <p className="text-xl font-semibold mt-4">Seleksi Administratif</p>

      <div className="mt-3">
        <div className="mb-6">
          {/* <BeasiswaAktifAksi beasiswa={beasiswaAktif} /> */}
        </div>
        {beasiswaAktif && (
          <DataTable
            isLoading={isLoading}
            columns={columns}
            data={filteredData}
            pageCount={totalPages}
            pageIndex={page - 1}
            onPageChange={(newPage) => setPage(newPage + 1)}
            searchValue={search}
            onSearchChange={(value) => setSearch(value)}
            leftHeaderContent={
              <>
                {/* Filter Status / Flow */}
                <Select value={filterIdFlow} onValueChange={setFilterIdFlow}>
                  <SelectTrigger className="w-[175px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {(responseFlow?.data ?? []).map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.flow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filter Jalur */}
                <Select value={filterIdJalur} onValueChange={setFilterIdJalur}>
                  <SelectTrigger className="w-[175px]">
                    <SelectValue placeholder="Filter Jalur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jalur</SelectItem>
                    {(responseJalur?.data ?? []).map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.jalur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            }
          />
        )}
      </div>
    </>
  );
};

export default BeasiswaSeleksiPage;
