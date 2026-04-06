import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pekerjaanService } from "@/services/pekerjaanService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { IPekerjaan } from "@/types/pekerjaan";

const PekerjaanPage: React.FC = () => {
  const queryClient = useQueryClient();

  // === STATE DATA & FILTER ===
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const limit = 10;

  // === STATE MODAL ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nama_pekerjaan: "" });

  // === LOGIKA DEBOUNCE SEARCH ===
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchTerm) {
        setDebouncedSearch(searchTerm);
        setPage(1); // Reset ke halaman pertama saat pencarian berubah
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // === FETCH DATA ===
  const { data: response, isLoading } = useQuery({
    queryKey: ["pekerjaan", page, debouncedSearch],
    queryFn: () => pekerjaanService.getPaginated(page, debouncedSearch),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // === MUTATIONS ===
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
      toast.success("Berhasil menghapus data pekerjaan");
      queryClient.invalidateQueries({ queryKey: ["pekerjaan"] });
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  // === HANDLERS ===
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
    if (window.confirm(`Yakin ingin menghapus pekerjaan ${nama}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_pekerjaan.trim()) {
      return toast.warning("Nama pekerjaan tidak boleh kosong");
    }
    
    if (modalMode === "create") createMutation.mutate();
    else updateMutation.mutate();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedId(null);
    setFormData({ nama_pekerjaan: "" });
  };

  const columns = getColumns(page, limit, handleEditClick, handleDeleteClick);

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={[{ name: "Master Pekerjaan", url: "/master/pekerjaan" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Pekerjaan</h1>
          <p className="text-sm text-gray-500">Kelola data referensi pekerjaan.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah Data Pekerjaan
        </Button>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Pekerjaan</CardTitle>
            {/* Input Search manual telah dihapus dari sini */}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500 animate-pulse">Memuat data pekerjaan...</div>
          ) : (
            <DataTable
              columns={columns}
              data={tableData}
              pageCount={totalPages}
              pageIndex={page - 1}
              onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
              // Hubungkan state real-time (searchTerm) ke input UI DataTable
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL FORM */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Tambah Data Pekerjaan" : "Edit Pekerjaan"}</DialogTitle>
            <DialogDescription>
              Masukkan nama referensi pekerjaan yang valid.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama_pekerjaan">Nama Pekerjaan <span className="text-red-500">*</span></Label>
              <Input
                id="nama_pekerjaan"
                placeholder="Contoh: ASN, Wiraswasta, dll"
                value={formData.nama_pekerjaan}
                onChange={(e) => setFormData({ ...formData, nama_pekerjaan: e.target.value })}
                autoFocus
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PekerjaanPage;