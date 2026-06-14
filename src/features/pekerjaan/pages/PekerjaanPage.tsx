import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pekerjaanService } from "@/services/pekerjaanService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Trash2, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import type { IPekerjaan } from "@/types/pekerjaan";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const PekerjaanPage: React.FC = () => {
    useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_pekerjaan: "" });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; nama: string } | null>(null);

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
    queryKey: ["pekerjaan", page, debouncedSearch],
    queryFn: () => pekerjaanService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const createMutation = useMutation({
    mutationFn: () => pekerjaanService.create({ ...formData, is_active: "Y" }),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data pekerjaan");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["pekerjaan"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => pekerjaanService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data pekerjaan");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["pekerjaan"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pekerjaanService.delete(id),
    onSuccess: () => {
      toast.success("Data pekerjaan berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["pekerjaan"] });
    },
    onError: () => {
      toast.error("Gagal menghapus data");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
    },
  });

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({ nama_pekerjaan: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IPekerjaan) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({ nama_pekerjaan: data.nama_pekerjaan });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nama: string) => {
    setDeleteData({ id, nama });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteData) deleteMutation.mutate(deleteData.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pekerjaan.trim()) return toast.warning("Nama pekerjaan tidak boleh kosong");
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({ nama_pekerjaan: "" });
  };

  const columns = useMemo(() => getColumns(page, limit, handleEditClick, handleDeleteClick), [page, limit]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Pekerjaan", url: "/master/pekerjaan" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Briefcase className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master Pekerjaan</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola data referensi pekerjaan orang tua / wali pendaftar.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreate} 
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Pekerjaan
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data...</p>
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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {modalMode === "create" ? "Tambah Data Pekerjaan" : "Ubah Data Pekerjaan"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Masukkan nama referensi pekerjaan yang valid untuk sistem.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama_pekerjaan" className="text-sm font-bold text-slate-700 ml-1">Nama Pekerjaan</Label>
                <Input
                  id="nama_pekerjaan"
                  value={formData.nama_pekerjaan}
                  onChange={(e) => setFormData({ ...formData, nama_pekerjaan: e.target.value })}
                  placeholder="Contoh: ASN, Wiraswasta, dll"
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
                  autoFocus
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeModal}
                  className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 mt-0"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.nama_pekerjaan.trim()}
                  className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold transition-all"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan</>
                  ) : "Simpan Data"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                  <Trash2 className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-slate-900">Hapus Data?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
                Apakah Anda yakin ingin menghapus data pekerjaan <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default PekerjaanPage;