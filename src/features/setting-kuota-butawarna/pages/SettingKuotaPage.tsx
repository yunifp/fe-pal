/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import { programStudiService } from "@/services/programStudiService";
import type { IProgramStudi } from "@/types/programStudi";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const SettingKuotaPage = () => {
  useRedirectIfHasNotAccess("U"); 

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["program-studi-all", page, debouncedSearch],
    queryFn: () => programStudiService.getAllProgramStudiPagination(page, debouncedSearch),
    staleTime: STALE_TIME,
  });

  const data: IProgramStudi[] = response?.data?.result ?? [];
  const totalPages: number = response?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) toast.error(error.message || "Gagal memuat data.");
  }, [isError, error]);

  const updateMutation = useMutation({
    mutationFn: ({ idProdi, payload }: { idProdi: number; payload: any }) =>
      programStudiService.updateKuotaButaWarna(idProdi, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Berhasil menyimpan perubahan.");
      queryClient.invalidateQueries({ queryKey: ["program-studi-all"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Gagal menyimpan perubahan.");
    },
  });

  const handleUpdateData = (idProdi: number, payload: { kuota?: number; boleh_buta_warna?: "Y" | "N" }) => {
    updateMutation.mutate({ idProdi, payload });
  };

  const columns = useMemo(() => getColumns(handleUpdateData), []);

  return (
    <>
      <CustBreadcrumb items={[{ name: "Master Data" }, { name: "Setting Kuota & Buta Warna" }]} />
      
      <div className="flex justify-between items-center mt-4">
        <p className="text-xl font-semibold uppercase">Kuota Buta Warna Prodi</p>
      </div>

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

export default SettingKuotaPage;