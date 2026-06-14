import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { referensiWilayahService } from "@/services/referensiWilayahService";
import { DataTable } from "@/components/DataTable";
import { getColumnsWilayah } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
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
import { Map, MapPin, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import type { IReferensiWilayah } from "@/types/wilayah";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const ReferensiWilayahPage: React.FC = () => {
    useRedirectIfHasNotAccess("R"); 

  const { kodePro, kodeKab } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const level = kodeKab ? "kecamatan" : kodePro ? "kabkota" : "provinsi";

  const [pageIndex, setPageIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>(""); 
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWilayah, setSelectedWilayah] = useState<IReferensiWilayah | null>(null);
  const [editName, setEditName] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; nama: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPageIndex(0); 
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    setPageIndex(0);
    setSearchTerm("");
    setDebouncedSearch("");
  }, [level, kodePro, kodeKab]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["wilayah", level, kodePro, kodeKab, pageIndex, debouncedSearch],
    queryFn: () => {
      const currentPage = pageIndex + 1; 
      
      if (level === "kecamatan") return referensiWilayahService.getKecamatanPaginated(Number(kodeKab), currentPage, debouncedSearch);
      if (level === "kabkota") return referensiWilayahService.getKabKotaPaginated(Number(kodePro), currentPage, debouncedSearch);
      return referensiWilayahService.getProvinsiPaginated(currentPage, debouncedSearch);
    },
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const handleEditClick = (data: IReferensiWilayah) => {
    setSelectedWilayah(data);
    setEditName(data.nama_wilayah);
    setIsEditDialogOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () => referensiWilayahService.updateWilayah(selectedWilayah!.wilayah_id, editName),
    onSuccess: () => {
      toast.success("Berhasil mengubah nama wilayah");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
    },
    onError: () => toast.error("Gagal mengubah data wilayah"),
  });

  const handleDeleteClick = (id: number, nama: string) => {
    setDeleteData({ id, nama });
    setIsDeleteDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => referensiWilayahService.deleteWilayah(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus wilayah");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["wilayah"] });
    },
    onError: () => {
      toast.error("Gagal menghapus data wilayah");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
    },
  });

  const confirmDelete = () => {
    if (deleteData) {
      deleteMutation.mutate(deleteData.id);
    }
  };

  const columns = useMemo(() => getColumnsWilayah(level, handleEditClick, handleDeleteClick), [level]);

  const breadcrumbItems = [
    { name: "Master Wilayah", url: "/master/referensi-wilayah" }
  ];
  if (kodePro) breadcrumbItems.push({ name: "Kabupaten / Kota", url: `/master/referensi-wilayah/${kodePro}` });
  if (kodeKab) breadcrumbItems.push({ name: "Kecamatan", url: `/master/referensi-wilayah/${kodePro}/${kodeKab}` });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={breadcrumbItems} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              {level === "provinsi" ? <Map className="h-7 w-7 text-emerald-600" /> : <MapPin className="h-7 w-7 text-emerald-600" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
                Master {level === "kabkota" ? "Kabupaten/Kota" : level}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Kelola hierarki data kewilayahan secara terstruktur.</p>
            </div>
          </div>
          
          {level !== "provinsi" && (
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-slate-400" />
              Kembali ke {level === "kabkota" ? "Provinsi" : "Kabupaten"}
            </Button>
          )}
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800 capitalize">
              Daftar {level === "kabkota" ? "Kabupaten/Kota" : level}
            </CardTitle>
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
                  pageIndex={pageIndex}
                  onPageChange={(newPageIndex) => setPageIndex(newPageIndex)}
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900">Ubah Nama Wilayah</DialogTitle>
              <DialogDescription className="text-slate-500">
                Silakan masukkan nama wilayah baru untuk data yang dipilih.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 mb-8">
              <label className="text-sm font-bold text-slate-700 ml-1">Nama Wilayah Baru</label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Masukkan nama wilayah..." 
                className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0"
              >
                Batal
              </Button>
              <Button 
                onClick={() => updateMutation.mutate()} 
                disabled={updateMutation.isPending || !editName.trim()}
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

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                  <Trash2 className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-slate-900">Hapus Wilayah?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
                Apakah Anda yakin ingin menghapus wilayah <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.nama}</strong>? Data yang dihapus tidak dapat dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-2">
              <AlertDialogCancel 
                onClick={() => setIsDeleteDialogOpen(false)} 
                disabled={deleteMutation.isPending} 
                className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0"
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete} 
                disabled={deleteMutation.isPending} 
                className="rounded-xl h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-md font-bold"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Data"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default ReferensiWilayahPage;