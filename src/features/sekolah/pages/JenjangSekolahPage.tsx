import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../../../components/DataTable";
import { getColumns } from "../components/columns_jenjang_sekolah";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { masterService } from "@/services/masterService";
import type { IJenjangSekolah } from "@/types/master";

const JenjangSekolahPage = () => {
  useRedirectIfHasNotAccess("R");

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
    queryKey: ["jenjang-sekolah", page, debouncedSearch],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: () => {
      return masterService.getJenjangSekolahByPagination(page, debouncedSearch);
    },
    staleTime: STALE_TIME,
  });

  const data: IJenjangSekolah[] = response?.data?.result ?? [];
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
      <CustBreadcrumb
        items={[{ name: "Jenjang Sekolah", url: "/sekolah/jenjang-sekolah" }]}
      />

      <p className="text-xl font-semibold mt-4">Jenjang Sekolah</p>

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

export default JenjangSekolahPage;
