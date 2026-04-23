/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dokumenKhususService } from "@/services/dokumenKhususService";
import { jalurMasterService } from "@/services/jalurMasterService"; 
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import { Plus, FileKey, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import type { IDokumenKhusus } from "@/types/dokumenkhusus";

const DokumenKhususPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Omit<IDokumenKhusus, "id" | "created_at" | "updated_at" | "jalur_ref">>({
    id_jalur: 0,
    persyaratan: "",
    status_aktif: "Y",
    valid_type: "",
    is_required: "Y",
    is_kabkota: "N",
    is_prov: "N",
    size: "", // Tambahan kolom size
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; nama: string } | null>(null);

  const { data: jalurRes } = useQuery({
    queryKey: ["master-jalur-list-all"],
    queryFn: () => jalurMasterService.getPaginated(1, "", 100), 
    refetchOnWindowFocus: false,
  });
  const listJalur = jalurRes?.data?.result || [];

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
    queryKey: ["master-dokumen-khusus", page, debouncedSearch],
    queryFn: () => dokumenKhususService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const createMutation = useMutation({
    mutationFn: () => dokumenKhususService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan dokumen khusus");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-khusus"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => dokumenKhususService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil memperbarui dokumen khusus");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-khusus"] });
    },
    onError: () => toast.error("Gagal memperbarui data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => dokumenKhususService.delete(id),
    onSuccess: () => {
      toast.success("Dokumen khusus berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-khusus"] });
    },
    onError: () => {
      toast.error("Gagal menghapus data");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
    },
  });

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      id_jalur: listJalur.length > 0 ? listJalur[0].id : 0, 
      persyaratan: "",
      status_aktif: "Y",
      valid_type: "",
      is_required: "Y",
      is_kabkota: "N",
      is_prov: "N",
      size: "", // Reset field size
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IDokumenKhusus) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({
      id_jalur: data.id_jalur,
      persyaratan: data.persyaratan,
      status_aktif: data.status_aktif,
      valid_type: data.valid_type || "",
      is_required: data.is_required,
      is_kabkota: data.is_kabkota || "N",
      is_prov: data.is_prov || "N",
      size: data.size || "", // Set field size jika ada
    });
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
    if (!formData.persyaratan.trim()) return toast.warning("Nama Dokumen wajib diisi");
    if (!formData.id_jalur || formData.id_jalur === 0) return toast.warning("Jalur wajib dipilih");
    
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
        <CustBreadcrumb items={[{ name: "Master Dokumen", url: "/master/dokumen-khusus" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <FileKey className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master Dokumen Khusus</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola persyaratan dokumen spesifik berdasarkan jalur pendaftaran.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreate} 
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Dokumen
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Dokumen Khusus</CardTitle>
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
          <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 max-w-md overflow-hidden">
            <DialogHeader className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {modalMode === "create" ? "Tambah Dokumen" : "Ubah Dokumen"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Lengkapi informasi persyaratan dokumen khusus per-jalur di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              <div className="space-y-2">
                <Label htmlFor="id_jalur" className="text-sm font-bold text-slate-700 ml-1">Pilih Jalur Pendaftaran</Label>
                <select
                  id="id_jalur"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-700 appearance-none"
                  value={formData.id_jalur}
                  onChange={(e) => setFormData({ ...formData, id_jalur: Number(e.target.value) })}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23059669' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: `right 1rem center`,
                    backgroundRepeat: `no-repeat`,
                    backgroundSize: `1.5em 1.5em`,
                  }}
                >
                  <option value={0} disabled>-- Pilih Jalur --</option>
                  {listJalur.map((j: any) => (
                    <option key={j.id} value={j.id}>{j.jalur}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="persyaratan" className="text-sm font-bold text-slate-700 ml-1">Nama / Deskripsi Dokumen</Label>
                <Textarea
                  id="persyaratan"
                  placeholder="Masukkan persyaratan dokumen..."
                  rows={3} 
                  className="resize-none rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50" 
                  value={formData.persyaratan}
                  onChange={(e) => setFormData({ ...formData, persyaratan: e.target.value })}
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status_aktif" className="text-sm font-bold text-slate-700 ml-1">Status Aktif</Label>
                  <select
                    id="status_aktif"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.status_aktif}
                    onChange={(e) => setFormData({ ...formData, status_aktif: e.target.value as "Y" | "N" })}
                  >
                    <option value="Y">Aktif (Ya)</option>
                    <option value="N">Non-Aktif (Tidak)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_required" className="text-sm font-bold text-slate-700 ml-1">Wajib Diisi</Label>
                  <select
                    id="is_required"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.value as "Y" | "N" })}
                  >
                    <option value="Y">Wajib (Ya)</option>
                    <option value="N">Opsional (Tidak)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="is_kabkota" className="text-sm font-bold text-slate-700 ml-1">Berlaku Kab/Kota</Label>
                  <select
                    id="is_kabkota"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.is_kabkota}
                    onChange={(e) => setFormData({ ...formData, is_kabkota: e.target.value as "Y" | "N" })}
                  >
                    <option value="Y">Ya</option>
                    <option value="N">Tidak</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_prov" className="text-sm font-bold text-slate-700 ml-1">Berlaku Provinsi</Label>
                  <select
                    id="is_prov"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700"
                    value={formData.is_prov}
                    onChange={(e) => setFormData({ ...formData, is_prov: e.target.value as "Y" | "N" })}
                  >
                    <option value="Y">Ya</option>
                    <option value="N">Tidak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_type" className="text-sm font-bold text-slate-700 ml-1">Format (Extension)</Label>
                  <Input
                    id="valid_type"
                    placeholder="Cth: pdf, jpg, png"
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={formData.valid_type}
                    onChange={(e) => setFormData({ ...formData, valid_type: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size" className="text-sm font-bold text-slate-700 ml-1">Max Size (MB)</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="Contoh: 2"
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50">Batal</Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan</>
                  ) : "Simpan Data"}
                </Button>
              </div>
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
                <AlertDialogTitle className="text-2xl font-bold text-slate-900">Hapus Dokumen?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed mt-0">
                Apakah Anda yakin ingin menghapus <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.nama}</strong>? Seluruh data terkait dokumen ini akan hilang secara permanen.
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

export default DokumenKhususPage;