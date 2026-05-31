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
// Import tambahan untuk Combobox
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Link2, Search, Filter, Check, ChevronsUpDown } from "lucide-react";
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
  
  // State untuk mengontrol buka/tutup popover kampus
  const [openPt, setOpenPt] = useState(false);

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
  const totalPages: number = mappingResponse?.data?.total_pages || 1;

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
      toast.success(res?.message || "Hubungan berhasil diperbarui.");
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
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Data" }, { name: "Setting Jurusan - Prodi" }]} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Link2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Setting Jurusan - Prodi</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola relasi antara jurusan asal sekolah dengan program studi.</p>
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 pt-6 px-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-lg font-bold text-slate-800">Filter Pencarian</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-end justify-end gap-4">
              
              {/* Dropdown Jurusan (Tetap menggunakan Select biasa) */}
              <div className="w-full sm:w-[280px] space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Jurusan Sekolah <span className="text-rose-500">*</span></Label>
                <Select value={selectedJurusanId} onValueChange={setSelectedJurusanId}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium">
                    <SelectValue placeholder="Pilih Jurusan Sekolah..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                    {listJurusan.map((j: any) => (
                      <SelectItem key={j.id_jurusan_sekolah} value={String(j.id_jurusan_sekolah)} className="font-medium">
                        {j.jurusan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dropdown Perguruan Tinggi (Menggunakan Combobox/Searchable) */}
              <div className="w-full sm:w-[280px] space-y-2">
                <Label className="text-sm font-bold text-slate-700 ml-1">Filter Perguruan Tinggi</Label>
                <Popover open={openPt} onOpenChange={setOpenPt}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPt}
                      className="w-full h-10 justify-between rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-100 font-medium text-slate-700"
                    >
                      <span className="truncate">
                        {selectedPtId === "all"
                          ? "-- Semua Kampus --"
                          : listPt.find((pt: any) => String(pt.id_pt) === selectedPtId)?.nama_pt || "Pilih Kampus..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0 rounded-xl border-slate-200 shadow-lg">
                    <Command>
                      <CommandInput placeholder="Cari kampus..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Kampus tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="-- Semua Kampus --"
                            onSelect={() => {
                              setSelectedPtId("all");
                              setOpenPt(false);
                            }}
                            className="font-bold text-emerald-700 cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedPtId === "all" ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            -- Semua Kampus --
                          </CommandItem>
                          {listPt.map((pt: any) => (
                            <CommandItem
                              key={pt.id_pt}
                              value={pt.nama_pt}
                              onSelect={() => {
                                setSelectedPtId(String(pt.id_pt));
                                setOpenPt(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedPtId === String(pt.id_pt) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {pt.nama_pt}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Button 
                onClick={handleTampilkan} 
                className="h-10 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all w-full sm:w-auto"
              >
                <Search className="w-4 h-4 mr-2" /> Tampilkan
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeJurusanId ? (
          <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">Daftar Program Studi</CardTitle>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Hubungkan jurusan sekolah dengan daftar prodi yang tersedia.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                  <div className="space-y-0.5">
                    <Label htmlFor="mapped-only" className="cursor-pointer text-sm font-bold text-slate-700 select-none">
                      Terhubung Saja
                    </Label>
                    <p className="text-[10px] text-slate-400 font-medium leading-none">Filter prodi aktif</p>
                  </div>
                  <Switch
                    id="mapped-only"
                    checked={mappedOnly}
                    onCheckedChange={(checked) => {
                      setMappedOnly(checked);
                      setPage(1); 
                    }}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>
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
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
              <Filter className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Pilih Jurusan</h3>
            <p className="text-slate-500 text-center max-w-sm mt-3 text-base leading-relaxed">
              Silakan pilih <strong className="text-emerald-700">Jurusan Sekolah</strong> pada panel filter di atas untuk melihat data pemetaan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingJurusanProdiPage;