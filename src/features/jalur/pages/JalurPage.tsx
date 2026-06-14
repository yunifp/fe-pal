import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jalurMasterService } from "@/services/jalurMasterService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Route, Trash2, Loader2 } from "lucide-react";
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
import type { IJalurMaster } from "@/types/jalurMaster";
import useRedirectIfHasNotAccess from "@/hooks/useRedirectIfHasNotAccess";

const JalurPage: React.FC = () => {
    useRedirectIfHasNotAccess("R"); 

  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(""); 
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ jalur: "" });

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
    queryKey: ["master-jalur", page, debouncedSearch],
    queryFn: () => jalurMasterService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const createMutation = useMutation({
    mutationFn: () => jalurMasterService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data jalur");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => jalurMasterService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data jalur");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jalurMasterService.delete(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus data jalur");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["master-jalur"] });
    },
    onError: () => {
      toast.error("Gagal menghapus data");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
    },
  });

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({ jalur: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IJalurMaster) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({ jalur: data.jalur });
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
    if (!formData.jalur.trim()) {
      return toast.warning("Nama jalur tidak boleh kosong");
    }
    
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({ jalur: "" });
  };

  const columns = useMemo(() => getColumns(page, limit, handleEditClick, handleDeleteClick), [page, limit]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master Jalur", url: "/master/jalur" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <Route className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master Jalur</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola data referensi jalur pendaftaran secara terpusat.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreate} 
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Data Jalur
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Jalur</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && tableData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium mt-5 animate-pulse">Memuat data jalur...</p>
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
                {modalMode === "create" ? "Tambah Data Jalur" : "Ubah Data Jalur"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Silakan {modalMode === "create" ? "masukkan nama jalur baru" : "ubah nama jalur yang dipilih"}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="jalur" className="text-sm font-bold text-slate-700 ml-1">Nama Jalur</Label>
                <Input
                  id="jalur"
                  value={formData.jalur}
                  onChange={(e) => setFormData({ ...formData, jalur: e.target.value })}
                  placeholder="Masukkan nama jalur..."
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
                  autoFocus
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-3">
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
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.jalur.trim()}
                  className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold transition-all"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Data"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                  <Trash2 className="h-7 w-7" />
                </div>
                <AlertDialogTitle className="text-2xl font-bold text-slate-900">Hapus Data?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
                Apakah Anda yakin ingin menghapus jalur <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.nama}</strong>? Data yang dihapus tidak dapat dikembalikan.
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

export default JalurPage;