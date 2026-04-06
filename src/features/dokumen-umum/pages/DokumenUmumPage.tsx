import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dokumenUmumService } from "@/services/dokumenUmumService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // <-- Tambahkan import Textarea
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { IDokumenUmum } from "@/types/dokumenUmum";

const DokumenUmumPage: React.FC = () => {
  const queryClient = useQueryClient();

  // === STATE DATA & FILTER ===
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  // === STATE MODAL EDIT ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<Omit<IDokumenUmum, "id" | "created_at" | "updated_at">>({
    persyaratan: "",
    status_aktif: "Y",
    valid_type: "",
    is_required: "Y",
  });

  // === LOGIKA DEBOUNCE SEARCH ===
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1); // Reset ke halaman pertama setiap kali pencarian berubah
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // === FETCHING DATA ===
  const { data: response, isLoading } = useQuery({
    queryKey: ["master-dokumen-umum", page, debouncedSearch],
    queryFn: () => dokumenUmumService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: () => dokumenUmumService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-umum"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => dokumenUmumService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-umum"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => dokumenUmumService.delete(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus data");
      queryClient.invalidateQueries({ queryKey: ["master-dokumen-umum"] });
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  // === HANDLERS ===
  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      persyaratan: "",
      status_aktif: "Y",
      valid_type: "",
      is_required: "Y",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IDokumenUmum) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({
      persyaratan: data.persyaratan,
      status_aktif: data.status_aktif,
      valid_type: data.valid_type,
      is_required: data.is_required,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus ${nama}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.persyaratan.trim()) {
      return toast.warning("Nama Dokumen wajib diisi");
    }
    
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({
      persyaratan: "",
      status_aktif: "Y",
      valid_type: "",
      is_required: "Y",
    });
  };

  const columns = getColumns(page, limit, handleEditClick, handleDeleteClick);

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={[{ name: "Master Dokumen Umum", url: "/master/dokumen-umum" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Dokumen Umum</h1>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah Data Dokumen Umum
        </Button>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Dokumen</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">Memuat data...</div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL CREATE / EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Tambah Data Dokumen" : "Edit Dokumen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="persyaratan">Nama Dokumen</Label>
              {/* === DIGANTI MENJADI TEXTAREA === */}
              <Textarea
                id="persyaratan"
                placeholder="Masukkan deskripsi atau persyaratan dokumen..."
                rows={3} // Atur jumlah baris default (bisa diubah sesuai selera)
                className="resize-none" // Hapus ini kalau kamu mau user bisa narik text areanya
                value={formData.persyaratan}
                onChange={(e) => setFormData({ ...formData, persyaratan: e.target.value })}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status_aktif">Status Aktif</Label>
              <select
                id="status_aktif"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status_aktif}
                onChange={(e) => setFormData({ ...formData, status_aktif: e.target.value as "Y" | "N" })}
              >
                <option value="Y">Ya</option>
                <option value="N">Tidak</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_required">Wajib Isi</Label>
              <select
                id="is_required"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.value as "Y" | "N" })}
              >
                <option value="Y">Ya</option>
                <option value="N">Tidak</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_type">Type File</Label>
              <Input
                id="valid_type"
                placeholder="Contoh: pdf,jpg,png"
                value={formData.valid_type}
                onChange={(e) => setFormData({ ...formData, valid_type: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DokumenUmumPage;