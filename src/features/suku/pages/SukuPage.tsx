import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sukuMasterService } from "@/services/sukuMasterService";
import { DataTable } from "@/components/DataTable";
import { getColumns } from "../components/columns";
import CustBreadcrumb from "@/components/CustBreadCrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { ISukuMaster } from "@/types/suku";

const SukuPage: React.FC = () => {
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
  
  const [formData, setFormData] = useState<{ nama_suku: string; is_active: "Y" | "N" }>({
    nama_suku: "",
    is_active: "Y",
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
    queryKey: ["master-suku", page, debouncedSearch],
    queryFn: () => sukuMasterService.getPaginated(page, debouncedSearch, limit),
    refetchOnWindowFocus: false,
  });

  const tableData = response?.data?.result || [];
  const totalPages = response?.data?.total_pages || 1;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: () => sukuMasterService.create(formData),
    onSuccess: () => {
      toast.success("Berhasil menambahkan data");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => toast.error("Gagal menambahkan data"),
  });

  const updateMutation = useMutation({
    mutationFn: () => sukuMasterService.update(selectedId!, formData),
    onSuccess: () => {
      toast.success("Berhasil mengubah data");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => toast.error("Gagal mengubah data"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sukuMasterService.delete(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus data");
      queryClient.invalidateQueries({ queryKey: ["master-suku"] });
    },
    onError: () => toast.error("Gagal menghapus data"),
  });

  // === HANDLERS ===
  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      nama_suku: "",
      is_active: "Y",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (data: ISukuMaster) => {
    setModalMode("edit");
    setSelectedId(data.id);
    setFormData({
      nama_suku: data.nama_suku,
      is_active: data.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus Suku ${nama}?`)) {
      deleteMutation.mutate(id);
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

  const columns = getColumns(page, limit, handleEditClick, handleDeleteClick);

  return (
    <div className="p-6 space-y-6">
      <CustBreadcrumb items={[{ name: "Master Suku", url: "/master/suku" }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Suku</h1>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah Data Suku
        </Button>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50/80 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Daftar Suku</CardTitle>
            {/* Input Search manual telah dihapus dari sini */}
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
              // Hubungkan state real-time (searchTerm) ke input UI DataTable
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
            <DialogTitle>{modalMode === "create" ? "Tambah Data Suku" : "Edit Suku"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="nama_suku">Nama Suku</Label>
              <Input
                id="nama_suku"
                value={formData.nama_suku}
                onChange={(e) => setFormData({ ...formData, nama_suku: e.target.value })}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="is_active">Status Aktif</Label>
              <select
                id="is_active"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as "Y" | "N" })}
              >
                <option value="Y">Ya</option>
                <option value="N">Tidak</option>
              </select>
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

export default SukuPage;