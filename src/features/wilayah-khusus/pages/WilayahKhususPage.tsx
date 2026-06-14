import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wilayahKhususService } from "@/services/wilayahKhususService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPinned, Loader2, RefreshCw } from "lucide-react";
import type { IWilayahKhusus } from "@/types/wilayahKhusus";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const WilayahKhususPage: React.FC = () => {
    useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState<IWilayahKhusus | null>(null);
  const [editFlags, setEditFlags] = useState({
    wilayah_3t: false,
    wilayah_perbatasan: false,
    wilayah_papua_nusateng: false,
    wilayah_terluar: false, // <-- Tambahan state
  });

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetData, setResetData] = useState<{ id: number; nama: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1); 
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["wilayah-khusus", page, debouncedSearch],
    queryFn: () => wilayahKhususService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const handleEditClick = (data: IWilayahKhusus) => {
    setSelectedWilayah(data);
    setEditFlags({
      wilayah_3t: data.wilayah_3t,
      wilayah_perbatasan: data.wilayah_perbatasan,
      wilayah_papua_nusateng: data.wilayah_papua_nusateng,
      wilayah_terluar: data.wilayah_terluar, // <-- Mapping state dari data tabel
    });
    setIsEditDialogOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () => wilayahKhususService.update(selectedWilayah!.wilayah_id, editFlags),
    onSuccess: () => {
      toast.success("Berhasil mengubah status wilayah khusus");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wilayah-khusus"] });
    },
    onError: () => toast.error("Gagal mengubah data wilayah"),
  });

  const handleResetClick = (id: number, nama: string) => {
    setResetData({ id, nama });
    setIsResetDialogOpen(true);
  };

  const resetMutation = useMutation({
    mutationFn: (id: number) => wilayahKhususService.reset(id),
    onSuccess: () => {
      toast.success("Berhasil me-reset status wilayah khusus");
      setIsResetDialogOpen(false);
      setResetData(null);
      queryClient.invalidateQueries({ queryKey: ["wilayah-khusus"] });
    },
    onError: () => {
      toast.error("Gagal mereset data wilayah");
      setIsResetDialogOpen(false);
      setResetData(null);
    },
  });

  const confirmReset = () => {
    if (resetData) {
      resetMutation.mutate(resetData.id);
    }
  };

  const columns = useMemo(() => getColumns(handleEditClick, handleResetClick), []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Wilayah Khusus", url: "/master/wilayah-khusus" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <MapPinned className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master Wilayah Khusus</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola status 3T, Perbatasan, Terluar, dan Papua/Nusra untuk Kabupaten/Kota.</p>
            </div>
          </div>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Wilayah</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data wilayah...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <DataTable
                  columns={columns}
                  data={tableData}
                  pageCount={totalPages}
                  pageIndex={page - 1}
                  onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-slate-900">Pengaturan Status Khusus</DialogTitle>
              <DialogDescription className="text-slate-500 text-base mt-2 leading-relaxed">
                Atur kriteria khusus untuk <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{selectedWilayah?.nama_kabkota}</strong>. Centang salah satu opsi di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <Checkbox 
                  id="c_3t" 
                  checked={editFlags.wilayah_3t} 
                  onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_3t: !!checked })} 
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-5 h-5"
                />
                <label htmlFor="c_3t" className="text-sm font-bold text-slate-700 leading-none cursor-pointer">
                  Termasuk Wilayah 3T
                </label>
              </div>
              
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <Checkbox 
                  id="c_perbatasan" 
                  checked={editFlags.wilayah_perbatasan} 
                  onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_perbatasan: !!checked })} 
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-5 h-5"
                />
                <label htmlFor="c_perbatasan" className="text-sm font-bold text-slate-700 leading-none cursor-pointer">
                  Termasuk Wilayah Perbatasan
                </label>
              </div>

              {/* Tambahan UI Checkbox untuk Wilayah Terluar */}
              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <Checkbox 
                  id="c_terluar" 
                  checked={editFlags.wilayah_terluar} 
                  onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_terluar: !!checked })} 
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-5 h-5"
                />
                <label htmlFor="c_terluar" className="text-sm font-bold text-slate-700 leading-none cursor-pointer">
                  Termasuk Wilayah Terluar
                </label>
              </div>

              <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200">
                <Checkbox 
                  id="c_papuanusra" 
                  checked={editFlags.wilayah_papua_nusateng} 
                  onCheckedChange={(checked) => setEditFlags({ ...editFlags, wilayah_papua_nusateng: !!checked })} 
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-5 h-5"
                />
                <label htmlFor="c_papuanusra" className="text-sm font-bold text-slate-700 leading-none cursor-pointer">
                  Termasuk Papua & Nusa Tenggara
                </label>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0"
              >
                Batal
              </Button>
              <Button 
                onClick={() => updateMutation.mutate()} 
                disabled={updateMutation.isPending}
                className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold transition-all"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                  <RefreshCw className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-slate-900">Reset Status?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
                Apakah Anda yakin ingin menghapus status khusus dari wilayah <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{resetData?.nama}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel 
                onClick={() => setIsResetDialogOpen(false)} 
                disabled={resetMutation.isPending} 
                className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0"
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmReset} 
                disabled={resetMutation.isPending} 
                className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-md font-bold"
              >
                {resetMutation.isPending ? "Mereset..." : "Ya, Reset Status"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default WilayahKhususPage;