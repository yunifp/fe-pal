/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner"; // <-- Toast dari sonner
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import { settingJurusanProdiService } from "@/services/settingJurusanProdiService";
import { masterService } from "@/services/masterService"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { IProgramStudi } from "@/types/programStudi";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";
import { Card, CardContent } from "@/components/ui/card";

const SettingJurusanProdiPage = () => {
  useRedirectIfHasNotAccess("U");

  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedJurusanId, setSelectedJurusanId] = useState<string>("");
  const [activeJurusanId, setActiveJurusanId] = useState<number | null>(null);

  const { data: jurusanResponse } = useQuery({
    queryKey: ["jurusan-sekolah-all-dropdown"],
    queryFn: masterService.getAllJurusanSekolah, 
    staleTime: STALE_TIME,
  });
  const listJurusan = jurusanResponse?.data ?? [];

  const { data: mappingResponse, isLoading, isError, error } = useQuery({
    queryKey: ["mapping-jurusan-prodi", activeJurusanId, page, debouncedSearch],
    queryFn: () => settingJurusanProdiService.getMappingJurusanProdi(activeJurusanId as number, page, debouncedSearch),
    enabled: !!activeJurusanId,
    staleTime: STALE_TIME,
  });

  const data: IProgramStudi[] = mappingResponse?.data?.result ?? [];
  const totalPages: number = mappingResponse?.data?.total_pages ?? 0;

  useEffect(() => {
    if (isError) toast.error(error.message || "Gagal memuat data mapping prodi.");
  }, [isError, error]);

  const toggleMutation = useMutation({
    mutationFn: (payload: { id_jurusan_sekolah: number; id_pt: number; id_prodi: number; is_mapped: boolean }) =>
      settingJurusanProdiService.toggleMappingProdi(payload),
    
    // OPTIMISTIC UPDATE: Ubah UI secara instan
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: ["mapping-jurusan-prodi", activeJurusanId] });
      const previousData = queryClient.getQueryData(["mapping-jurusan-prodi", activeJurusanId, page, debouncedSearch]);
      
      queryClient.setQueryData(["mapping-jurusan-prodi", activeJurusanId, page, debouncedSearch], (oldData: any) => {
        if (!oldData?.data?.result) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            result: oldData.data.result.map((prodi: IProgramStudi) => 
              prodi.id_prodi === newPayload.id_prodi ? { ...prodi, is_mapped: newPayload.is_mapped } : prodi
            )
          }
        };
      });
      return { previousData };
    },

    // TAMBAHAN: Tampilkan notifikasi sukses saat backend berhasil merespons
    onSuccess: (res: any) => {
      toast.success(res?.message || "Status mapping berhasil diperbarui.");
    },

    onError: (err: any, _, context) => {
      queryClient.setQueryData(["mapping-jurusan-prodi", activeJurusanId, page, debouncedSearch], context?.previousData);
      toast.error(err?.response?.data?.message || "Gagal mengubah status mapping.");
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mapping-jurusan-prodi", activeJurusanId] });
    },
  });

  const handleToggleMapping = useCallback((idPt: number, idProdi: number, currentStatus: boolean) => {
    if (!activeJurusanId) return;
    
    toggleMutation.mutate({
      id_jurusan_sekolah: activeJurusanId,
      id_pt: idPt,
      id_prodi: idProdi,
      is_mapped: !currentStatus 
    });
  }, [activeJurusanId, toggleMutation]);

  const columns = useMemo(() => getColumns(handleToggleMapping), [handleToggleMapping]);

  const handleTampilkan = () => {
    if (!selectedJurusanId) {
      toast.warning("Pilih Jurusan Sekolah terlebih dahulu!");
      return;
    }
    setActiveJurusanId(Number(selectedJurusanId));
    setPage(1); 
  };

  return (
    <>
      <CustBreadcrumb items={[{ name: "Master Data" }, { name: "Setting Jurusan - Prodi" }]} />
      
      <div className="flex justify-between items-center mt-4 mb-4">
        <p className="text-xl font-semibold uppercase">Setting Jurusan Sekolah - Prodi</p>
      </div>

      <Card className="mb-6 shadow-sm border-gray-200">
        <CardContent className="pt-6 flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full md:max-w-md space-y-2">
            <Label>Pilih Jurusan Sekolah</Label>
            <Select value={selectedJurusanId} onValueChange={setSelectedJurusanId}>
              <SelectTrigger>
                <SelectValue placeholder="-- Pilih Jurusan Sekolah --" />
              </SelectTrigger>
              <SelectContent>
                {listJurusan.map((j: any) => (
                  <SelectItem key={j.id_jurusan_sekolah} value={String(j.id_jurusan_sekolah)}>
                    {j.jurusan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleTampilkan} className="w-full md:w-auto">
            Tampilkan
          </Button>
        </CardContent>
      </Card>

      {activeJurusanId && (
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
      )}
    </>
  );
};

export default SettingJurusanProdiPage;