import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sukuMasterService } from "@/services/sukuMasterService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users, Trash2, Loader2 } from "lucide-react";
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
import type { ISukuMaster } from "@/types/suku";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const SukuPage: React.FC = () => {
    useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<{ nama_suku: string; is_active: "Y" | "N" }>({
    nama_suku: "",
    is_active: "Y",
  });

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
    queryKey: ["master-suku", page, debouncedSearch],
    queryFn: () => sukuMasterService.getPaginated(page, debouncedSearch, limit),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const createMutation = useMutation({
    mutationFn: () => sukuMasterService.create(formData),
    onSuccess: () => {
      toast.success("Data berhasil ditambahkan");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => sukuMasterService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Data berhasil diperbarui");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sukuMasterService.delete(id),
    onSuccess: () => {
      toast.success("Data berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => {
      toast.error("Gagal menghapus data");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
    },
  });

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({ nama_suku: "", is_active: "Y" });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: ISukuMaster) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({ nama_suku: data.nama_suku, is_active: data.is_active });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nama: string) => {
    setDeleteData({ id, nama });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      deleteMutation.mutate(deleteData.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_suku.trim()) return toast.warning("Nama Suku wajib diisi");
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
  };

  const columns = useMemo(() => getColumns(page, limit, handleEditClick, handleDeleteClick), [page, limit]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Suku", url: "/master/suku" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Users className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master Suku</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola data referensi kesukuan pendaftar secara terpusat.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreate} 
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Suku
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Suku</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data suku...</p>
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
                {modalMode === "create" ? "Tambah Data Suku" : "Ubah Data Suku"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Silakan masukkan informasi nama suku dan status aktif di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama_suku" className="text-sm font-bold text-slate-700 ml-1">Nama Suku</Label>
                <Input
                  id="nama_suku"
                  value={formData.nama_suku}
                  onChange={(e) => setFormData({ ...formData, nama_suku: e.target.value })}
                  placeholder="Contoh: Suku Jawa"
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-sm font-bold text-slate-700 ml-1">Status Aktif</Label>
                <select
                  id="is_active"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value as "Y" | "N" })}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                  }}
                >
                  <option value="Y">Aktif (Ya)</option>
                  <option value="N">Tidak Aktif (Tidak)</option>
                </select>
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
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.nama_suku.trim()}
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
                Apakah Anda yakin ingin menghapus data suku <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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

export default SukuPage;