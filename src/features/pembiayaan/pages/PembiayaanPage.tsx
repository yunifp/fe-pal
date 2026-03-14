import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "../../../components/DataTable";
import CustBreadcrumb from "@/components/CustBreadCrumb";

import { STALE_TIME } from "@/constants/reactQuery";
import { useDebounce } from "@/hooks/useDebounce";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { useForm } from "react-hook-form";
import { masterService } from "@/services/masterService";
import { pksService } from "@/services/pksService";
import type { ITrxPks } from "@/types/pks";
import FilterLembagaPendidikan from "@/components/pks/FilterLembagaPendidikan";
import { getColumns } from "../components/columns";

const PembiayaanPage = () => {
  useRedirectIfHasNotAccess("R");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  // Untuk Filter

  const { control, watch } = useForm({
    defaultValues: {
      lpId: "",
    },
  });

  const lpId = watch("lpId");

  // Fetch data pengguna
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["mahasiswa-pks", page, debouncedSearch, lpId],
    queryFn: () => pksService.getTrxByPagination(page, debouncedSearch, lpId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const data: ITrxPks[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  // Filter lembaga pendidikan
  const { data: lembagaPendidikanData } = useQuery({
    queryKey: ["lembaga-pendidikan"],
    queryFn: () => masterService.getPerguruanTinggi(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const lembagaPendidikanOptions = useMemo(() => {
    return (
      lembagaPendidikanData?.data?.map((data) => ({
        value: String(data.id_pt),
        label: data.nama_pt,
      })) || []
    );
  }, [lembagaPendidikanData]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Terjadi kesalahan saat memuat data.");
    }
  }, [isError, error]);

  const columns = useMemo(() => getColumns(), []);

  return (
    <div>
      <CustBreadcrumb
        items={[
          {
            name: "Pembiayaan",
            url: "/database/pembiayaan",
          },
        ]}
      />

      <p className="text-xl font-semibold mt-4">Pembiayaan</p>

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
          leftHeaderContent={
            <FilterLembagaPendidikan
              control={control}
              options={lembagaPendidikanOptions}
            />
          }
        />
      </div>
    </div>
  );
};

export default PembiayaanPage;
