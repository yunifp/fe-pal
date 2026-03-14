import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { validitasKeaktifanMahasiswaService } from "@/services/validitasKeaktifanMahasiswaService";
import type { IValiditasKeaktifanMahasiswa } from "@/types/validitasKeaktifanMahasiswa";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/DataTable";

const DataList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Setup untuk fetch data::start
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["validitas-keaktifan-mahasiswa", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return validitasKeaktifanMahasiswaService.getByPagination(
        page,
        debouncedSearch,
      );
    },
    staleTime: STALE_TIME,
  });

  const data: IValiditasKeaktifanMahasiswa[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;
  // Setup untuk fetch data::end

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <>
      <p className="text-xl font-semibold mt-4">
        Riwayat Validitas Keaktifan Bulanan
      </p>
      <div className="mt-3">
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
      </div>
    </>
  );
};

export default DataList;
