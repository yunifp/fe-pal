/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { STALE_TIME } from "@/constants/reactQuery";
import { settingJurusanProdiService } from "@/services/settingJurusanProdiService";
import { masterService } from "@/services/masterService"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { IProgramStudi } from "@/types/programStudi";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const SettingJurusanProdiPage = () => {
  useRedirectIfHasNotAccess("U");

  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedJurusanId, setSelectedJurusanId] = useState<string>("");
  const [selectedPtId, setSelectedPtId] = useState<string>("all");

  const [activeJurusanId, setActiveJurusanId] = useState<number | null>(null);
  const [activePtId, setActivePtId] = useState<string>("all");
  
  const [mappedOnly, setMappedOnly] = useState<boolean>(false);

  const { data: jurusanResponse } = useQuery({
    queryKey: ["jurusan-sekolah-all-dropdown"],
    queryFn: masterService.getAllJurusanSekolah, 
    staleTime: STALE_TIME,
  });
  const listJurusan = jurusanResponse?.data ?? [];

  const { data: ptResponse } = useQuery({
    queryKey: ["perguruan-tinggi-all-dropdown"],
    queryFn: masterService.getPerguruanTinggi, 
    staleTime: STALE_TIME,
  });
  const listPt = ptResponse?.data ?? [];

  const { data: mappingResponse, isLoading, isError, error } = useQuery({
    queryKey: ["mapping-jurusan-prodi", activeJurusanId, activePtId, page, debouncedSearch, mappedOnly],
    queryFn: () => settingJurusanProdiService.getMappingJurusanProdi(
      activeJurusanId as number, 
      page, 
      debouncedSearch,
      mappedOnly,
      activePtId === "all" ? undefined : activePtId
    ),
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
    
    onMutate: async (newPayload) => {
      const queryKey = ["mapping-jurusan-prodi", activeJurusanId, activePtId, page, debouncedSearch, mappedOnly];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (oldData: any) => {
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
      return { previousData, queryKey };
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "Status mapping berhasil diperbarui.");
    },
    onError: (err: any, _, context) => {
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
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

  const columns = useMemo(() => getColumns(handleToggleMapping, mappedOnly), [handleToggleMapping, mappedOnly]);

  const handleTampilkan = () => {
    if (!selectedJurusanId) {
      toast.warning("Pilih Jurusan Sekolah terlebih dahulu!");
      return;
    }
    setActiveJurusanId(Number(selectedJurusanId));
    setActivePtId(selectedPtId);
    setPage(1); 
  };

  return (
    <>
      <CustBreadcrumb items={[{ name: "Master Data" }, { name: "Setting Jurusan - Prodi" }]} />
      
      <div className="flex justify-between items-center mt-4 mb-5">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Setting Jurusan - Prodi</h2>
      </div>

      {/* FILTER CARD */}
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
          <CardTitle className="text-base font-semibold text-gray-800">Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:justify-end">
            
            {/* Dropdown Jurusan Sekolah */}
            <div className="md:col-span-5 space-y-2">
              <Label className="text-gray-700 font-medium">Jurusan Sekolah <span className="text-red-500">*</span></Label>
              <Select value={selectedJurusanId} onValueChange={setSelectedJurusanId}>
                <SelectTrigger className="bg-white">
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

            {/* Dropdown Filter Kampus */}
            <div className="md:col-span-5 space-y-2">
              <Label className="text-gray-700 font-medium">Filter Perguruan Tinggi</Label>
              <Select value={selectedPtId} onValueChange={setSelectedPtId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="-- Semua Kampus --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Semua Kampus --</SelectItem>
                  {listPt.map((pt: any) => (
                    <SelectItem key={pt.id_pt} value={String(pt.id_pt)}>
                      {pt.nama_pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tombol Tampilkan */}
            <div className="md:col-span-2">
              <Button onClick={handleTampilkan} className="w-full h-10 shadow-sm" size="default">
                Tampilkan
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* TABLE SECTION ATAU EMPTY STATE */}
      {activeJurusanId ? (
        <Card className="shadow-sm border-gray-200 overflow-hidden mb-8">
          {/* Table Header & Toggle Switch */}
          <CardHeader className="bg-white pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Daftar Program Studi</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Centang untuk menghubungkan dengan jurusan terpilih.</p>
            </div>
            
            {/* Panel Toggle Mode */}
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
              <Label htmlFor="mapped-only" className="cursor-pointer text-sm font-semibold text-gray-700 select-none">
                Lihat yang Terhubung Saja
              </Label>
              <Switch
                id="mapped-only"
                checked={mappedOnly}
                onCheckedChange={(checked) => {
                  setMappedOnly(checked);
                  setPage(1); 
                }}
              />
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      ) : (
        /* EMPTY STATE (Tampil jika Jurusan belum dipilih/ditampilkan) */
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5 shadow-sm border border-gray-200">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700">Belum Ada Data Ditampilkan</h3>
          <p className="text-sm text-gray-500 text-center max-w-md mt-2 leading-relaxed">
            Silakan pilih <span className="font-semibold text-gray-600">Jurusan Sekolah</span> pada filter di atas dan klik tombol <span className="font-semibold text-gray-600">"Tampilkan"</span> untuk mulai mengatur relasi Program Studi.
          </p>
        </div>
      )}
    </>
  );
};

export default SettingJurusanProdiPage;