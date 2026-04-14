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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Data" }, { name: "Setting Kuota & Buta Warna" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <SlidersHorizontal className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pengaturan Kuota & Buta Warna
              </h1>
              <p className="text-sm text-slate-500 mt-1">Lakukan penyesuaian kuota penerimaan dan kebijakan buta warna secara langsung pada tabel.</p>
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Program Studi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingKuotaPage;