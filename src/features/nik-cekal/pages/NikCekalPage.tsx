/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nikCekalService } from "@/services/nikCekalService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, UserX, Trash2, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { INikCekal } from "@/types/nikCekal";

const NikCekalPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    nik: "", 
    nama: "", 
    tahun: new Date().getFullYear().toString(),
    keterangan: "",
    is_aktif: "Y" as "Y" | "N"
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; identitas: string } | null>(null);

  // Array untuk pilihan tahun (2026 mundur ke 2021)
  const listTahun = [2026, 2025, 2024, 2023, 2022, 2021];

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
    queryKey: ["nik-cekal", page, debouncedSearch],
    queryFn: () => nikCekalService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  const createMutation = useMutation({
    mutationFn: () => nikCekalService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan NIK Cekal");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["nik-cekal"] });
    },
    onError: (error: any) => {
        const errMsg = error?.response?.data?.message || "Gagal menambahkan data";
        toast.error(errMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => nikCekalService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data NIK Cekal");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["nik-cekal"] });
    },
    onError: (error: any) => {
        const errMsg = error?.response?.data?.message || "Gagal mengubah data";
        toast.error(errMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => nikCekalService.delete(id),
    onSuccess: () => {
      toast.success("Data NIK Cekal berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setDeleteData(null);
      queryClient.invalidateQueries({ queryKey: ["nik-cekal"] });
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
      nik: "", 
      nama: "", 
      tahun: new Date().getFullYear().toString(), 
      keterangan: "",
      is_aktif: "Y"
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: INikCekal) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({ 
        nik: data.nik, 
        nama: data.nama || "", 
        tahun: data.tahun || new Date().getFullYear().toString(),
        keterangan: data.keterangan || "",
        is_aktif: data.is_aktif || "Y"
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, identitas: string) => {
    setDeleteData({ id, identitas });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteData) deleteMutation.mutate(deleteData.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nik.trim()) return toast.warning("NIK tidak boleh kosong");
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({ 
      nik: "", 
      nama: "", 
      tahun: new Date().getFullYear().toString(), 
      keterangan: "",
      is_aktif: "Y" 
    });
  };

  const columns = useMemo(() => getColumns(page, limit, handleEditClick, handleDeleteClick), [page, limit]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-screen-2xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 pt-6">
        <CustBreadcrumb items={[{ name: "Master NIK Cekal", url: "/master/nik-cekal" }]} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 hidden sm:block">
              <UserX className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Master NIK Cekal</h1>
              <p className="text-sm text-slate-500 mt-1">Kelola data daftar hitam NIK pendaftar.</p>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreate} 
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah NIK Cekal
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-400"></div>
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-5 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl font-bold text-slate-800">Daftar NIK Cekal</CardTitle>
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

        {/* Modal Form */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl p-6 sm:p-8 max-w-md">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {modalMode === "create" ? "Tambah Data Cekal" : "Ubah Data Cekal"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Masukkan detail NIK yang diblokir untuk sistem pendaftaran.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nik" className="text-sm font-bold text-slate-700 ml-1">NIK <span className="text-red-500">*</span></Label>
                <Input
                  id="nik"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="Masukkan 16 digit NIK"
                  maxLength={16}
                  className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="nama" className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama pemilik NIK"
                    className="h-12 rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50"
                  />
                </div>
                {/* === UPDATE DI SINI: MENGUBAH INPUT MENJADI SELECT === */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="tahun" className="text-sm font-bold text-slate-700 ml-1">Tahun</Label>
                  <select
                    id="tahun"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.75rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.2em 1.2em`,
                    }}
                  >
                    {listTahun.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {/* === AKHIR UPDATE === */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="keterangan" className="text-sm font-bold text-slate-700 ml-1">Keterangan (Opsional)</Label>
                <Textarea
                  id="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Mundur saat proses rekomtek"
                  className="min-h-[100px] rounded-xl border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base px-4 bg-slate-50/50 resize-none"
                />
              </div>
              
              {/* Checkbox Status Aktif */}
              <div className="flex items-center space-x-2 pt-2 ml-1">
                <Checkbox 
                  id="is_aktif" 
                  checked={formData.is_aktif === "Y"}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_aktif: checked ? "Y" : "N" })}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white border-slate-300"
                />
                <Label 
                  htmlFor="is_aktif" 
                  className="text-sm font-bold text-slate-700 cursor-pointer select-none"
                >
                  Aktif Cekal (Berlaku)
                </Label>
              </div>

              <DialogFooter className="gap-2 sm:gap-3 mt-6 pt-2">
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
                  disabled={createMutation.isPending || updateMutation.isPending || !formData.nik.trim()}
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
                Apakah Anda yakin ingin menghapus data cekal untuk NIK <strong className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{deleteData?.identitas}</strong>? Tindakan ini tidak dapat dibatalkan.
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

export default NikCekalPage;